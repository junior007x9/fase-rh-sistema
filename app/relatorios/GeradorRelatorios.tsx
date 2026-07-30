// Arquivo: app/relatorios/GeradorRelatorios.tsx
"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Filter, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx"; // Importando a biblioteca de Excel profissional

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
  const [mesFiltro, setMesFiltro] = useState("1");
  const [statusFiltro, setStatusFiltro] = useState("ATIVO");

  const obterBase64DaImagem = async (url: string): Promise<string | null> => {
    try {
      const resposta = await fetch(url);
      if (!resposta.ok || !resposta.headers.get('content-type')?.includes('image')) return null;
      const blob = await resposta.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // ==========================================
  // FUNÇÃO 1: GERAR EXCEL PROFISSIONAL (.XLSX)
  // ==========================================
  const baixarExcel = (dados: any[], nomeArquivo: string, tituloRelatorio: string) => {
    if (dados.length === 0) return alert("Nenhum dado encontrado para os filtros selecionados.");

    // Criamos a estrutura de linhas da planilha com o cabeçalho institucional igual ao PDF
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    const linhasDoExcel = [
      ["FASE/MA - Recursos Humanos"],
      ["FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO - FASE/MA"],
      [tituloRelatorio],
      [`Gerado em: ${dataAtual}`],
      [], // Linha em branco para espaçamento
      // Cabeçalho da Tabela
      Object.keys(dados[0])
    ];

    // Adiciona os dados dos servidores abaixo
    dados.forEach(row => {
      linhasDoExcel.push(Object.values(row).map(val => val === null || val === undefined ? "-" : String(val)));
    });

    // Cria a planilha a partir da matriz de dados
    const worksheet = XLSX.utils.aoa_to_sheet(linhasDoExcel);

    // Ajuste automático da largura das colunas para não cortar os textos (como os nomes e lotações)
    const colWidths = [
      { wch: 12 }, // Matrícula
      { wch: 30 }, // Nome Completo
      { wch: 15 }, // CPF
      { wch: 14 }, // Nascimento
      { wch: 25 }, // Cargo
      { wch: 35 }, // Lotação
      { wch: 15 }, // Vínculo
      { wch: 12 }, // Status
      { wch: 14 }  // Admissão
    ];
    worksheet['!cols'] = colWidths;

    // Cria o arquivo Workbook e dispara o download
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `${nomeArquivo}.xlsx`);
  };

  // ==========================================
  // FUNÇÃO 2: GERAR PDF (COM LOGO E CORES)
  // ==========================================
  const baixarPDF = async (dados: any[], nomeArquivo: string, tituloRelatorio: string) => {
    if (dados.length === 0) return alert("Nenhum dado encontrado para os filtros selecionados.");

    const doc = new jsPDF('landscape'); 

    const corAzul = [0, 51, 160];
    const corVermelha = [218, 41, 28];
    const corAmarela = [242, 169, 0];
    const corPreta = [0, 0, 0];

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(corVermelha[0], corVermelha[1], corVermelha[2]);
    doc.rect(0, 0, pageWidth / 3, 4, 'F');
    doc.setFillColor(corAmarela[0], corAmarela[1], corAmarela[2]);
    doc.rect(pageWidth / 3, 0, pageWidth / 3, 4, 'F');
    doc.setFillColor(corAzul[0], corAzul[1], corAzul[2]);
    doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 4, 'F');

    const logoBase64 = await obterBase64DaImagem('/logo.jpg');
    let margemTexto = 14;
    
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', 14, 8, 24, 24); 
        margemTexto = 42; 
      } catch {
        console.warn("Falha ao desenhar a imagem no PDF.");
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
    doc.text("FASE/MA - Recursos Humanos", margemTexto, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO - FASE/MA", margemTexto, 22);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(corAzul[0], corAzul[1], corAzul[2]);
    doc.text(tituloRelatorio, margemTexto, 29);

    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em: ${dataAtual}`, pageWidth - 14, 18, { align: 'right' });

    const colunas = Object.keys(dados[0]);
    const linhas = dados.map(row => Object.values(row).map(val => val === null || val === undefined ? "-" : String(val)));

    autoTable(doc, {
      head: [colunas],
      body: linhas,
      startY: 38,
      theme: 'grid',
      headStyles: { 
        fillColor: corAzul as [number, number, number], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [245, 248, 255] }, 
      styles: { 
        fontSize: 7.5, 
        cellPadding: 2,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 18 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 18 },
      }
    });

    doc.save(`${nomeArquivo}.pdf`);
  };

  // ==========================================
  // FUNÇÃO PRINCIPAL
  // ==========================================
  const prepararGeracao = async (formato: "EXCEL" | "PDF") => {
    let dadosFiltrados = [...baseDados];
    let nomeArquivo = "Relatorio_Servidores";
    let tituloRelatorio = "Relatório Geral de Servidores";

    if (statusFiltro !== "TODOS") {
      dadosFiltrados = dadosFiltrados.filter(s => s.status === statusFiltro);
      tituloRelatorio += ` (${statusFiltro})`;
    }

    if (tipoFiltro === "ANIVERSARIANTES") {
      dadosFiltrados = dadosFiltrados.filter(s => {
        if (!s.dataNascimento) return false;
        const mesNascimento = parseInt(s.dataNascimento.split('-')[1]);
        return mesNascimento === parseInt(mesFiltro);
      });
      const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      nomeArquivo = `Aniversariantes_${nomesMeses[parseInt(mesFiltro)-1]}`;
      tituloRelatorio = `Relatório de Aniversariantes - Mês: ${nomesMeses[parseInt(mesFiltro)-1]}`;
    } else if (tipoFiltro === "EFETIVOS") {
      dadosFiltrados = dadosFiltrados.filter(s => s.vinculo === "EFETIVO");
      nomeArquivo = "Servidores_Efetivos";
      tituloRelatorio = "Relatório de Servidores Efetivos";
    } else if (tipoFiltro === "CONTRATADOS") {
      dadosFiltrados = dadosFiltrados.filter(s => s.vinculo === "CONTRATADO");
      nomeArquivo = "Servidores_Contratados";
      tituloRelatorio = "Relatório de Servidores Contratados";
    }

    const dadosParaPlanilha = dadosFiltrados.map(s => ({
      "Matrícula": s.matricula || "-",
      "Nome Completo": s.nome,
      "CPF": s.cpf,
      "Nascimento": s.dataNascimento ? s.dataNascimento.split('-').reverse().join('/') : "-",
      "Cargo": s.cargo || "-",
      "Lotação": s.lotacao || "-",
      "Vínculo": s.vinculo,
      "Status": s.status,
      "Admissão": s.dataAdmissao ? s.dataAdmissao.split('-').reverse().join('/') : "-"
    }));

    if (formato === "EXCEL") baixarExcel(dadosParaPlanilha, nomeArquivo, tituloRelatorio);
    if (formato === "PDF") await baixarPDF(dadosParaPlanilha, nomeArquivo, tituloRelatorio);
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Parâmetros do Relatório</h2>
          <p className="text-sm text-gray-500">Gere relatórios customizados com a identidade da FASE-MA.</p>
        </div>
      </div>

      <div className="space-y-6">
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <button 
            onClick={() => prepararGeracao("PDF")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <FileText size={20} /> Baixar PDF
          </button>
          
          <button 
            onClick={() => prepararGeracao("EXCEL")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <FileSpreadsheet size={20} /> Baixar Excel (.xlsx)
          </button>
        </div>

      </div>
    </div>
  );
}