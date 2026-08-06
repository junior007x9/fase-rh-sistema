// Arquivo: app/actions/importacao.ts
"use server";

import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos, dadosBancarios } from "../../db/schema";
import { randomUUID } from "crypto";

function formatarData(dataBruta: string | number) {
  const dataStr = String(dataBruta).trim();
  if (dataStr.includes('/')) {
    const partes = dataStr.split(' ')[0].split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
  }
  return dataStr; 
}

// AGORA O SERVIDOR RECEBE UM TEXTO SEGURO (JSON)
export async function processarBancoDeDados(dadosJson: string) {
  let cadastrados = 0;
  let erros = 0;

  try {
    // Desempacota o texto seguro de volta para a tabela original
    const linhas = JSON.parse(dadosJson);

    // Percorre todos os funcionários (o cabeçalho e as linhas vazias já foram filtrados pela tela)
    for (const linha of linhas) {
      try {
        const matricula = linha[0] ? String(linha[0]).trim() : null; 
        const nome = String(linha[1]).trim(); 
        const cargo = linha[2] ? String(linha[2]).trim() : null; 
        const vinculo = linha[3] ? String(linha[3]).trim() : "NÃO INFORMADO"; 
        const lotacao = linha[4] ? String(linha[4]).trim() : null; 

        let remuneracao = 0;
        if (linha[22]) { 
          const val = String(linha[22]).replace(/[^\d,.-]/g, '').replace(',', '.');
          remuneracao = parseFloat(val) || 0;
        }

        const rg = linha[23] ? String(linha[23]).trim() : null; 
        const cpf = linha[24] ? String(linha[24]).trim() : null; 
        const agencia = linha[25] ? String(linha[25]).trim() : null; 
        const conta = linha[26] ? String(linha[26]).trim() : null; 
        const banco = linha[27] ? String(linha[27]).trim() : null; 

        const admissaoBruta = linha[29]; 
        const desligamentoBruto = linha[30]; 
        
        const dataAdmissao = admissaoBruta ? formatarData(admissaoBruta) : new Date().toISOString().split('T')[0];
        const dataDesligamento = desligamentoBruto ? formatarData(desligamentoBruto) : null;
        
        const status = dataDesligamento ? "DESLIGADO" : "ATIVO";

        const servidorId = randomUUID();

        // 1. Salvar Servidores
        await db.insert(servidores).values({
          id: servidorId,
          matricula,
          vinculo: vinculo as any,
          cargo,
          lotacao,
          status,
          dataAdmissao,
          dataDesligamento,
          remuneracaoBase: remuneracao,
        });

        // 2. Salvar Dados Pessoais
        await db.insert(dadosPessoais).values({
          servidorId,
          nome,
          dataNascimento: "1900-01-01", 
          grupoEtnico: "NÃO INFORMADO",
          estadoCivil: "NÃO INFORMADO",
          genero: "NÃO INFORMADO",
          nomeMae: "NÃO INFORMADO",
          nacionalidade: "NÃO INFORMADA"
        } as any);

        // 3. Salvar Documentos
        await db.insert(documentos).values({
          servidorId,
          cpf: cpf || "NÃO INFORMADO",
          rg: rg || "NÃO INFORMADO",
        } as any);

        // 4. Salvar Dados Bancários
        if (banco || agencia || conta) {
          await db.insert(dadosBancarios).values({
            servidorId,
            banco,
            agencia,
            conta,
            nomeTitular: nome
          } as any);
        }

        cadastrados++;
      } catch (err) {
        console.error(`Erro ao importar o funcionário:`, err);
        erros++;
      }
    }

    return { sucesso: true, cadastrados, erros };
    
  } catch (error) {
    console.error("Erro fatal ao desempacotar os dados:", error);
    throw new Error("Falha no servidor ao ler o arquivo enviado.");
  }
}