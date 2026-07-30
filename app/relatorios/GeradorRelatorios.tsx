// Arquivo: app/relatorios/GeradorRelatorios.tsx
"use client";

import { useState } from "react";
import { FileSpreadsheet, Download, Filter, Calendar } from "lucide-react";

type ServidorData = {
  id: string;
  matricula: string | null;
  nome: string | null;
  cpf: string | null;
  dataNascimento: string | null;
  telefone: string | null;
  email: string | null;
  cargo: string | null;
  lotacao: string | null;
  vinculo: string | null;
  status: string | null;
  dataAdmissao: string | null;
};

export default function GeradorRelatorios({ baseDados }: { baseDados: ServidorData[] }) {
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [mesFiltro, setMesFiltro] = useState("1"); // 1 a 12
  const [statusFiltro, setStatusFiltro] = useState("ATIVO");

  // Função para exportar JSON para CSV
  const baixarCSV = (dados: any[], nomeArquivo: string) => {
    if (dados.length === 0) {
      alert("Nenhum dado encontrado para gerar o relatório.");
      return;
    }

    const colunas = Object.keys(dados[0]);
    const cabecalho = colunas.join(";"); // Usando ponto e vírgula para abrir certinho no Excel PT-BR

    const linhas = dados.map(row => {
      return colunas.map(coluna => {
        const valor = row[coluna] === null || row[coluna] === undefined ? "" : String(row[coluna]);
        return `"${valor.replace(/"/g, '""')}"`;
      }).join(";");
    });

    const csvContent = "\uFEFF" + [cabecalho, ...linhas].join("\n"); // \uFEFF força o UTF-8 no Excel (acentos corretos)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${nomeArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gerarRelatorio = () => {
    let dadosFiltrados = [...baseDados];
    let nomeArquivo = "Relatorio_Servidores";

    // Aplica o filtro de Ativos/Desligados sempre
    if (statusFiltro !== "TODOS") {
      dadosFiltrados = dadosFiltrados.filter(s => s.status === statusFiltro);
    }

    // Aplica filtros específicos
    if (tipoFiltro === "ANIVERSARIANTES") {
      dadosFiltrados = dadosFiltrados.filter(s => {
        if (!s.dataNascimento) return false;
        const mesNascimento = parseInt(s.dataNascimento.split('-')[1]);
        return mesNascimento === parseInt(mesFiltro);
      });
      nomeArquivo = `Aniversariantes_Mes_${mesFiltro}`;
    } else if (tipoFiltro === "EFETIVOS") {
      dadosFiltrados = dadosFiltrados.filter(s => s.vinculo === "EFETIVO");
      nomeArquivo = "Servidores_Efetivos";
    } else if (tipoFiltro === "CONTRATADOS") {
      dadosFiltrados = dadosFiltrados.filter(s => s.vinculo === "CONTRATADO");
      nomeArquivo = "Servidores_Contratados";
    }

    // Mapear os dados para deixar a planilha amigável (remover IDs inúteis, formatar nomes de colunas)
    const dadosParaPlanilha = dadosFiltrados.map(s => ({
      "Matrícula": s.matricula || "-",
      "Nome Completo": s.nome,
      "CPF": s.cpf,
      "Data Nascimento": s.dataNascimento ? s.dataNascimento.split('-').reverse().join('/') : "-", // Muda de YYYY-MM-DD para DD/MM/YYYY
      "Cargo": s.cargo || "-",
      "Lotação": s.lotacao || "-",
      "Vínculo": s.vinculo,
      "Status": s.status,
      "Data Admissão": s.dataAdmissao ? s.dataAdmissao.split('-').reverse().join('/') : "-",
      "Telefone": s.telefone,
      "E-mail": s.email
    }));

    baixarCSV(dadosParaPlanilha, nomeArquivo);
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Parâmetros do Relatório</h2>
          <p className="text-sm text-gray-500">Selecione o que deseja exportar para o Excel (CSV).</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* SELEÇÃO PRINCIPAL */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Filter size={16} /> Que tipo de relatório deseja gerar?
          </label>
          <select 
            value={tipoFiltro} 
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Listagem Geral (Todos os Servidores)</option>
            <option value="ANIVERSARIANTES">Aniversariantes por Mês</option>
            <option value="EFETIVOS">Apenas Servidores Efetivos</option>
            <option value="CONTRATADOS">Apenas Servidores Contratados</option>
          </select>
        </div>

        {/* SELEÇÃO CONDICIONAL (Só aparece se for aniversariantes) */}
        {tipoFiltro === "ANIVERSARIANTES" && (
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
            <label className="block text-sm font-bold text-pink-900 mb-2 flex items-center gap-2">
              <Calendar size={16} /> Qual mês deseja consultar?
            </label>
            <select 
              value={mesFiltro} 
              onChange={(e) => setMesFiltro(e.target.value)}
              className="w-full border border-pink-300 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-pink-500 text-pink-900 font-medium"
            >
              <option value="1">Janeiro</option><option value="2">Fevereiro</option><option value="3">Março</option>
              <option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option>
              <option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option>
              <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
            </select>
          </div>
        )}

        {/* STATUS DO SERVIDOR */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Filtrar por Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="ATIVO" checked={statusFiltro === "ATIVO"} onChange={() => setStatusFiltro("ATIVO")} className="w-4 h-4 text-blue-600" />
              <span>Apenas Ativos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="DESLIGADO" checked={statusFiltro === "DESLIGADO"} onChange={() => setStatusFiltro("DESLIGADO")} className="w-4 h-4 text-blue-600" />
              <span>Apenas Desligados</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value="TODOS" checked={statusFiltro === "TODOS"} onChange={() => setStatusFiltro("TODOS")} className="w-4 h-4 text-blue-600" />
              <span>Todos (Ignorar Status)</span>
            </label>
          </div>
        </div>

        <button 
          onClick={gerarRelatorio}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Download size={20} /> Baixar Relatório (Excel / CSV)
        </button>

      </div>
    </div>
  );
}