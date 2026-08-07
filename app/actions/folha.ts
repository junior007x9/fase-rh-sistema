// Arquivo: app/actions/folha.ts
"use server";

import { db } from "../../db/index";
import { historicoTransferencias, servidores, lancamentosFolha } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessaoUsuario } from "./auth";
import { eq } from "drizzle-orm";
import { registrarLogAuditoria } from "./auditoria";
import { EVENTOS_FOLHA, calcularDescontoFalta, calcularDecimoTerceiro, calcularVerbasFerias, calcularVerbasRescisorias } from "../utils/calculosFolha";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataInput, formatarNumeroInput } from "../utils/formatters";

// =========================================
// 1. REGISTRAR TRANSFERÊNCIA (Já existia)
// =========================================
export async function registrarTransferencia(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const lotacaoAnterior = formData.get("lotacaoAnterior") as string;
  const lotacaoNova = formData.get("lotacaoNova") as string;
  
  // Blindagem de data
  const dataOcorrencia = formatarDataInput(formData.get("dataOcorrencia") as string);
  const motivo = formData.get("motivo") as string;

  try {
    await db.insert(historicoTransferencias).values({
      id: randomUUID(),
      servidorId,
      lotacaoAnterior,
      lotacaoNova,
      dataOcorrencia,
      motivo,
    });

    await db.update(servidores).set({ lotacao: lotacaoNova }).where(eq(servidores.id, servidorId));
    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Transferência registrada para: ${lotacaoNova}`);
  } catch (error) {
    throw new Error("Erro ao registrar transferência.");
  }

  revalidatePath(`/servidores/${servidorId}`);
  redirect(`/servidores/${servidorId}`);
}

// =========================================
// 2. ADICIONAR LANÇAMENTO NA FOLHA (NOVO)
// =========================================
export async function adicionarLancamentoFolha(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const mesAno = formData.get("mesAno") as string; // Ex: 07-2026 ou 13-2026
  const codigoEvento = formData.get("codigoEvento") as string;
  
  const [srv] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  if (!srv) throw new Error("Servidor não encontrado");

  const evento = Object.values(EVENTOS_FOLHA).find(e => e.codigo === codigoEvento);
  if (!evento) throw new Error("Evento inválido");

  // BLINDAGEM DE NÚMEROS E MOEDA
  const quantidadeFormato = formatarNumeroInput(formData.get("quantidade"));
  let quantidade = quantidadeFormato !== "" ? Number(quantidadeFormato) : null;
  
  const valorManualFormato = formatarNumeroInput(formData.get("valorManual"));
  let valorFinal = valorManualFormato !== "" ? Number(valorManualFormato) : 0;

  const anoReferencia = parseInt(mesAno.split('-')[1]);

  // MOTOR DE CÁLCULO PARAMETRIZADO
  if (codigoEvento === EVENTOS_FOLHA.FALTA.codigo && quantidade && srv.remuneracaoBase) {
    valorFinal = calcularDescontoFalta(srv.remuneracaoBase, quantidade);
  }

  // NOVO: Cálculo 13º Automático (Proporcional à admissão)
  if (codigoEvento === EVENTOS_FOLHA.DECIMO_TERCEIRO.codigo && srv.remuneracaoBase && srv.dataAdmissao) {
    const calculo = calcularDecimoTerceiro(srv.remuneracaoBase, srv.dataAdmissao, anoReferencia);
    quantidade = calculo.avos; // O campo "ref/quantidade" vira os "Avos" (ex: 10)
    valorFinal = calculo.valor;
  }

  if (valorFinal <= 0) {
    throw new Error("O valor do lançamento ou o tempo de serviço resulta em valor zero.");
  }

  try {
    await db.insert(lancamentosFolha).values({
      id: randomUUID(),
      servidorId,
      mesAno,
      codigoEvento,
      descricaoEvento: evento.nome,
      tipo: evento.tipo as "PROVENTO" | "DESCONTO",
      quantidadeReferencia: quantidade,
      valorFinal: Number(valorFinal.toFixed(2)),
    });

    await registrarLogAuditoria("CRIAR", "lancamentos_folha", servidorId, `Lançou ${evento.nome} na folha ${mesAno}`);
  } catch (error) {
    console.error(error);
    throw new Error("Erro ao salvar o lançamento.");
  }

  revalidatePath(`/folha/${servidorId}`);
}

// =========================================
// 3. EXCLUIR LANÇAMENTO DA FOLHA (NOVO)
// =========================================
export async function excluirLancamentoFolha(idLancamento: string, servidorId: string) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  try {
    await db.delete(lancamentosFolha).where(eq(lancamentosFolha.id, idLancamento));
    await registrarLogAuditoria("EXCLUIR", "lancamentos_folha", servidorId, `Excluiu lançamento da folha.`);
  } catch (error) {
    throw new Error("Erro ao excluir lançamento.");
  }
  
  revalidatePath(`/folha/${servidorId}`);
}

// =========================================
// 4. PROCESSAR FÉRIAS AUTOMÁTICAS
// =========================================
export async function processarFerias(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const mesAno = formData.get("mesAno") as string;
  
  // Blindagem de percentual de pensão
  const pensaoPercFormato = formatarNumeroInput(formData.get("pensaoPerc"));

  const [srv] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  if (!srv || !srv.remuneracaoBase || !srv.dataAdmissao) throw new Error("Dados do servidor incompletos.");

  const { avos, valorFerias, valorTerco, isIntegral } = calcularVerbasFerias(srv.remuneracaoBase, srv.dataAdmissao, mesAno);

  const inserir = async (codigo: string, desc: string, tipo: "PROVENTO"|"DESCONTO", valor: number, qtd: number | null) => {
    if (valor > 0) {
      await db.insert(lancamentosFolha).values({
        id: randomUUID(), servidorId, mesAno, codigoEvento: codigo, descricaoEvento: desc, tipo, quantidadeReferencia: qtd, valorFinal: valor
      });
    }
  };

  await inserir(EVENTOS_FOLHA.FERIAS.codigo, isIntegral ? `${EVENTOS_FOLHA.FERIAS.nome} (Integral)` : `${EVENTOS_FOLHA.FERIAS.nome} (Proporcional)`, "PROVENTO", valorFerias, isIntegral ? 30 : avos);
  await inserir(EVENTOS_FOLHA.FERIAS_TERCO.codigo, EVENTOS_FOLHA.FERIAS_TERCO.nome, "PROVENTO", valorTerco, null);

  if (pensaoPercFormato !== "") {
    const perc = Number(pensaoPercFormato);
    if (perc > 0) {
      const valorPensao = ((valorFerias + valorTerco) * perc) / 100;
      await inserir(EVENTOS_FOLHA.PENSAO.codigo, EVENTOS_FOLHA.PENSAO.nome, "DESCONTO", Number(valorPensao.toFixed(2)), perc);
    }
  }

  await registrarLogAuditoria("CRIAR", "lancamentos_folha", servidorId, `Gerou Férias Automáticas para ${mesAno}`);
  revalidatePath(`/folha/${servidorId}`);
  redirect(`/folha/${servidorId}?mesAno=${mesAno}`);
}

// =========================================
// 5. PROCESSAR RESCISÃO (Desligamento e Verbas)
// =========================================
export async function processarRescisao(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const dataDesligamento = formatarDataInput(formData.get("dataDesligamento") as string);
  const temFeriasVencidas = formData.get("feriasVencidas") === "sim";
  
  // BLINDAGEM DE MOEDA E PERCENTUAL
  const diferencaFormato = formatarNumeroInput(formData.get("diferencaSalario"));
  const pensaoPercFormato = formatarNumeroInput(formData.get("pensaoPerc"));

  const [srv] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  if (!srv || !srv.remuneracaoBase || !srv.dataAdmissao) throw new Error("Dados incompletos");

  // A Rescisão gera a folha no mês em que ele foi desligado
  const [ano, mes] = dataDesligamento.split('-');
  const mesAnoRescisao = `${mes}-${ano}`;

  // 1. O Sistema Desliga o Servidor Real Oficial
  await db.update(servidores)
    .set({ status: 'DESLIGADO', dataDesligamento, motivoDesligamento: 'Rescisão via Folha' })
    .where(eq(servidores.id, servidorId));

  // 2. Calcula as Verbas
  const verbas = calcularVerbasRescisorias(srv.remuneracaoBase, srv.dataAdmissao, dataDesligamento, temFeriasVencidas);

  const inserir = async (codigo: string, desc: string, tipo: "PROVENTO"|"DESCONTO", valor: number, qtd: number | null) => {
    if (valor > 0) {
      await db.insert(lancamentosFolha).values({
        id: randomUUID(), servidorId, mesAno: mesAnoRescisao, codigoEvento: codigo, descricaoEvento: desc, tipo, quantidadeReferencia: qtd, valorFinal: valor
      });
    }
  };

  await inserir(EVENTOS_FOLHA.RESCISAO_SALDO.codigo, EVENTOS_FOLHA.RESCISAO_SALDO.nome, "PROVENTO", verbas.saldoSalario, verbas.diasSaldo);
  await inserir(EVENTOS_FOLHA.RESCISAO_13.codigo, EVENTOS_FOLHA.RESCISAO_13.nome, "PROVENTO", verbas.valor13, verbas.avos13);
  await inserir(EVENTOS_FOLHA.RESCISAO_FERIAS_VENCIDAS.codigo, EVENTOS_FOLHA.RESCISAO_FERIAS_VENCIDAS.nome, "PROVENTO", verbas.valorFeriasVencidas, 30);
  await inserir(EVENTOS_FOLHA.RESCISAO_FERIAS_PROP.codigo, EVENTOS_FOLHA.RESCISAO_FERIAS_PROP.nome, "PROVENTO", verbas.valorFeriasProp, verbas.avosFeriasProp);
  await inserir(EVENTOS_FOLHA.RESCISAO_TERCO.codigo, EVENTOS_FOLHA.RESCISAO_TERCO.nome, "PROVENTO", verbas.valorTerco, null);
  
  const diferenca = diferencaFormato !== "" ? Number(diferencaFormato) : 0;
  if (diferenca > 0) await inserir(EVENTOS_FOLHA.DIFERENCA_SALARIO.codigo, EVENTOS_FOLHA.DIFERENCA_SALARIO.nome, "PROVENTO", diferenca, null);

  await inserir(EVENTOS_FOLHA.INSS.codigo, "INSS (Rescisão)", "DESCONTO", verbas.inss, null);
  await inserir(EVENTOS_FOLHA.IRRF.codigo, "IRRF (Rescisão)", "DESCONTO", verbas.irrf, null);

  if (pensaoPercFormato !== "") {
    const perc = Number(pensaoPercFormato);
    if (perc > 0) {
      // Pensão sobre Saldo, 13º e eventual Diferença (conforme lei)
      const basePensao = verbas.saldoSalario + verbas.valor13 + diferenca;
      const valorPensao = (basePensao * perc) / 100;
      await inserir(EVENTOS_FOLHA.PENSAO.codigo, EVENTOS_FOLHA.PENSAO.nome, "DESCONTO", Number(valorPensao.toFixed(2)), perc);
    }
  }

  await registrarLogAuditoria("CRIAR", "lancamentos_folha", servidorId, `Processou Rescisão em ${mesAnoRescisao}`);
  revalidatePath(`/folha/${servidorId}`);
  redirect(`/folha/${servidorId}?mesAno=${mesAnoRescisao}`);
}