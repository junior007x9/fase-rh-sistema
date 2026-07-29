// Arquivo: app/actions/recrutamento.ts
"use server";

import { db } from "../../db/index";
import { candidatos } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // <-- NOVA IMPORTAÇÃO
import { registrarLogAuditoria } from "./auditoria";

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
    const novoId = randomUUID();
    
    await db.insert(candidatos).values({
      id: novoId,
      nome,
      cpf,
      email,
      telefone,
      qualificacaoCurriculo: qualificacaoCurriculo || null,
      areaAdaptacaoSugerida: areaAdaptacaoSugerida || null,
      status: "RESERVA",
    });

    await registrarLogAuditoria("CRIAR", "candidatos", novoId, `Cadastrou o candidato: ${nome} (CPF: ${cpf})`);

    revalidatePath("/recrutamento");
    revalidatePath("/");
  } catch (error) {
    console.error("Erro ao registrar candidato:", error);
    throw new Error("Falha ao salvar candidato. Verifique se o CPF ou E-mail já existem.");
  }
}

// 2. Função para Alterar o Status
export async function atualizarStatusCandidato(formData: FormData) {
  const candidatoId = formData.get("candidatoId") as string;
  const novoStatus = formData.get("status") as "RESERVA" | "CONVOCADO" | "REJEITADO";

  if (!candidatoId || !novoStatus) return;

  try {
    await db.update(candidatos)
      .set({ status: novoStatus, atualizadoEm: new Date().toISOString() })
      .where(eq(candidatos.id, candidatoId));

    await registrarLogAuditoria("EDITAR", "candidatos", candidatoId, `Atualizou o status do candidato para: ${novoStatus}`);

    revalidatePath("/recrutamento");
    revalidatePath("/");
  } catch (error) {
    throw new Error("Falha ao atualizar o status do candidato.");
  }
}

// 3. Função para Excluir Candidato
export async function excluirCandidato(id: string, nome: string) {
  try {
    await db.delete(candidatos).where(eq(candidatos.id, id));
    await registrarLogAuditoria("EXCLUIR", "candidatos", id, `Excluiu o candidato: ${nome}`);
    revalidatePath("/recrutamento");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir o candidato. Tente novamente." };
  }
}

// ==========================================
// 4. NOVA FUNÇÃO: ATUALIZAR DADOS COMPLETOS (EDIÇÃO)
// ==========================================
export async function atualizarDadosCandidato(formData: FormData) {
  const id = formData.get("id") as string;
  const nome = formData.get("nome") as string;
  const cpf = formData.get("cpf") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const qualificacaoCurriculo = formData.get("qualificacaoCurriculo") as string;
  const areaAdaptacaoSugerida = formData.get("areaAdaptacaoSugerida") as string;

  try {
    await db.update(candidatos).set({
      nome,
      cpf,
      email,
      telefone,
      qualificacaoCurriculo: qualificacaoCurriculo || null,
      areaAdaptacaoSugerida: areaAdaptacaoSugerida || null,
      atualizadoEm: new Date().toISOString()
    }).where(eq(candidatos.id, id));

    await registrarLogAuditoria("EDITAR", "candidatos", id, `Corrigiu os dados do candidato: ${nome}`);
  } catch (error) {
    throw new Error("Falha ao atualizar os dados do candidato.");
  }

  // O redirect precisa ficar fora do try/catch no Next.js
  revalidatePath("/recrutamento");
  redirect("/recrutamento"); 
}