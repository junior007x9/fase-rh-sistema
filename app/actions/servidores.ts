// Arquivo: app/actions/servidores.ts
"use server";

import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessaoUsuario } from "./auth";
import { eq } from "drizzle-orm";
import { registrarLogAuditoria } from "./auditoria";
// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataInput, formatarNumeroInput } from "../utils/formatters";

export async function cadastrarServidor(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = randomUUID();

  // Vínculo Institucional e Base Salarial
  const matricula = formData.get("matricula") as string;
  const cargo = formData.get("cargo") as string;
  const lotacao = formData.get("lotacao") as string;
  const vinculo = formData.get("vinculo") as "EFETIVO" | "CONTRATADO" | "COMISSIONADO" | "ESTAGIARIO";
  
  // APLICA O FORMATADOR DE DATA AQUI 👇
  const dataAdmissao = formatarDataInput(formData.get("dataAdmissao") as string);
  
  // ---> NOVOS CAMPOS <---
  const funcao = formData.get("funcao") as string;
  const jornada = formData.get("jornada") as string;
  
  // APLICA O FORMATADOR DE DINHEIRO AQUI 👇
  const remuneracaoRaw = formData.get("remuneracaoBase");
  const remuneracaoFormatada = formatarNumeroInput(remuneracaoRaw);
  const remuneracaoBase = remuneracaoFormatada !== "" ? Number(remuneracaoFormatada) : null;

  // Dados Pessoais
  const nome = formData.get("nome") as string;
  const nomeSocial = formData.get("nomeSocial") as string;
  
  // APLICA O FORMATADOR DE DATA AQUI 👇
  const dataNascimento = formatarDataInput(formData.get("dataNascimento") as string);
  
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const tipoSanguineo = formData.get("tipoSanguineo") as string;
  const grupoEtnico = formData.get("grupoEtnico") as string;
  const estadoCivil = formData.get("estadoCivil") as string;
  const genero = formData.get("genero") as string;
  const orientacaoSexual = formData.get("orientacaoSexual") as string;

  // Documentos
  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const tituloEleitoral = formData.get("tituloEleitoral") as string;
  const pisPasep = formData.get("pisPasep") as string;

  try {
    await db.insert(servidores).values({
      id: servidorId,
      matricula: matricula || null,
      cargo: cargo || null,
      lotacao: lotacao || null,
      funcao: funcao || null,
      jornada: jornada || null,
      remuneracaoBase: remuneracaoBase,
      vinculo,
      dataAdmissao,
      status: "ATIVO",
    });

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

    await db.insert(documentos).values({
      servidorId,
      cpf,
      rg,
      tituloEleitoral,
      pisPasep: pisPasep || null,
    });

    await registrarLogAuditoria("CRIAR", "servidores", servidorId, `Cadastrou o servidor: ${nome}`);
  } catch (error) {
    throw new Error("Erro ao salvar servidor. Verifique se os dados únicos já existem.");
  }

  revalidatePath("/servidores");
  revalidatePath("/");
  redirect(`/servidores/${servidorId}`);
}

export async function atualizarServidor(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = formData.get("id") as string;

  const matricula = formData.get("matricula") as string;
  const cargo = formData.get("cargo") as string;
  const lotacao = formData.get("lotacao") as string;
  const vinculo = formData.get("vinculo") as "EFETIVO" | "CONTRATADO" | "COMISSIONADO" | "ESTAGIARIO";
  
  // APLICA O FORMATADOR DE DATA AQUI 👇
  const dataAdmissao = formatarDataInput(formData.get("dataAdmissao") as string);

  // ---> NOVOS CAMPOS <---
  const funcao = formData.get("funcao") as string;
  const jornada = formData.get("jornada") as string;
  
  // APLICA O FORMATADOR DE DINHEIRO AQUI 👇
  const remuneracaoRaw = formData.get("remuneracaoBase");
  const remuneracaoFormatada = formatarNumeroInput(remuneracaoRaw);
  const remuneracaoBase = remuneracaoFormatada !== "" ? Number(remuneracaoFormatada) : null;

  const nome = formData.get("nome") as string;
  const nomeSocial = formData.get("nomeSocial") as string;
  
  // APLICA O FORMATADOR DE DATA AQUI 👇
  const dataNascimento = formatarDataInput(formData.get("dataNascimento") as string);
  
  const email = formData.get("email") as string;
  const telefone = formData.get("telefone") as string;
  const tipoSanguineo = formData.get("tipoSanguineo") as string;
  const grupoEtnico = formData.get("grupoEtnico") as string;
  const estadoCivil = formData.get("estadoCivil") as string;
  const genero = formData.get("genero") as string;
  const orientacaoSexual = formData.get("orientacaoSexual") as string;

  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const tituloEleitoral = formData.get("tituloEleitoral") as string;
  const pisPasep = formData.get("pisPasep") as string;

  try {
    await db.update(servidores).set({
      matricula: matricula || null,
      cargo: cargo || null,
      lotacao: lotacao || null,
      funcao: funcao || null,
      jornada: jornada || null,
      remuneracaoBase: remuneracaoBase,
      vinculo,
      dataAdmissao,
    }).where(eq(servidores.id, servidorId));

    await db.update(dadosPessoais).set({
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
    }).where(eq(dadosPessoais.servidorId, servidorId));

    await db.update(documentos).set({
      cpf,
      rg,
      tituloEleitoral,
      pisPasep: pisPasep || null,
    }).where(eq(documentos.servidorId, servidorId));

    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Atualizou os dados de: ${nome}`);
  } catch (error) {
    throw new Error("Erro ao atualizar servidor.");
  }

  revalidatePath("/servidores");
  revalidatePath(`/servidores/${servidorId}`);
  redirect(`/servidores/${servidorId}`);
}

export async function excluirServidor(id: string, nome: string) {
  try {
    await db.delete(documentos).where(eq(documentos.servidorId, id));
    await db.delete(dadosPessoais).where(eq(dadosPessoais.servidorId, id));
    await db.delete(servidores).where(eq(servidores.id, id));
    
    await registrarLogAuditoria("EXCLUIR", "servidores", id, `Excluiu permanentemente o servidor: ${nome}`);
    
    revalidatePath("/servidores");
    return { sucesso: true };
  } catch (error) {
    return { erro: "Erro ao excluir. Este servidor possui vínculos ativos." };
  }
}