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
import { EVENTOS_FOLHA, calcularDescontoFalta } from "../utils/calculosFolha";

// =========================================
// 1. REGISTRAR TRANSFERÊNCIA (Já existia)
// =========================================
export async function registrarTransferencia(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const lotacaoAnterior = formData.get("lotacaoAnterior") as string;
  const lotacaoNova = formData.get("lotacaoNova") as string;
  const dataOcorrencia = formData.get("dataOcorrencia") as string;
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
  const mesAno = formData.get("mesAno") as string;
  const codigoEvento = formData.get("codigoEvento") as string;
  const quantidadeStr = formData.get("quantidade") as string;
  const valorManualStr = formData.get("valorManual") as string;

  // Busca o servidor para pegar o salário base (usado nas fórmulas)
  const [srv] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  if (!srv) throw new Error("Servidor não encontrado");

  // Identifica qual evento foi selecionado (Falta, DSR, etc)
  const evento = Object.values(EVENTOS_FOLHA).find(e => e.codigo === codigoEvento);
  if (!evento) throw new Error("Evento inválido");

  const quantidade = quantidadeStr ? parseFloat(quantidadeStr) : null;
  let valorFinal = valorManualStr ? parseFloat(valorManualStr.replace(',', '.')) : 0;

  // MOTOR DE CÁLCULO PARAMETRIZADO
  // Se for FALTA (D001), aplica a fórmula: Salário / 30 * Dias de Falta
  if (codigoEvento === EVENTOS_FOLHA.FALTA.codigo && quantidade && srv.remuneracaoBase) {
    valorFinal = calcularDescontoFalta(srv.remuneracaoBase, quantidade);
  }

  // Se o valor final for 0 ou inválido, trava a inserção
  if (valorFinal <= 0) {
    throw new Error("O valor do lançamento deve ser maior que zero.");
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