// Arquivo: app/sair/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Apaga os tokens de acesso
  cookieStore.delete("fase_rh_token");
  cookieStore.delete("fase_logado");

  // Invalida o cache do layout no servidor
  revalidatePath("/", "layout");

  // Redireciona limpando o cache do navegador
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  
  return response;
}