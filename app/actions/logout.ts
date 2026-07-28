// Arquivo: app/actions/logout.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function sairDoSistema() {
  // Aguarda os cookies carregarem (o 'await' é a chave aqui)
  const cookieStore = await cookies();
  
  // Agora sim, apagamos o cookie de autenticação
  cookieStore.delete("fase_rh_token");
  
  // Redireciona para o login
  redirect("/login");
}