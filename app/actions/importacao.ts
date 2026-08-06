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

export async function processarBancoDeDados(dadosJson: string) {
  let cadastrados = 0;
  let erros = 0;
  let primeiroErro = ""; 

  try {
    const linhas = JSON.parse(dadosJson);
    
    // TÉCNICA DE LOTES: Vamos dividir os 2.700 funcionários em pacotes de 500 para não dar Timeout
    const TAMANHO_LOTE = 500;

    for (let i = 0; i < linhas.length; i += TAMANHO_LOTE) {
      const pedaco = linhas.slice(i, i + TAMANHO_LOTE);

      // Arrays que vão guardar o pacote para o "Bulk Insert"
      const loteServidores = [];
      const lotePessoais = [];
      const loteDocumentos = [];
      const loteBancarios = [];

      for (let j = 0; j < pedaco.length; j++) {
        const linha = pedaco[j];
        try {
          const matriculaStr = linha[0] ? String(linha[0]).trim() : null; 
          const nome = String(linha[1]).trim(); 
          const cargo = linha[2] ? String(linha[2]).trim() : null; 
          const vinculo = linha[3] ? String(linha[3]).trim() : "NÃO INFORMADO"; 
          const lotacao = linha[4] ? String(linha[4]).trim() : null; 

          let remuneracao = 0;
          if (linha[22]) { 
            const val = String(linha[22]).replace(/[^\d,.-]/g, '').replace(',', '.');
            remuneracao = parseFloat(val) || 0;
          }

          const rgStr = linha[23] ? String(linha[23]).trim() : null; 
          const cpfStr = linha[24] ? String(linha[24]).trim() : null; 
          const agencia = linha[25] ? String(linha[25]).trim() : null; 
          const conta = linha[26] ? String(linha[26]).trim() : null; 
          const banco = linha[27] ? String(linha[27]).trim() : null; 

          const admissaoBruta = linha[29]; 
          const desligamentoBruto = linha[30]; 
          
          const dataAdmissao = admissaoBruta ? formatarData(admissaoBruta) : new Date().toISOString().split('T')[0];
          const dataDesligamento = desligamentoBruto ? formatarData(desligamentoBruto) : null;
          
          const status = dataDesligamento ? "DESLIGADO" : "ATIVO";

          const servidorId = randomUUID();
          const codigoAleatorio = servidorId.substring(0,8).toUpperCase();

          const matriculaSegura = matriculaStr || `GERAR-${codigoAleatorio}`;
          const cpfSeguro = cpfStr || `SEM-CPF-${codigoAleatorio}`;
          const rgSeguro = rgStr || `SEM-RG-${codigoAleatorio}`;
          const emailSeguro = `sem-email-${codigoAleatorio}@fase.ma.gov.br`;
          const telefoneSeguro = `(00) 0000-${codigoAleatorio.substring(0,4)}`;
          const tituloSeguro = `SEM-TITULO-${codigoAleatorio}`;
          const pisSeguro = `SEM-PIS-${codigoAleatorio}`;

          // Em vez de salvar um por um, guardamos na "caixa" (Array)
          loteServidores.push({
            id: servidorId,
            matricula: matriculaSegura,
            vinculo: vinculo as any,
            cargo,
            lotacao,
            status,
            dataAdmissao,
            dataDesligamento,
            remuneracaoBase: remuneracao,
          });

          lotePessoais.push({
            servidorId,
            nome,
            nomeSocial: "",
            dataNascimento: "1900-01-01", 
            tipoSanguineo: "NÃO INFORMADO",
            grupoEtnico: "NÃO INFORMADO",
            estadoCivil: "NÃO INFORMADO",
            genero: "NÃO INFORMADO",
            orientacaoSexual: "NÃO INFORMADO",
            email: emailSeguro,
            telefone: telefoneSeguro
          } as any);

          loteDocumentos.push({
            servidorId,
            cpf: cpfSeguro,
            rg: rgSeguro,
            tituloEleitoral: tituloSeguro,
            pisPasep: pisSeguro
          } as any);

          if (banco || agencia || conta) {
            loteBancarios.push({
              servidorId,
              banco: banco || "NÃO INFORMADO",
              agencia: agencia || "0000",
              conta: conta || "00000-0",
              nomeTitular: nome
            } as any);
          }
        } catch (err: any) {
          if (!primeiroErro) primeiroErro = err.message || String(err);
          erros++;
        }
      }

      // DISPARO EM MASSA: Salva os 500 de uma vez (Leva menos de 1 segundo!)
      if (loteServidores.length > 0) await db.insert(servidores).values(loteServidores);
      if (lotePessoais.length > 0) await db.insert(dadosPessoais).values(lotePessoais);
      if (loteDocumentos.length > 0) await db.insert(documentos).values(loteDocumentos);
      if (loteBancarios.length > 0) await db.insert(dadosBancarios).values(loteBancarios);

      cadastrados += loteServidores.length;
    }

    return { sucesso: true, cadastrados, erros, detalheErro: primeiroErro };
    
  } catch (error: any) {
    return { sucesso: false, cadastrados, erros, detalheErro: error.message || String(error) };
  }
}