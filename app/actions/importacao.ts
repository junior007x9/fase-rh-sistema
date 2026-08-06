// Arquivo: app/actions/importacao.ts
"use server";

import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos, dadosBancarios } from "../../db/schema";
import { randomUUID } from "crypto";

// Função para formatar as datas do Excel (DD/MM/YYYY) para Banco (YYYY-MM-DD)
function formatarData(dataBruta: string | number) {
  const dataStr = String(dataBruta).trim();
  if (dataStr.includes('/')) {
    const partes = dataStr.split(' ')[0].split('/');
    if (partes.length === 3) {
      // Ex: 24/09/2026 -> 2026-09-24
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
  }
  return dataStr; // Retorna como veio se não entender
}

export async function processarBancoDeDados(linhas: any[][]) {
  let cadastrados = 0;
  let erros = 0;

  // O loop começa em 1 para pular a linha 0 (Cabeçalho)
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Se a linha estiver vazia ou não tiver nome (Coluna B = índice 1), pula a linha.
    if (!linha || !linha[1]) continue;

    try {
      // Mapeamento das colunas baseado nas letras que você mandou (A=0, B=1, C=2, etc.)
      const matricula = linha[0] ? String(linha[0]).trim() : null; // A
      const nome = String(linha[1]).trim(); // B
      const cargo = linha[2] ? String(linha[2]).trim() : null; // C
      const vinculo = linha[3] ? String(linha[3]).trim() : "NÃO INFORMADO"; // D
      const lotacao = linha[4] ? String(linha[4]).trim() : null; // E

      let remuneracao = 0;
      if (linha[22]) { // W = Total
        const val = String(linha[22]).replace(/[^\d,.-]/g, '').replace(',', '.');
        remuneracao = parseFloat(val) || 0;
      }

      const rg = linha[23] ? String(linha[23]).trim() : null; // X
      const cpf = linha[24] ? String(linha[24]).trim() : null; // Y
      const agencia = linha[25] ? String(linha[25]).trim() : null; // Z
      const conta = linha[26] ? String(linha[26]).trim() : null; // AA
      const banco = linha[27] ? String(linha[27]).trim() : null; // AB

      const admissaoBruta = linha[29]; // AD
      const desligamentoBruto = linha[30]; // AE
      
      const dataAdmissao = admissaoBruta ? formatarData(admissaoBruta) : new Date().toISOString().split('T')[0];
      const dataDesligamento = desligamentoBruto ? formatarData(desligamentoBruto) : null;
      
      const status = dataDesligamento ? "DESLIGADO" : "ATIVO";

      const servidorId = randomUUID();

      // 1. Salvar na Tabela Servidores
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

      // 2. Salvar na Tabela de Dados Pessoais
      await db.insert(dadosPessoais).values({
        id: randomUUID(),
        servidorId,
        nome,
      });

      // 3. Salvar Documentos
      await db.insert(documentos).values({
        id: randomUUID(),
        servidorId,
        cpf,
        rg,
      });

      // 4. Salvar Dados Bancários
      if (banco || agencia || conta) {
        await db.insert(dadosBancarios).values({
          id: randomUUID(),
          servidorId,
          banco,
          agencia,
          conta,
          nomeTitular: nome
        });
      }

      cadastrados++;
    } catch (err) {
      console.error(`Erro ao importar o funcionário da linha ${i+1}:`, err);
      erros++;
    }
  }

  return { sucesso: true, cadastrados, erros };
}