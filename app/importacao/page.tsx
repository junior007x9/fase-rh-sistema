// Arquivo: app/importacao/page.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { processarBancoDeDados } from "../actions/importacao";

export default function ImportacaoPage() {
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<{ cadastrados: number, erros: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setResultado(null);

    try {
      // 1. Ler o arquivo usando o FileReader
      const data = await file.arrayBuffer();
      
      // 2. Processar a planilha usando a biblioteca xlsx
      const workbook = XLSX.read(data, { type: "array" });
      
      // 3. Buscar a aba exata do Banco de Dados
      const nomeAba = "BANCO_DE_DADOS";
      const sheet = workbook.Sheets[nomeAba];
      
      if (!sheet) {
        alert(`A aba "${nomeAba}" não foi encontrada no arquivo. Verifique se o nome está exato.`);
        setCarregando(false);
        return;
      }

      // 4. Converter a aba para uma Matriz (Array de Arrays) mantendo as datas formatadas como texto
      const linhas: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });

      // 5. Enviar para a Action no Backend processar
      const response = await processarBancoDeDados(linhas);
      
      setResultado({ cadastrados: response.cadastrados, erros: response.erros });

    } catch (error) {
      console.error("Erro ao ler o arquivo:", error);
      alert("Houve um problema ao ler o arquivo. Certifique-se de que é um formato suportado (.ods ou .xlsx).");
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
            <p className="text-gray-500">Estamos lendo o arquivo e salvando os servidores no banco de dados. Isso pode levar alguns segundos.</p>
          </div>
        ) : resultado ? (
          <div className="flex flex-col items-center space-y-4">
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
            <button onClick={() => setResultado(null)} className="mt-4 text-blue-600 font-bold hover:underline">
              Importar outro arquivo
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <UploadCloud size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Importar Aba "BANCO_DE_DADOS"</h3>
            <p className="text-gray-500 mb-6 max-w-md">O sistema irá ler a coluna A até a AE para criar o cadastro completo, dados bancários e remuneração base dos servidores.</p>
            
            <label className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors">
              Selecionar Planilha (.ods)
              <input type="file" accept=".ods, .xlsx" className="hidden" onChange={handleFileUpload} />
            </label>
          </>
        )}
        
      </div>
    </div>
  );
}