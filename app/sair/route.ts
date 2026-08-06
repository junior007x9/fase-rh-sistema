// Arquivo: app/sair/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Apaga os cookies de autenticação do sistema
  cookieStore.delete("fase_rh_token");
  cookieStore.delete("fase_logado");

  // Redireciona de volta para a página inicial (que exigirá o login)
  return NextResponse.redirect(new URL("/", request.url));
}