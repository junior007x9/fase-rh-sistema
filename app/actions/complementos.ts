// Arquivo: app/actions/complementos.ts
"use server";

import { db } from "../../db/index";
import { dependentesPensionistas, servidores } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSessaoUsuario } from "./auth";

export async function salvarDependente(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as "DEPENDENTE" | "PENSIONISTA";
  const parentesco = formData.get("parentesco") as string;
  const documentoReferencia = formData.get("documentoReferencia") as string;

  await db.insert(dependentesPensionistas).values({
    id: randomUUID(),
    servidorId,
    nome,
    tipo,
    parentesco,
    documentoReferencia: documentoReferencia || null,
  });

  revalidatePath(`/servidores/${servidorId}`);
}

export async function registrarDesligamento(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("servidorId") as string;
  const dataDesligamento = formData.get("dataDesligamento") as string;
  const motivoDesligamento = formData.get("motivoDesligamento") as string;
  const numeroProcessoDesligamento = formData.get("numeroProcessoDesligamento") as string;

  await db.update(servidores)
    .set({
      dataDesligamento,
      motivoDesligamento,
      numeroProcessoDesligamento,
      status: "DESLIGADO",
      atualizadoEm: new Date().toISOString()
    })
    .where(eq(servidores.id, servidorId));

  revalidatePath(`/servidores/${servidorId}`);
  revalidatePath(`/servidores`);
}