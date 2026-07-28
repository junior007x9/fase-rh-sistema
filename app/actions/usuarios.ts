// Arquivo: app/actions/usuarios.ts
"use server";

import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { getSessaoUsuario } from "./auth";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function cadastrarUsuario(formData: FormData) {
  // 1. Verificação de Segurança de Nível de Acesso
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
    // 2. Criptografa a senha do novo usuário
    const hashSenha = await bcrypt.hash(senha, 10);

    // 3. Salva no banco de dados
    await db.insert(usuarios).values({
      id: randomUUID(),
      nome,
      email,
      senha: hashSenha,
      role,
    });

  } catch (error) {
    console.error(error);
    throw new Error("Erro ao criar usuário. Este e-mail já pode estar em uso.");
  }

  // 4. Atualiza a tela
  revalidatePath("/usuarios");
}