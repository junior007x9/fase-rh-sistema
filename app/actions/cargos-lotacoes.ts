// Arquivo: app/actions/cargos-lotacoes.ts
"use server";

import { db } from "../../db/index";
import { cargos, lotacoes } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function salvarCargo(formData: FormData) {
  const nome = formData.get("nome") as string;

  if (!nome) return;

  try {
    await db.insert(cargos).values({
      id: randomUUID(),
      nome: nome.toUpperCase(), // Padronizando tudo em maiúsculo
    });
    revalidatePath("/cargos-lotacoes");
  } catch (error) {
    console.error("Erro ao salvar cargo (pode ser duplicado):", error);
    throw new Error("Falha ao salvar cargo. Verifique se já existe.");
  }
}

export async function salvarLotacao(formData: FormData) {
  const nome = formData.get("nome") as string;
  const sigla = formData.get("sigla") as string;

  if (!nome || !sigla) return;

  try {
    await db.insert(lotacoes).values({
      id: randomUUID(),
      nome: nome.toUpperCase(),
      sigla: sigla.toUpperCase(),
    });
    revalidatePath("/cargos-lotacoes");
  } catch (error) {
    console.error("Erro ao salvar lotação:", error);
    throw new Error("Falha ao salvar lotação. Verifique se já existe.");
  }
}