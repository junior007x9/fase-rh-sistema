// Arquivo: app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao_fase_ma";

export async function fazerLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;

  if (!email || !senha) {
    return { erro: "Por favor, preencha o e-mail e a senha." };
  }

  try {
    // 1. Busca o usuário no banco de dados
    const resultado = await db.select().from(usuarios).where(eq(usuarios.email, email));
    const usuario = resultado[0];

    // 2. Se o banco estiver totalmente vazio, cria o primeiro Admin
    if (!usuario) {
      const totalUsuarios = await db.select().from(usuarios);
      if (totalUsuarios.length === 0) {
        await db.insert(usuarios).values({
          id: randomUUID(),
          nome: "Administrador Geral",
          email,
          senha, 
          cargo: "ADMIN",
        });
        // Se acabou de criar, pode prosseguir para o login
      } else {
        // Se já existem usuários e o e-mail não foi achado:
        return { erro: "Acesso negado. E-mail ou senha incorretos." };
      }
    } else {
      // 3. Se o usuário existe, verifica se a senha bate
      if (usuario.senha !== senha) {
        return { erro: "Acesso negado. E-mail ou senha incorretos." };
      }
    }

    // 4. Se chegou aqui, a senha está certa. Gera o Token de Acesso!
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ email, cargo: usuario?.cargo || 'ADMIN' })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    // 5. Salva o cookie de forma segura aguardando a promessa
    const cookieStore = await cookies();
    cookieStore.set("fase_rh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas logado
      path: "/",
    });

    return { sucesso: true };
  } catch (error) {
    console.error("Erro no sistema de login:", error);
    return { erro: "Erro interno no servidor ao tentar acessar." };
  }
}

export async function getSessaoUsuario() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fase_rh_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}