// Arquivo: app/actions/ausencias.ts
"use server";

import { db } from "../../db/index";
import { periodosAquisitivos, eventosAusencia } from "../../db/schema";
import { getSessaoUsuario } from "./auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { registrarLogAuditoria } from "./auditoria"; // <-- Importação da auditoria adicionada

// 1. Criar Período Aquisitivo de Férias
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

  // Registra na auditoria
  await registrarLogAuditoria("CRIAR", "periodos_aquisitivos", novoId, `Criou período aquisitivo de férias para o servidor (ID: ${servidorId})`);

  revalidatePath(`/servidores/${servidorId}/ausencias`);
  revalidatePath(`/ausencias`);
}

// 2. Registrar Ausência / Gozo de Férias
export async function salvarEventoAusencia(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const tipoAusencia = formData.get("tipoAusencia") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;
  const observacao = formData.get("observacao") as string;
  const periodoAquisitivoId = formData.get("periodoAquisitivoId") as string | null;
  const novoId = randomUUID();

  // Insere o evento de ausência
  await db.insert(eventosAusencia).values({
    id: novoId,
    servidorId,
    tipoAusencia: tipoAusencia as any,
    dataInicio,
    dataFim,
    observacao,
    periodoAquisitivoId: periodoAquisitivoId || undefined,
  });

  // Se for FÉRIAS e estiver vinculada a um período, atualiza o status do período
  if (tipoAusencia === "FERIAS" && periodoAquisitivoId) {
    // Para simplificar, marcaremos como GOZADO. Num sistema complexo, calcularíamos os dias.
    await db.update(periodosAquisitivos)
      .set({ status: "GOZADO", diasRestantes: 0 })
      .where(eq(periodosAquisitivos.id, periodoAquisitivoId));
  }

  // Registra na auditoria
  await registrarLogAuditoria("CRIAR", "eventos_ausencia", novoId, `Registrou nova ausência (${tipoAusencia}) para o servidor (ID: ${servidorId})`);

  revalidatePath(`/servidores/${servidorId}/ausencias`);
  revalidatePath(`/ausencias`);
}

// 3. Excluir Ausência (A nova função com Auditoria)
export async function excluirAusencia(id: string, detalhes: string) {
  try {
    await db.delete(eventosAusencia).where(eq(eventosAusencia.id, id));
    
    // Registra na auditoria quem excluiu e o que foi excluído
    await registrarLogAuditoria("EXCLUIR", "eventos_ausencia", id, `Excluiu a ausência/licença: ${detalhes}`);
    
    revalidatePath("/ausencias");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir a ausência. Tente novamente." };
  }
}