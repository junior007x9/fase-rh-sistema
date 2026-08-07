// Arquivo: app/actions/historico.ts
"use server";

import { db } from "../../db/index";
import { historicoFuncional } from "../../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "./auditoria";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataInput } from "../utils/formatters";

export async function alocarServidor(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const cargoId = formData.get("cargoId") as string;
  const lotacaoId = formData.get("lotacaoId") as string;
  
  // BLINDAGEM DE DATAS E TEXTOS
  const dataInicio = formatarDataInput(formData.get("dataInicio") as string);
  const observacao = (formData.get("observacao") as string)?.trim().toUpperCase();

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

    const novoId = randomUUID();

    // 2. Inserir a nova alocação
    await db.insert(historicoFuncional).values({
      id: novoId,
      servidorId,
      cargoId,
      lotacaoId,
      dataInicio,
      observacao: observacao || null,
    });

    await registrarLogAuditoria("CRIAR", "historico_funcional", novoId, `Registrou nova alocação/movimentação funcional para o servidor`);

    revalidatePath(`/servidores/${servidorId}`);
  } catch (error) {
    console.error("Erro ao alocar servidor:", error);
    throw new Error("Falha ao registrar alteração funcional.");
  }
}