// Arquivo: app/actions/usuarios.ts
"use server";

import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarLogAuditoria } from "./auditoria";

// Função para excluir usuário
export async function excluirUsuario(id: string) {
  try {
    // 🛡️ SOFT DELETE: Inativa o usuário mas mantém o histórico para a auditoria
    await db.update(usuarios)
      .set({ excluidoEm: new Date().toISOString() })
      .where(eq(usuarios.id, id));

    await registrarLogAuditoria("EXCLUIR", "usuarios", id, `Excluiu (logicamente) o acesso de um usuário.`);
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
  }
  revalidatePath("/gestao-acessos");
}

// Função para criar usuário
export async function criarUsuario(formData: FormData) {
  const nomeRaw = formData.get("nome") as string;
  const emailRaw = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const role = formData.get("role") as string;

  // BLINDAGEM DE DADOS
  const nome = nomeRaw.trim().toUpperCase();
  const email = emailRaw.trim().toLowerCase();

  // Criptografa a senha antes de salvar no banco
  const senhaCriptografada = await bcrypt.hash(senha, 10);
  const novoId = randomUUID();

  // Insere no banco
  await db.insert(usuarios).values({
    id: novoId,
    nome,
    email,
    senha: senhaCriptografada,
    role: role as any, // ⬅️ O 'as any' resolve o erro do TypeScript aqui!
  });

  await registrarLogAuditoria("CRIAR", "usuarios", novoId, `Criou novo acesso de usuário: ${nome} (${role})`);

  // Atualiza a tabela e volta pra página anterior
  revalidatePath("/gestao-acessos");
  redirect("/gestao-acessos");
}