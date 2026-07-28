// Arquivo: app/actions/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function sairDoSistema() {
  // Apaga o cookie de autenticação
  cookies().delete("fase_rh_token");
  
  // Redireciona para o login (agora sem o token)
  redirect("/login");
}