// Arquivo: app/actions/folha.ts
"use server";

import { db } from "../../db/index";
import { historicoTransferencias, servidores } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSessaoUsuario } from "./auth";
import { eq } from "drizzle-orm";
import { registrarLogAuditoria } from "./auditoria";

export async function registrarTransferencia(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const lotacaoAnterior = formData.get("lotacaoAnterior") as string;
  const lotacaoNova = formData.get("lotacaoNova") as string;
  const dataOcorrencia = formData.get("dataOcorrencia") as string;
  const motivo = formData.get("motivo") as string;

  try {
    // 1. Salva o registro no Histórico
    await db.insert(historicoTransferencias).values({
      id: randomUUID(),
      servidorId,
      lotacaoAnterior,
      lotacaoNova,
      dataOcorrencia,
      motivo,
    });

    // 2. Atualiza a lotação ATUAL do servidor na tabela principal (sem duplicar dados!)
    await db.update(servidores)
      .set({ lotacao: lotacaoNova })
      .where(eq(servidores.id, servidorId));

    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Transferência registrada para: ${lotacaoNova}`);
  } catch (error) {
    throw new Error("Erro ao registrar transferência.");
  }

  revalidatePath(`/servidores/${servidorId}`);
}