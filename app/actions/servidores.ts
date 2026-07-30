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

export async function cadastrarServidor(formData: FormData) {
  const sessao = await getSessaoUsuario();
  if (!sessao) throw new Error("Acesso negado.");

  const servidorId = randomUUID();

  const matricula = formData.get("matricula") as string;
  const vinculo = formData.get("vinculo") as "EFETIVO" | "CONTRATADO" | "COMISSIONADO" | "ESTAGIARIO";
  const dataAdmissao = formData.get("dataAdmissao") as string;

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

  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const tituloEleitoral = formData.get("tituloEleitoral") as string;
  const pisPasep = formData.get("pisPasep") as string;

  try {
    await db.insert(servidores).values({
      id: servidorId,
      matricula: matricula || null,
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

    await registrarLogAuditoria("CRIAR", "servidores", servidorId, `Cadastrou o servidor: ${nome} (Matrícula: ${matricula || 'N/A'})`);

  } catch (error) {
    console.error("Erro no cadastro:", error);
    throw new Error("Erro ao salvar servidor. Verifique se a Matrícula, CPF, RG ou E-mail já existem.");
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
  const vinculo = formData.get("vinculo") as "EFETIVO" | "CONTRATADO" | "COMISSIONADO" | "ESTAGIARIO";
  const dataAdmissao = formData.get("dataAdmissao") as string;

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

  const cpf = formData.get("cpf") as string;
  const rg = formData.get("rg") as string;
  const tituloEleitoral = formData.get("tituloEleitoral") as string;
  const pisPasep = formData.get("pisPasep") as string;

  try {
    await db.update(servidores).set({
      matricula: matricula || null,
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

    await registrarLogAuditoria("EDITAR", "servidores", servidorId, `Atualizou os dados principais do servidor: ${nome}`);

  } catch (error) {
    console.error("Erro na atualização:", error);
    throw new Error("Erro ao atualizar servidor. Verifique se os dados únicos (CPF/E-mail) já existem em outro registro.");
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
    revalidatePath("/");
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao excluir servidor:", error);
    return { erro: "Erro ao excluir. Este servidor possui vínculos ativos." };
  }
}