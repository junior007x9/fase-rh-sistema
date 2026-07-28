// Arquivo: app/actions/historico.ts
"use server";

import { db } from "../../db/index";
import { historicoFuncional } from "../../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function alocarServidor(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const cargoId = formData.get("cargoId") as string;
  const lotacaoId = formData.get("lotacaoId") as string;
  const dataInicio = formData.get("dataInicio") as string;
  const observacao = formData.get("observacao") as string;

  if (!servidorId || !cargoId || !lotacaoId || !dataInicio) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  try {
    // 1. Fechar a alocação atual (se houver alguma onde a data de fim é nula)
    // Isso garante o histórico imutável: o antigo encerra no dia em que o novo começa
    await db.update(historicoFuncional)
      .set({ dataFim: dataInicio })
      .where(
        and(
          eq(historicoFuncional.servidorId, servidorId),
          isNull(historicoFuncional.dataFim)
        )
      );

    // 2. Inserir a nova alocação
    await db.insert(historicoFuncional).values({
      id: randomUUID(),
      servidorId,
      cargoId,
      lotacaoId,
      dataInicio,
      observacao: observacao || null,
    });

    revalidatePath(`/servidores/${servidorId}`);
  } catch (error) {
    console.error("Erro ao alocar servidor:", error);
    throw new Error("Falha ao registrar alteração funcional.");
  }
}