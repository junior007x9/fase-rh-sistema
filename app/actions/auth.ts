// Arquivo: app/actions/auth.ts
"use server";

import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "chave_secreta_padrao_fase_ma");

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  if (!email || !senha) throw new Error("Preencha todos os campos.");

  // Lógica inteligente: Se a tabela estiver vazia, cria o primeiro Admin
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(usuarios);
  if (totalUsers[0].count === 0) {
    const hashSenha = await bcrypt.hash(senha, 10);
    await db.insert(usuarios).values({
      id: randomUUID(),
      nome: "Administrador Geral",
      email: email,
      senha: hashSenha,
      role: "DIRETORIA", // Nível máximo
    });
  }

  // Verifica o usuário
  const userList = await db.select().from(usuarios).where(eq(usuarios.email, email));
  const user = userList[0];

  if (!user) throw new Error("Credenciais inválidas.");

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) throw new Error("Credenciais inválidas.");

  // Gera o Token JWT com o Nível de Acesso (Role)
  const token = await new SignJWT({ id: user.id, role: user.role, nome: user.nome })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(SECRET_KEY);

  // CORREÇÃO AQUI: Aguardando a Promise dos cookies
  const cookieStore = await cookies();
  cookieStore.set("fase_rh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return { success: true };
}

export async function logout() {
  // CORREÇÃO AQUI: Aguardando a Promise dos cookies
  const cookieStore = await cookies();
  cookieStore.delete("fase_rh_token");
}

// Função para checar permissão em Server Components
export async function getSessaoUsuario() {
  // CORREÇÃO AQUI: Aguardando a Promise dos cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("fase_rh_token")?.value;
  
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { id: string; role: "RH" | "DIRETORIA"; nome: string };
  } catch (error) {
    return null;
  }
}