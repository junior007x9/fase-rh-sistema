// Arquivo: app/actions/ferias.ts
"use server";

import { db } from "../../db/index";
import { eventosAusencia } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function registrarAusencia(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const tipoAusencia = formData.get("tipoAusencia") as "FERIAS" | "LICENCA_MATERNIDADE" | "SAUDE" | "LICENCA_PREMIO" | "AFASTAMENTO_SUPERIOR_15";
  const dataInicio = formData.get("dataInicio") as string;
  const dataFim = formData.get("dataFim") as string;
  const observacao = formData.get("observacao") as string;

  if (!servidorId || !tipoAusencia || !dataInicio || !dataFim) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  try {
    await db.insert(eventosAusencia).values({
      id: randomUUID(),
      servidorId,
      tipoAusencia,
      dataInicio,
      dataFim,
      observacao: observacao || null,
    });

    // Atualiza a página para mostrar o novo registro imediatamente
    revalidatePath("/ferias");
  } catch (error) {
    console.error("Erro ao registrar ausência:", error);
    throw new Error("Falha ao salvar o evento de ausência.");
  }
}