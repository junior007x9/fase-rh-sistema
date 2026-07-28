// Arquivo: app/actions/ausencias.ts
"use server";

import { db } from "../../db/index";
import { periodosAquisitivos, eventosAusencia } from "../../db/schema";
import { getSessaoUsuario } from "./auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// 1. Criar Período Aquisitivo de Férias
export async function salvarPeriodoAquisitivo(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;

  await db.insert(periodosAquisitivos).values({
    id: randomUUID(),
    servidorId,
    dataInicio,
    dataFim,
    status: "PENDENTE",
    diasRestantes: 30, // Padrão da CLT/Estatuto
  });

  revalidatePath(`/servidores/${servidorId}/ausencias`);
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

  // Insere o evento de ausência
  await db.insert(eventosAusencia).values({
    id: randomUUID(),
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

  revalidatePath(`/servidores/${servidorId}/ausencias`);
}