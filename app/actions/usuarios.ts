// Arquivo: app/actions/usuarios.ts
"use server";

import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { getSessaoUsuario } from "./auth";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm"; // <-- Importação do eq adicionada
import { registrarLogAuditoria } from "./auditoria"; // <-- Importação da auditoria adicionada

// 1. Função para Cadastrar Novo Usuário
export async function cadastrarUsuario(formData: FormData) {
  // Verificação de Segurança de Nível de Acesso
  const sessao = await getSessaoUsuario();
  if (!sessao || sessao.role !== "DIRETORIA") {
    throw new Error("Acesso negado. Apenas a Diretoria pode gerenciar acessos.");
  }

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const role = formData.get("role") as "RH" | "DIRETORIA";

  if (!nome || !email || !senha || !role) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  try {
    // Criptografa a senha do novo usuário
    const hashSenha = await bcrypt.hash(senha, 10);
    const novoId = randomUUID();

    // Salva no banco de dados
    await db.insert(usuarios).values({
      id: novoId,
      nome,
      email,
      senha: hashSenha,
      role,
    });

    // Registra a ação na auditoria
    await registrarLogAuditoria("CRIAR", "usuarios", novoId, `Cadastrou o usuário: ${nome} (${email}) com perfil ${role}`);

  } catch (error) {
    console.error(error);
    throw new Error("Erro ao criar usuário. Este e-mail já pode estar em uso.");
  }

  // Atualiza a tela de Gestão de Acessos
  revalidatePath("/gestao-acessos");
}

// 2. Função para Excluir Usuário com Auditoria
export async function excluirUsuario(id: string, email: string) {
  try {
    await db.delete(usuarios).where(eq(usuarios.id, id));
    
    // Registra na auditoria quem excluiu o usuário
    await registrarLogAuditoria("EXCLUIR", "usuarios", id, `Excluiu o acesso do usuário: ${email}`);
    
    revalidatePath("/gestao-acessos");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir o usuário." };
  }
}