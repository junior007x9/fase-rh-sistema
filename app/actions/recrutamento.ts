// Arquivo: app/actions/recrutamento.ts
"use server";

import { db } from "../../db/index";
import { candidatos } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

// 1. Função para Cadastrar Novo Candidato
export async function registrarCandidato(formData: FormData) {
  const nome = formData.get("nome") as string;
  const cpf = formData.get("cpf") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const qualificacaoCurriculo = formData.get("qualificacaoCurriculo") as string;
  const areaAdaptacaoSugerida = formData.get("areaAdaptacaoSugerida") as string;

  if (!nome || !cpf || !email || !telefone) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  try {
    await db.insert(candidatos).values({
      id: randomUUID(),
      nome,
      cpf,
      email,
      telefone,
      qualificacaoCurriculo: qualificacaoCurriculo || null,
      areaAdaptacaoSugerida: areaAdaptacaoSugerida || null,
      status: "RESERVA", // Todo candidato entra como Cadastro de Reserva por padrão
    });

    revalidatePath("/recrutamento");
    revalidatePath("/"); // Atualiza o dashboard também
  } catch (error) {
    console.error("Erro ao registrar candidato:", error);
    throw new Error("Falha ao salvar candidato. Verifique se o CPF ou E-mail já existem.");
  }
}

// 2. Função para Alterar o Status (Ex: Convocar Candidato)
export async function atualizarStatusCandidato(formData: FormData) {
  const candidatoId = formData.get("candidatoId") as string;
  const novoStatus = formData.get("status") as "RESERVA" | "CONVOCADO" | "REJEITADO";

  if (!candidatoId || !novoStatus) return;

  try {
    await db.update(candidatos)
      .set({ 
        status: novoStatus,
        atualizadoEm: new Date().toISOString() 
      })
      .where(eq(candidatos.id, candidatoId));

    revalidatePath("/recrutamento");
    revalidatePath("/");
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw new Error("Falha ao atualizar o status do candidato.");
  }
}