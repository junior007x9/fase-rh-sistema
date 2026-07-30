// Arquivo: app/actions/anexos.ts
"use server";

import { db } from "../../db/index";
import { enderecos, dadosBancarios } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarLogAuditoria } from "./auditoria";

// ==========================================
// ENDEREÇO
// ==========================================

export async function salvarEndereco(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const logradouro = formData.get("logradouro") as string;
  const numero = formData.get("numero") as string;
  const bairro = formData.get("bairro") as string;
  const cep = formData.get("cep") as string;
  const cidade = formData.get("cidade") as string;
  const estado = formData.get("estado") as string || "MA";
  const novoId = randomUUID();

  await db.insert(enderecos).values({
    id: novoId,
    servidorId,
    logradouro,
    numero,
    bairro,
    cep,
    cidade,
    estado,
  });

  await registrarLogAuditoria("CRIAR", "enderecos", novoId, `Cadastrou o endereço do servidor (ID: ${servidorId})`);
  revalidatePath(`/servidores/${servidorId}`);
}

export async function atualizarEndereco(formData: FormData) {
  const id = formData.get("id") as string;
  const servidorId = formData.get("servidorId") as string;
  const logradouro = formData.get("logradouro") as string;
  const numero = formData.get("numero") as string;
  const bairro = formData.get("bairro") as string;
  const cep = formData.get("cep") as string;
  const cidade = formData.get("cidade") as string;
  const estado = formData.get("estado") as string || "MA";

  try {
    await db.update(enderecos).set({
      logradouro,
      numero,
      bairro,
      cep,
      cidade,
      estado,
    }).where(eq(enderecos.id, id));

    await registrarLogAuditoria("EDITAR", "enderecos", id, `Atualizou o endereço do servidor (ID: ${servidorId})`);
  } catch (error) {
    throw new Error("Erro ao atualizar o endereço.");
  }

  revalidatePath(`/servidores/${servidorId}`);
  redirect(`/servidores/${servidorId}`);
}

export async function excluirEndereco(id: string, detalhes: string) {
  try {
    await db.delete(enderecos).where(eq(enderecos.id, id));
    await registrarLogAuditoria("EXCLUIR", "enderecos", id, `Excluiu o endereço: ${detalhes}`);
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir o endereço." };
  }
}

// ==========================================
// DADOS BANCÁRIOS
// ==========================================

export async function salvarContaBancaria(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const nomeTitular = formData.get("nomeTitular") as string;
  const banco = formData.get("banco") as string;
  const agencia = formData.get("agencia") as string;
  const conta = formData.get("conta") as string;
  const novoId = randomUUID();

  await db.insert(dadosBancarios).values({
    id: novoId,
    servidorId,
    nomeTitular,
    banco,
    agencia,
    conta,
  });

  await registrarLogAuditoria("CRIAR", "dados_bancarios", novoId, `Cadastrou os dados bancários do servidor (ID: ${servidorId})`);
  revalidatePath(`/servidores/${servidorId}`);
}

export async function atualizarContaBancaria(formData: FormData) {
  const id = formData.get("id") as string;
  const servidorId = formData.get("servidorId") as string;
  const nomeTitular = formData.get("nomeTitular") as string;
  const banco = formData.get("banco") as string;
  const agencia = formData.get("agencia") as string;
  const conta = formData.get("conta") as string;

  try {
    await db.update(dadosBancarios).set({
      nomeTitular,
      banco,
      agencia,
      conta,
    }).where(eq(dadosBancarios.id, id));

    await registrarLogAuditoria("EDITAR", "dados_bancarios", id, `Atualizou os dados bancários do servidor (ID: ${servidorId})`);
  } catch (error) {
    throw new Error("Erro ao atualizar os dados bancários.");
  }

  revalidatePath(`/servidores/${servidorId}`);
  redirect(`/servidores/${servidorId}`);
}

export async function excluirContaBancaria(id: string, detalhes: string) {
  try {
    await db.delete(dadosBancarios).where(eq(dadosBancarios.id, id));
    await registrarLogAuditoria("EXCLUIR", "dados_bancarios", id, `Excluiu os dados bancários: ${detalhes}`);
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir os dados bancários." };
  }
}