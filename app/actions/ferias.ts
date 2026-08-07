// Arquivo: app/actions/ferias.ts
"use server";

import { db } from "../../db/index";
import { eventosAusencia } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; 
import { registrarLogAuditoria } from "./auditoria"; 

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataInput } from "../utils/formatters";

// 1. Função Original: REGISTRAR
export async function registrarAusencia(formData: FormData) {
  const servidorId = formData.get("servidorId") as string;
  const tipoAusencia = formData.get("tipoAusencia") as "FERIAS" | "LICENCA_MATERNIDADE" | "SAUDE" | "LICENCA_PREMIO" | "AFASTAMENTO_SUPERIOR_15";
  
  // BLINDAGEM DE DATAS E TEXTOS
  const dataInicio = formatarDataInput(formData.get("dataInicio") as string);
  const dataFim = formatarDataInput(formData.get("dataFim") as string);
  const observacao = (formData.get("observacao") as string)?.trim().toUpperCase();

  if (!servidorId || !tipoAusencia || !dataInicio || !dataFim) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  try {
    const novoId = randomUUID();
    
    await db.insert(eventosAusencia).values({
      id: novoId,
      servidorId,
      tipoAusencia,
      dataInicio,
      dataFim,
      observacao: observacao || null,
    });

    // Registra na auditoria
    await registrarLogAuditoria("CRIAR", "eventosAusencia", novoId, `Registrou férias/ausência do tipo: ${tipoAusencia}`);

    // Atualiza a página para mostrar o novo registro imediatamente
    revalidatePath("/controle-ferias");
    revalidatePath("/ferias");
  } catch (error) {
    console.error("Erro ao registrar ausência:", error);
    throw new Error("Falha ao salvar o evento de ausência.");
  }
}

// ==========================================
// 2. NOVA FUNÇÃO: ATUALIZAR (EDIÇÃO)
// ==========================================
export async function atualizarAusencia(formData: FormData) {
  const id = formData.get("id") as string;
  const servidorId = formData.get("servidorId") as string;
  const tipoAusencia = formData.get("tipoAusencia") as "FERIAS" | "LICENCA_MATERNIDADE" | "SAUDE" | "LICENCA_PREMIO" | "AFASTAMENTO_SUPERIOR_15";
  
  // BLINDAGEM DE DATAS E TEXTOS
  const dataInicio = formatarDataInput(formData.get("dataInicio") as string);
  const dataFim = formatarDataInput(formData.get("dataFim") as string);
  const observacao = (formData.get("observacao") as string)?.trim().toUpperCase();

  try {
    await db.update(eventosAusencia).set({
      servidorId,
      tipoAusencia,
      dataInicio,
      dataFim,
      observacao: observacao || null,
    }).where(eq(eventosAusencia.id, id));

    // Registra na auditoria
    await registrarLogAuditoria("EDITAR", "eventosAusencia", id, `Corrigiu o evento de férias/ausência do tipo: ${tipoAusencia}`);
  } catch (error) {
    throw new Error("Erro ao atualizar as informações.");
  }

  revalidatePath("/controle-ferias");
  revalidatePath("/ferias");
  redirect("/controle-ferias"); // Limpa a URL e tira o modo de edição (se sua rota for /ferias, troque aqui)
}

// ==========================================
// 3. NOVA FUNÇÃO: EXCLUIR
// ==========================================
export async function excluirAusencia(id: string, detalhes: string) {
  try {
    // 🛡️ SOFT DELETE ENTERPRISE 🛡️
    await db.update(eventosAusencia)
      .set({ excluidoEm: new Date().toISOString() })
      .where(eq(eventosAusencia.id, id));
    
    // Registra na auditoria
    await registrarLogAuditoria("EXCLUIR", "eventosAusencia", id, `Excluiu (logicamente) o registro de férias/ausência: ${detalhes}`);
    
    revalidatePath("/controle-ferias");
    revalidatePath("/ferias");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir o evento. Tente novamente." };
  }
}