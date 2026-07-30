// Arquivo: app/actions/complementos.ts
"use server";

import { db } from "../../db/index";
import { dependentesPensionistas, servidores } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarLogAuditoria } from "./auditoria";

// ==========================================
// DEPENDENTES E PENSIONISTAS
// ==========================================

export async function salvarDependente(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as "DEPENDENTE" | "PENSIONISTA";
  const parentesco = formData.get("parentesco") as string;
  const documentoReferencia = formData.get("documentoReferencia") as string;
  const novoId = randomUUID();

  try {
    await db.insert(dependentesPensionistas).values({
      id: novoId,
      servidorId,
      nome,
      tipo,
      parentesco,
      documentoReferencia: documentoReferencia || null,
    });

    await registrarLogAuditoria("CRIAR", "dependentes_pensionistas", novoId, `Adicionou o dependente/pensionista: ${nome} para o servidor`);
  } catch (error) {
    throw new Error("Erro ao salvar o dependente.");
  }

  revalidatePath(`/servidores/${servidorId}`);
}

export async function atualizarDependente(formData: FormData) {
  const id = formData.get("id") as string;
  const servidorId = formData.get("servidorId") as string;
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as "DEPENDENTE" | "PENSIONISTA";
  const parentesco = formData.get("parentesco") as string;
  const documentoReferencia = formData.get("documentoReferencia") as string;

  try {
    await db.update(dependentesPensionistas).set({
      nome,
      tipo,
      parentesco,
      documentoReferencia: documentoReferencia || null,
    }).where(eq(dependentesPensionistas.id, id));

    await registrarLogAuditoria("EDITAR", "dependentes_pensionistas", id, `Atualizou os dados do dependente: ${nome}`);
  } catch (error) {
    throw new Error("Erro ao atualizar o dependente.");
  }

  revalidatePath(`/servidores/${servidorId}`);
  redirect(`/servidores/${servidorId}`);
}

export async function excluirDependente(id: string, detalhes: string) {
  try {
    await db.delete(dependentesPensionistas).where(eq(dependentesPensionistas.id, id));
    await registrarLogAuditoria("EXCLUIR", "dependentes_pensionistas", id, `Excluiu o dependente: ${detalhes}`);
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir o dependente." };
  }
}

// ==========================================
// DESLIGAMENTO INSTITUCIONAL
// ==========================================

export async function registrarDesligamento(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const dataDesligamento = formData.get("dataDesligamento") as string;
  const motivoDesligamento = formData.get("motivoDesligamento") as string;
  const numeroProcessoDesligamento = formData.get("numeroProcessoDesligamento") as string;

  try {
    await db.update(servidores).set({
      status: "DESLIGADO",
      dataDesligamento,
      motivoDesligamento,
      numeroProcessoDesligamento: numeroProcessoDesligamento || null,
    }).where(eq(servidores.id, servidorId));

    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Registrou o desligamento institucional do servidor`);
  } catch (error) {
    throw new Error("Erro ao registrar o desligamento.");
  }

  revalidatePath(`/servidores/${servidorId}`);
  revalidatePath("/servidores");
}

export async function atualizarDesligamento(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const dataDesligamento = formData.get("dataDesligamento") as string;
  const motivoDesligamento = formData.get("motivoDesligamento") as string;
  const numeroProcessoDesligamento = formData.get("numeroProcessoDesligamento") as string;

  try {
    await db.update(servidores).set({
      dataDesligamento,
      motivoDesligamento,
      numeroProcessoDesligamento: numeroProcessoDesligamento || null,
    }).where(eq(servidores.id, servidorId));

    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Atualizou os dados de desligamento do servidor`);
  } catch (error) {
    throw new Error("Erro ao atualizar o desligamento.");
  }

  revalidatePath(`/servidores/${servidorId}`);
  redirect(`/servidores/${servidorId}`);
}

// Excluir o desligamento significa reativar o servidor
export async function excluirDesligamento(servidorId: string, detalhes: string) {
  try {
    await db.update(servidores).set({
      status: "ATIVO",
      dataDesligamento: null,
      motivoDesligamento: null,
      numeroProcessoDesligamento: null,
    }).where(eq(servidores.id, servidorId));

    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Reativou o servidor (Cancelou desligamento)`);
    
    revalidatePath(`/servidores/${servidorId}`);
    revalidatePath("/servidores");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao cancelar o desligamento." };
  }
}