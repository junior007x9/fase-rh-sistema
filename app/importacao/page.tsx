// Arquivo: app/importacao/page.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { processarBancoDeDados } from "../actions/importacao";

export default function ImportacaoPage() {
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<{ cadastrados: number, erros: number, detalheErro?: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setResultado(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const nomeAba = "BANCO_DE_DADOS";
      const sheet = workbook.Sheets[nomeAba];
      
      if (!sheet) {
        alert(`A aba "${nomeAba}" não foi encontrada no arquivo.`);
        setCarregando(false);
        return;
      }

      const linhasBrutas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });

      const linhasUteis = linhasBrutas.filter((linha, index) => {
        return index > 0 && linha && linha.length > 1 && linha[1] && String(linha[1]).trim() !== "";
      });

      if (linhasUteis.length === 0) {
        alert("A planilha parece estar vazia ou sem nomes.");
        setCarregando(false);
        return;
      }

      // Chama o backend enviando os dados empacotados
      const response = await processarBancoDeDados(JSON.stringify(linhasUteis));
      
      setResultado({ 
        cadastrados: response.cadastrados, 
        erros: response.erros,
        detalheErro: response.detalheErro
      });

    } catch (error: any) {
      alert(`ERRO TÉCNICO: ${error.message || error}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Importação em Massa</h1>
        <p className="text-gray-500 mt-1">Carregue a planilha oficial (Formato .ods ou .xlsx) para alimentar o sistema automaticamente.</p>
      </header>

      <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
        
        {carregando ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 size={48} className="text-blue-500 animate-spin" />
            <h3 className="text-xl font-bold text-gray-800">Processando Planilha...</h3>
            <p className="text-gray-500">Estamos salvando milhares de dados. Não feche a página, pode levar 1 minuto.</p>
          </div>
        ) : resultado ? (
          <div className="flex flex-col items-center space-y-4 w-full">
            {resultado.erros === 0 ? (
              <CheckCircle size={56} className="text-green-500" />
            ) : (
              <AlertTriangle size={56} className="text-amber-500" />
            )}
            <h3 className="text-2xl font-bold text-gray-800">Importação Concluída!</h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full max-w-sm">
              <p className="text-lg text-slate-700 flex justify-between">
                <span className="font-bold">Servidores Cadastrados:</span> 
                <span className="text-green-600 font-extrabold">{resultado.cadastrados}</span>
              </p>
              <p className="text-lg text-slate-700 flex justify-between mt-2">
                <span className="font-bold">Erros / Pulados:</span> 
                <span className="text-red-600 font-extrabold">{resultado.erros}</span>
              </p>
            </div>

            {/* DEDO DURO: SE O BANCO RECUSAR, VAI APARECER AQUI O MOTIVO EXATO */}
            {resultado.erros > 0 && resultado.detalheErro && (
              <div className="mt-4 w-full max-w-lg bg-red-50 border border-red-200 p-4 rounded-lg text-left shadow-sm">
                <p className="text-sm text-red-800 font-bold mb-1">Diagnóstico do Banco de Dados (Primeiro Erro):</p>
                <p className="text-xs text-red-600 font-mono break-words">{resultado.detalheErro}</p>
              </div>
            )}

            <button onClick={() => setResultado(null)} className="mt-4 text-blue-600 font-bold hover:underline">
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <UploadCloud size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Importar Aba "BANCO_DE_DADOS"</h3>
            <p className="text-gray-500 mb-6 max-w-md">O sistema irá ler a planilha e criar os servidores automaticamente filtrando linhas em branco.</p>
            
            <label className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors">
              Selecionar Planilha (.ods / .xlsx)
              <input type="file" accept=".ods, .xlsx" className="hidden" onChange={handleFileUpload} />
            </label>
          </>
        )}
        
      </div>
    </div>
  );
}