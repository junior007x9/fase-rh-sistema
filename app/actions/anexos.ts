// Arquivo: app/actions/anexos.ts
"use server";

import { db } from "../../db/index";
import { enderecos, dadosBancarios, contatosEmergencia } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

// 1. Função para Salvar Endereço
export async function salvarEndereco(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  
  await db.insert(enderecos).values({
    id: randomUUID(),
    servidorId,
    logradouro: formData.get("logradouro") as string,
    numero: formData.get("numero") as string,
    complemento: formData.get("complemento") as string,
    bairro: formData.get("bairro") as string,
    cidade: formData.get("cidade") as string,
    estado: formData.get("estado") as string,
    cep: formData.get("cep") as string,
  });

  revalidatePath(`/servidores/${servidorId}`);
}

// 2. Função para Salvar Conta Bancária
export async function salvarContaBancaria(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  
  await db.insert(dadosBancarios).values({
    id: randomUUID(),
    servidorId,
    banco: formData.get("banco") as string,
    agencia: formData.get("agencia") as string,
    conta: formData.get("conta") as string,
    nomeTitular: formData.get("nomeTitular") as string,
  });

  revalidatePath(`/servidores/${servidorId}`);
}

// 3. Função para Salvar Contato de Emergência
export async function salvarContatoEmergencia(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  
  await db.insert(contatosEmergencia).values({
    id: randomUUID(),
    servidorId,
    nomeContato: formData.get("nomeContato") as string,
    parentesco: formData.get("parentesco") as string,
    telefone: formData.get("telefone") as string,
  });

  revalidatePath(`/servidores/${servidorId}`);
}