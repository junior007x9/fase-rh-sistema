// Arquivo: app/actions/ausencias.ts
"use server";

import { db } from "../../db/index";
import { periodosAquisitivos, eventosAusencia } from "../../db/schema";
import { getSessaoUsuario } from "./auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { registrarLogAuditoria } from "./auditoria";

// ==========================================
// 1. PERÍODOS AQUISITIVOS DE FÉRIAS
// ==========================================

export async function salvarPeriodoAquisitivo(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;
  const novoId = randomUUID();

  await db.insert(periodosAquisitivos).values({
    id: novoId,
    servidorId,
    dataInicio,
    dataFim,
    status: "PENDENTE",
    diasRestantes: 30, // Padrão da CLT/Estatuto
  });

  await registrarLogAuditoria("CRIAR", "periodos_aquisitivos", novoId, `Criou período aquisitivo de férias para o servidor (ID: ${servidorId})`);

  revalidatePath(`/servidores/${servidorId}/ausencias`);
  revalidatePath(`/ausencias`);
}

export async function atualizarPeriodoAquisitivo(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const id = formData.get("id") as string;
  const servidorId = formData.get("servidorId") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;

  try {
    await db.update(periodosAquisitivos).set({
      dataInicio,
      dataFim,
    }).where(eq(periodosAquisitivos.id, id));

    await registrarLogAuditoria("EDITAR", "periodos_aquisitivos", id, `Atualizou o período aquisitivo de férias (${dataInicio} a ${dataFim})`);
  } catch (error) {
    throw new Error("Erro ao atualizar o período aquisitivo.");
  }

  revalidatePath(`/servidores/${servidorId}/ausencias`);
  redirect(`/servidores/${servidorId}/ausencias`);
}

export async function excluirPeriodoAquisitivo(id: string, detalhes: string) {
  try {
    await db.delete(periodosAquisitivos).where(eq(periodosAquisitivos.id, id));
    await registrarLogAuditoria("EXCLUIR", "periodos_aquisitivos", id, `Excluiu o período aquisitivo: ${detalhes}`);
    
    revalidatePath(`/ausencias`);
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir o período aquisitivo." };
  }
}

// ==========================================
// 2. EVENTOS DE AUSÊNCIA / FÉRIAS
// ==========================================

export async function salvarEventoAusencia(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  let tipoAusencia = formData.get("tipoAusencia") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const observacao = formData.get("observacao") as string;
  const periodoAquisitivoId = formData.get("periodoAquisitivoId") as string | null;
  const cid = formData.get("cid") as string;
  
  // Pegamos dias (da nova tela) e dataFim (de telas antigas, por segurança)
  const diasStr = formData.get("dias") as string;
  let dataFim = formData.get("dataFim") as string;
  let dias: number | undefined = undefined;

  // Se houver Qtd Dias (vindo do nosso novo form), calculamos a DataFim automaticamente
  if (diasStr) {
    dias = parseInt(diasStr);
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataInicioObj);
    dataFimObj.setDate(dataFimObj.getDate() + dias - 1);
    dataFim = dataFimObj.toISOString().split('T')[0];
  }

  // REGRA DO INSS: Se for saúde e passar de 15 dias, vira INSS automático
  if (tipoAusencia === "SAUDE" && dias && dias > 15) {
    tipoAusencia = "AFASTAMENTO_SUPERIOR_15";
  }

  const novoId = randomUUID();

  await db.insert(eventosAusencia).values({
    id: novoId,
    servidorId,
    tipoAusencia: tipoAusencia as any,
    dataInicio,
    dataFim, // Inserida manualmente ou calculada acima
    dias,
    cid: cid ? cid.toUpperCase() : undefined,
    observacao,
    periodoAquisitivoId: periodoAquisitivoId || undefined,
  });

  if (tipoAusencia === "FERIAS" && periodoAquisitivoId) {
    await db.update(periodosAquisitivos)
      .set({ status: "GOZADO", diasRestantes: 0 })
      .where(eq(periodosAquisitivos.id, periodoAquisitivoId));
  }

  await registrarLogAuditoria("CRIAR", "eventos_ausencia", novoId, `Registrou nova ausência (${tipoAusencia}) para o servidor (ID: ${servidorId})`);

  revalidatePath(`/servidores/${servidorId}/ausencias`);
  revalidatePath(`/ausencias`);
}

export async function atualizarAusencia(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const id = formData.get("id") as string;
  const servidorId = formData.get("servidorId") as string;
  let tipoAusencia = formData.get("tipoAusencia") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const observacao = formData.get("observacao") as string;
  const periodoAquisitivoId = formData.get("periodoAquisitivoId") as string | null;
  const cid = formData.get("cid") as string;

  const diasStr = formData.get("dias") as string;
  let dataFim = formData.get("dataFim") as string;
  let dias: number | undefined = undefined;

  // Recalcula DataFim na Edição também
  if (diasStr) {
    dias = parseInt(diasStr);
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataInicioObj);
    dataFimObj.setDate(dataFimObj.getDate() + dias - 1);
    dataFim = dataFimObj.toISOString().split('T')[0];
  }

  // Regra INSS na edição
  if (tipoAusencia === "SAUDE" && dias && dias > 15) {
    tipoAusencia = "AFASTAMENTO_SUPERIOR_15";
  }

  try {
    await db.update(eventosAusencia).set({
      servidorId,
      tipoAusencia: tipoAusencia as any,
      dataInicio,
      dataFim,
      dias,
      cid: cid ? cid.toUpperCase() : undefined,
      observacao: observacao || null,
      periodoAquisitivoId: periodoAquisitivoId || undefined,
    }).where(eq(eventosAusencia.id, id));

    await registrarLogAuditoria("EDITAR", "eventos_ausencia", id, `Corrigiu o afastamento do tipo: ${tipoAusencia}`);
  } catch (error) {
    throw new Error("Erro ao atualizar o afastamento.");
  }

  revalidatePath(`/servidores/${servidorId}/ausencias`);
  revalidatePath("/ausencias");
  
  // Se veio da aba principal, mantemos lá. Se veio de dentro do servidor, voltamos.
  const referer = formData.get("refererUrl") as string;
  if (!referer) {
    redirect(`/ausencias`);
  } else {
    redirect(`/servidores/${servidorId}/ausencias`); 
  }
}

export async function excluirAusencia(id: string, detalhes: string) {
  try {
    await db.delete(eventosAusencia).where(eq(eventosAusencia.id, id));
    await registrarLogAuditoria("EXCLUIR", "eventos_ausencia", id, `Excluiu a ausência/licença: ${detalhes}`);
    
    revalidatePath("/ausencias");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir a ausência. Tente novamente." };
  }
}