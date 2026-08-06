// Arquivo: app/sair/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SairPage() {
  const cookieStore = await cookies();
  cookieStore.delete("fase_logado");
  redirect("/");
}