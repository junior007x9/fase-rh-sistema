// Arquivo: app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache"; // ⬅️ Importante para limpar o cache

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao_fase_ma";

export async function fazerLogin(formData: FormData) {
  const emailBruto = formData.get("email") as string;
  const email = emailBruto ? emailBruto.trim().toLowerCase() : "";
  const senha = formData.get("senha") as string;

  if (!email || !senha) {
    return { erro: "Por favor, preencha o e-mail e a senha." };
  }

  try {
    const resultado = await db.select().from(usuarios).where(eq(usuarios.email, email));
    const usuario = resultado[0];

    if (!usuario) {
      const totalUsuarios = await db.select().from(usuarios);
      if (totalUsuarios.length === 0) {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const novoId = randomUUID();
        
        await db.insert(usuarios).values({
          id: novoId,
          nome: "Administrador Geral",
          email,
          senha: senhaCriptografada, 
          role: "DIRETORIA", 
        });

        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({ email, role: "DIRETORIA" })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("8h")
          .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set("fase_rh_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 8,
          path: "/",
        });

        revalidatePath("/", "layout"); // Limpa cache
        return { sucesso: true };
      }

      return { erro: "Acesso negado. E-mail não cadastrado no sistema." };
    }

    const senhaValidaCriptografada = await bcrypt.compare(senha, usuario.senha);
    const senhaValidaNormal = usuario.senha === senha;

    if (!senhaValidaCriptografada && !senhaValidaNormal) {
      return { erro: "Acesso negado. Senha incorreta." };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ email, role: usuario.role || 'DIRETORIA' })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set("fase_rh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    revalidatePath("/", "layout"); // ⬅️ Força o Next.js a atualizar o layout imediatamente
    return { sucesso: true };
  } catch (error) {
    console.error("Erro interno no login:", error);
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