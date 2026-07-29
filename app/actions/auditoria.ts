// Arquivo: app/actions/auditoria.ts
"use server";

import { db } from "../../db/index";
import { auditoriaLogs } from "../../db/schema";
import { getSessaoUsuario } from "./auth";
import { randomUUID } from "crypto";

export async function registrarLogAuditoria(
  acao: "CRIAR" | "EDITAR" | "EXCLUIR",
  tabela: string,
  registroId: string,
  detalhes: string
) {
  try {
    // 1. Descobre quem está logado fazendo a ação
    const sessao = await getSessaoUsuario();
    const usuarioEmail = sessao?.email || "SISTEMA";

    // 2. Salva o rastro no banco
    await db.insert(auditoriaLogs).values({
      id: randomUUID(),
      usuarioEmail: usuarioEmail,
      acao: acao,
      tabelaAfetada: tabela,
      registroId: registroId,
      detalhes: detalhes,
    });
    
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
    return { erro: "Falha ao gravar log de auditoria." };
  }
}