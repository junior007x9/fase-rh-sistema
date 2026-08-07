// Arquivo: app/actions/cargos-lotacoes.ts
"use server";

import { db } from "../../db/index";
import { cargos, lotacoes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { registrarLogAuditoria } from "./auditoria";

// ==========================================
// AÇÕES PARA CARGOS
// ==========================================

export async function criarCargo(formData: FormData) {
  const nomeRaw = formData.get("nome") as string;
  if (!nomeRaw) return { erro: "Nome é obrigatório." };

  // BLINDAGEM: Remove espaços no final/início e padroniza tudo em maiúsculo
  const nomeLimpo = nomeRaw.trim().toUpperCase();

  try {
    const novoId = randomUUID();
    await db.insert(cargos).values({ id: novoId, nome: nomeLimpo });
    
    // Registra na auditoria
    await registrarLogAuditoria("CRIAR", "cargos", novoId, `Criou o cargo: ${nomeLimpo}`);
    
    revalidatePath("/cargos-lotacoes");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao criar cargo. Talvez já exista." };
  }
}

export async function atualizarCargo(id: string, novoNome: string) {
  if (!novoNome) return { erro: "Nome é obrigatório." };

  // BLINDAGEM: Remove espaços no final/início e padroniza
  const nomeLimpo = novoNome.trim().toUpperCase();

  try {
    await db.update(cargos).set({ nome: nomeLimpo }).where(eq(cargos.id, id));
    
    // Registra na auditoria
    await registrarLogAuditoria("EDITAR", "cargos", id, `Atualizou o cargo para: ${nomeLimpo}`);
    
    revalidatePath("/cargos-lotacoes");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao atualizar cargo." };
  }
}

export async function excluirCargo(id: string, nomeAntigo: string) {
  try {
    await db.delete(cargos).where(eq(cargos.id, id));
    
    // Registra na auditoria
    await registrarLogAuditoria("EXCLUIR", "cargos", id, `Excluiu o cargo: ${nomeAntigo}`);
    
    revalidatePath("/cargos-lotacoes");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir cargo. Pode estar vinculado a um servidor." };
  }
}

// ==========================================
// AÇÕES PARA LOTAÇÕES
// ==========================================

export async function criarLotacao(formData: FormData) {
  const nomeRaw = formData.get("nome") as string;
  const siglaRaw = formData.get("sigla") as string;
  
  if (!nomeRaw || !siglaRaw) return { erro: "Nome e sigla são obrigatórios." };

  // BLINDAGEM: Formata os textos
  const nomeLimpo = nomeRaw.trim().toUpperCase();
  const siglaLimpa = siglaRaw.trim().toUpperCase();

  try {
    const novoId = randomUUID();
    await db.insert(lotacoes).values({ id: novoId, nome: nomeLimpo, sigla: siglaLimpa });
    
    await registrarLogAuditoria("CRIAR", "lotacoes", novoId, `Criou a lotação: ${siglaLimpa} - ${nomeLimpo}`);
    
    revalidatePath("/cargos-lotacoes");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao criar lotação." };
  }
}

export async function excluirLotacao(id: string, siglaAntiga: string) {
  try {
    await db.delete(lotacoes).where(eq(lotacoes.id, id));
    
    await registrarLogAuditoria("EXCLUIR", "lotacoes", id, `Excluiu a lotação: ${siglaAntiga}`);
    
    revalidatePath("/cargos-lotacoes");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir lotação." };
  }
}

export async function atualizarLotacao(id: string, novoNome: string) {
  if (!novoNome) return { erro: "Nome é obrigatório." };
  
  // BLINDAGEM: Formata os textos
  const nomeLimpo = novoNome.trim().toUpperCase();

  try {
    await db.update(lotacoes).set({ nome: nomeLimpo }).where(eq(lotacoes.id, id));
    
    // O espião da auditoria entra em ação!
    await registrarLogAuditoria("EDITAR", "lotacoes", id, `Atualizou a lotação para: ${nomeLimpo}`);
    
    revalidatePath("/cargos-lotacoes");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao atualizar lotação." };
  }
}