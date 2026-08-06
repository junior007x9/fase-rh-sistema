// Arquivo: app/actions/usuarios.ts
"use server";

import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Função para excluir usuário
export async function excluirUsuario(id: string) {
  await db.delete(usuarios).where(eq(usuarios.id, id));
  revalidatePath("/gestao-acessos");
}

// Função para criar usuário
export async function criarUsuario(formData: FormData) {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const role = formData.get("role") as string;

  // Criptografa a senha antes de salvar no banco
  const senhaCriptografada = await bcrypt.hash(senha, 10);
  const novoId = randomUUID();

  // Insere no banco
  await db.insert(usuarios).values({
    id: novoId,
    nome,
    email: email.toLowerCase().trim(),
    senha: senhaCriptografada,
    role: role as any, // ⬅️ O 'as any' resolve o erro do TypeScript aqui!
  });

  // Atualiza a tabela e volta pra página anterior
  revalidatePath("/gestao-acessos");
  redirect("/gestao-acessos");
}