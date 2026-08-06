// Arquivo: app/importacao/page.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { processarBancoDeDados, zerarBancoDeDados } from "../actions/importacao";

export default function ImportacaoPage() {
  const [carregando, setCarregando] = useState(false);
  const [progressoTexto, setProgressoTexto] = useState("");
  const [resultado, setResultado] = useState<{ cadastrados: number, erros: number, detalheErro?: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setResultado(null);
    setProgressoTexto("Lendo o arquivo Excel...");

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

      // ==============================================================
      // TÉCNICA DE TRÁFEGO FRACIONADO (VENCE O TIMEOUT DO VERCEL)
      // ==============================================================
      let cadastradosTotal = 0;
      let errosTotal = 0;
      let erroDetalhe = "";

      const TAMANHO_PACOTE = 250; // Pacotes pequenos processam em ~4 segundos!
      const totalPacotes = Math.ceil(linhasUteis.length / TAMANHO_PACOTE);

      for (let i = 0; i < totalPacotes; i++) {
        const pacote = linhasUteis.slice(i * TAMANHO_PACOTE, (i + 1) * TAMANHO_PACOTE);
        
        // Atualiza a tela pro usuário saber o que está acontecendo
        setProgressoTexto(`Salvando ${Math.min((i + 1) * TAMANHO_PACOTE, linhasUteis.length)} de ${linhasUteis.length} servidores (Pacote ${i + 1}/${totalPacotes})...`);

        // Envia o pacote para o backend
        const response = await processarBancoDeDados(JSON.stringify(pacote));
        
        cadastradosTotal += response.cadastrados;
        errosTotal += response.erros;
        if (response.detalheErro && !erroDetalhe) {
          erroDetalhe = response.detalheErro;
        }

        // Dá um "respiro" de meio segundo pro banco de dados não bloquear por excesso de acessos simultâneos
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Finaliza mostrando o resultado total!
      setResultado({ 
        cadastrados: cadastradosTotal, 
        erros: errosTotal,
        detalheErro: erroDetalhe
      });

    } catch (error: any) {
      alert(`ERRO TÉCNICO: ${error.message || error}`);
    } finally {
      setCarregando(false);
      setProgressoTexto("");
    }
  };

  const handleZerarBanco = async () => {
    const confirmar = window.confirm(
      "🛑 ATENÇÃO: Isso vai apagar TODOS os servidores, férias, pagamentos e históricos do banco de dados!\n\nTem certeza ABSOLUTA que deseja zerar o sistema?"
    );
    
    if (!confirmar) return;

    setCarregando(true);
    setProgressoTexto("Apagando todos os dados do banco...");
    try {
      const res = await zerarBancoDeDados();
      if (res.sucesso) {
        alert("✅ Banco de Dados ZERADO com sucesso! Você já pode importar a planilha oficial.");
        window.location.reload(); 
      } else {
        alert(`❌ Erro ao zerar banco: ${res.erro}`);
      }
    } catch (error) {
      alert("Erro técnico ao se comunicar com o servidor.");
    } finally {
      setCarregando(false);
      setProgressoTexto("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Importação em Massa</h1>
        <p className="text-gray-500 mt-1">Carregue a planilha oficial (Formato .ods ou .xlsx) para alimentar o sistema automaticamente.</p>
      </header>

      <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm relative">
        
        {carregando ? (
          <div className="flex flex-col items-center space-y-5 py-8">
            <Loader2 size={56} className="text-blue-500 animate-spin" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Processando...</h3>
              <p className="text-blue-600 font-bold mt-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                {progressoTexto}
              </p>
            </div>
            <p className="text-gray-400 text-sm">Não atualize ou feche esta página até a conclusão.</p>
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

            {resultado.erros > 0 && resultado.detalheErro && (
              <div className="mt-4 w-full max-w-lg bg-red-50 border border-red-200 p-4 rounded-lg text-left shadow-sm">
                <p className="text-sm text-red-800 font-bold mb-1">Diagnóstico do Banco de Dados (Primeiro Erro):</p>
                <p className="text-xs text-red-600 font-mono break-words">{resultado.detalheErro}</p>
              </div>
            )}

            <button onClick={() => setResultado(null)} className="mt-4 text-blue-600 font-bold hover:underline">
              Importar outra planilha
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <UploadCloud size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Importar Aba "BANCO_DE_DADOS"</h3>
            <p className="text-gray-500 mb-6 max-w-md">O sistema irá ler a planilha e processar os servidores em lotes menores para evitar falhas de conexão.</p>
            
            <label className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors">
              Selecionar Planilha (.ods / .xlsx)
              <input type="file" accept=".ods, .xlsx" className="hidden" onChange={handleFileUpload} />
            </label>

            <button 
              onClick={handleZerarBanco} 
              className="absolute bottom-4 right-4 flex items-center gap-2 text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors"
            >
              <Trash2 size={14} /> Zerar Banco
            </button>
          </>
        )}
        
      </div>
    </div>
  );
}