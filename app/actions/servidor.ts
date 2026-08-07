// Arquivo: app/actions/servidor.ts
"use server";

import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataInput } from "../utils/formatters";

export async function cadastrarServidor(formData: FormData) {
  // 1. Gerando ID único para o servidor
  const servidorId = randomUUID();

  // 2. Extraindo e Blindando os Dados Institucionais
  const vinculo = formData.get("vinculo") as "EFETIVO" | "CONTRATADO" | "COMISSIONADO" | "ESTAGIARIO";
  const dataAdmissao = formatarDataInput(formData.get("dataAdmissao") as string);

  // 3. Extraindo e Blindando os Dados Pessoais
  const nomeRaw = formData.get("nome") as string;
  const nomeSocialRaw = formData.get("nomeSocial") as string;
  const emailRaw = formData.get("email") as string;

  const nome = nomeRaw ? nomeRaw.trim().toUpperCase() : "";
  const nomeSocial = nomeSocialRaw ? nomeSocialRaw.trim().toUpperCase() : null;
  const dataNascimento = formatarDataInput(formData.get("dataNascimento") as string);
  const tipoSanguineo = formData.get("tipoSanguineo") as string;
  const grupoEtnico = formData.get("grupoEtnico") as string;
  const estadoCivil = formData.get("estadoCivil") as string;
  const genero = formData.get("genero") as string;
  const orientacaoSexual = formData.get("orientacaoSexual") as string;
  const email = emailRaw ? emailRaw.trim().toLowerCase() : "";
  const telefone = (formData.get("telefone") as string)?.trim();

  // 4. Extraindo e Blindando Documentos
  const cpf = (formData.get("cpf") as string)?.trim();
  const rg = (formData.get("rg") as string)?.trim();
  const tituloEleitoral = (formData.get("tituloEleitoral") as string)?.trim();
  const pisPasep = (formData.get("pisPasep") as string)?.trim();

  try {
    // 5. Inserindo no Banco de Dados em uma Transação Segura
    await db.transaction(async (tx) => {
      // A. Salva o Servidor (Base)
      await tx.insert(servidores).values({
        id: servidorId,
        vinculo,
        dataAdmissao,
        status: "ATIVO",
      });

      // B. Salva os Dados Pessoais
      await tx.insert(dadosPessoais).values({
        servidorId,
        nome,
        nomeSocial,
        dataNascimento,
        tipoSanguineo: tipoSanguineo || null,
        grupoEtnico,
        estadoCivil,
        genero,
        orientacaoSexual,
        email,
        telefone,
      });

      // C. Salva os Documentos
      await tx.insert(documentos).values({
        servidorId,
        cpf,
        rg,
        tituloEleitoral,
        pisPasep: pisPasep || null,
      });
    });

  } catch (error) {
    console.error("Erro ao salvar servidor:", error);
    throw new Error("Falha ao cadastrar servidor. Verifique se o CPF ou E-mail já estão cadastrados.");
  }

  // 6. Atualiza o cache da página principal e redireciona
  revalidatePath("/");
  redirect("/");
}