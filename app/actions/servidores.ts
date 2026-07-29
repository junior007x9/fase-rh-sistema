// Arquivo: app/actions/servidores.ts
"use server";

import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessaoUsuario } from "./auth";
import { eq } from "drizzle-orm"; // <-- Importação do eq adicionada
import { registrarLogAuditoria } from "./auditoria"; // <-- Importação da auditoria

export async function cadastrarServidor(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = randomUUID();

  // 1. Dados Institucionais
  const vinculo = formData.get("vinculo") as "EFETIVO" | "CONTRATADO" | "COMISSIONADO" | "ESTAGIARIO";
  const dataAdmissao = formData.get("dataAdmissao") as string;

  // 2. Dados Pessoais e Diversidade
  const nome = formData.get("nome") as string;
  const nomeSocial = formData.get("nomeSocial") as string;
  const dataNascimento = formData.get("dataNascimento") as string;
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const tipoSanguineo = formData.get("tipoSanguineo") as string;
  const grupoEtnico = formData.get("grupoEtnico") as string;
  const estadoCivil = formData.get("estadoCivil") as string;
  const genero = formData.get("genero") as string;
  const orientacaoSexual = formData.get("orientacaoSexual") as string;

  // 3. Documentos
  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const tituloEleitoral = formData.get("tituloEleitoral") as string;
  const pisPasep = formData.get("pisPasep") as string;

  try {
    // Salva na tabela Servidores
    await db.insert(servidores).values({
      id: servidorId,
      vinculo,
      dataAdmissao,
      status: "ATIVO",
    });

    // Salva na tabela Dados Pessoais
    await db.insert(dadosPessoais).values({
      servidorId,
      nome,
      nomeSocial: nomeSocial || null,
      dataNascimento,
      email,
      telefone,
      tipoSanguineo: tipoSanguineo || null,
      grupoEtnico,
      estadoCivil,
      genero,
      orientacaoSexual,
    });

    // Salva na tabela Documentos
    await db.insert(documentos).values({
      servidorId,
      cpf,
      rg,
      tituloEleitoral,
      pisPasep: pisPasep || null,
    });

    // Registra na auditoria
    await registrarLogAuditoria("CRIAR", "servidores", servidorId, `Cadastrou o servidor: ${nome} (CPF: ${cpf})`);

  } catch (error) {
    console.error("Erro no cadastro:", error);
    throw new Error("Erro ao salvar servidor. Verifique se o CPF, RG ou E-mail já existem.");
  }

  revalidatePath("/servidores");
  revalidatePath("/"); // Atualiza o Dashboard
  redirect(`/servidores/${servidorId}`);
}

// 4. NOVA FUNÇÃO: EXCLUIR SERVIDOR COM SEGURANÇA E AUDITORIA
export async function excluirServidor(id: string, nome: string) {
  try {
    // Exclui as dependências nas outras tabelas primeiro para evitar erro de chaves estrangeiras
    await db.delete(documentos).where(eq(documentos.servidorId, id));
    await db.delete(dadosPessoais).where(eq(dadosPessoais.servidorId, id));
    
    // Por fim, exclui o servidor principal
    await db.delete(servidores).where(eq(servidores.id, id));
    
    // Registra na auditoria
    await registrarLogAuditoria("EXCLUIR", "servidores", id, `Excluiu permanentemente o servidor: ${nome}`);
    
    revalidatePath("/servidores");
    revalidatePath("/"); // Atualiza os KPIs do Dashboard
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao excluir servidor:", error);
    return { erro: "Erro ao excluir. Este servidor possui vínculos ativos (como férias ou ausências) que precisam ser removidos antes." };
  }
}