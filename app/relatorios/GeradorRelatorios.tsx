// Arquivo: app/relatorios/GeradorRelatorios.tsx
"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Filter, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataExibicao } from "../utils/formatters";

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
  // FUNÇÃO 1: GERAR EXCEL COM CORES E ESTILO
  // ==========================================
  const baixarExcel = (dados: any[], nomeArquivo: string, tituloRelatorio: string) => {
    if (dados.length === 0) return alert("Nenhum dado encontrado para os filtros selecionados.");

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const chavesColunas = Object.keys(dados[0]);

    const worksheetData: any[][] = [
      [{ v: "FASE/MA - Recursos Humanos", s: { font: { bold: true, sz: 14, color: { rgb: "0033A0" } } } }],
      [{ v: "FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO - FASE/MA", s: { font: { bold: true, sz: 10, color: { rgb: "555555" } } } }],
      [{ v: tituloRelatorio, s: { font: { italic: true, bold: true, sz: 11, color: { rgb: "0033A0" } } } }],
      [{ v: `Gerado em: ${dataAtual}`, s: { font: { italic: true, sz: 9, color: { rgb: "888888" } } } }],
      [] // Linha em branco
    ];

    // Linha de Cabeçalho da Tabela Estilizada (Azul FASE-MA com texto Branco)
    const cabecalhoEstilizado = chavesColunas.map(coluna => ({
      v: coluna,
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        fill: { fgColor: { rgb: "0033A0" } }, // Azul institucional
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      }
    }));
    worksheetData.push(cabecalhoEstilizado);

    // Linhas de Dados com Cores Alternadas (Zebra)
    dados.forEach((row, rowIndex) => {
      const corFundo = rowIndex % 2 === 0 ? "F5F8FF" : "FFFFFF"; // Azul bem clarinho alternado
      const linhaFormatada = chavesColunas.map(coluna => {
        const valor = row[coluna] === null || row[coluna] === undefined ? "-" : String(row[coluna]);
        
        // Alinhamento central para algumas colunas específicas
        let alinhamento: "left" | "center" = "left";
        if (coluna === "Matrícula" || coluna === "CPF" || coluna === "Nascimento" || coluna === "Status" || coluna === "Admissão") {
          alinhamento = "center";
        }

        return {
          v: valor,
          s: {
            font: { sz: 10, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: corFundo } },
            alignment: { horizontal: alinhamento, vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
          }
        };
      });
      worksheetData.push(linhaFormatada);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Largura automática ajustada para as colunas
    worksheet['!cols'] = [
      { wch: 15 }, // Matrícula
      { wch: 32 }, // Nome Completo
      { wch: 16 }, // CPF
      { wch: 14 }, // Nascimento
      { wch: 25 }, // Cargo
      { wch: 38 }, // Lotação
      { wch: 16 }, // Vínculo
      { wch: 12 }, // Status
      { wch: 14 }  // Admissão
    ];

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
        // Pega o mês preservando o formato padrão (YYYY-MM-DD)
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
      // Aplicando a nossa blindagem e formatação premium nas datas!
      "Nascimento": formatarDataExibicao(s.dataNascimento) || "-",
      "Cargo": s.cargo || "-",
      "Lotação": s.lotacao || "-",
      "Vínculo": s.vinculo,
      "Status": s.status,
      "Admissão": formatarDataExibicao(s.dataAdmissao) || "-"
    }));

    if (formato === "EXCEL") baixarExcel(dadosParaPlanilha, nomeArquivo, tituloRelatorio);
    if (formato === "PDF") await baixarPDF(dadosParaPlanilha, nomeArquivo, tituloRelatorio);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Parâmetros do Relatório</h2>
          <p className="text-sm text-slate-500">Gere relatórios customizados com a identidade da FASE-MA.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Filter size={14} className="text-blue-500" /> Que tipo de relatório deseja gerar?
          </label>
          <select 
            value={tipoFiltro} 
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 font-semibold transition-colors"
          >
            <option value="TODOS">Listagem Geral (Todos os Servidores)</option>
            <option value="ANIVERSARIANTES">Aniversariantes por Mês</option>
            <option value="EFETIVOS">Apenas Servidores Efetivos</option>
            <option value="CONTRATADOS">Apenas Servidores Contratados</option>
          </select>
        </div>

        {tipoFiltro === "ANIVERSARIANTES" && (
          <div className="bg-pink-50/50 p-5 rounded-xl border border-pink-100">
            <label className="block text-[10px] font-bold text-pink-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Calendar size={14} /> Qual mês deseja consultar?
            </label>
            <select 
              value={mesFiltro} 
              onChange={(e) => setMesFiltro(e.target.value)}
              className="w-full border border-pink-200 p-3 text-sm rounded-xl bg-white outline-none focus:ring-2 focus:ring-pink-500 text-pink-800 font-bold transition-colors"
            >
              <option value="1">Janeiro</option><option value="2">Fevereiro</option><option value="3">Março</option>
              <option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option>
              <option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option>
              <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-3">Filtrar por Status do Servidor</label>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="status" value="ATIVO" checked={statusFiltro === "ATIVO"} onChange={() => setStatusFiltro("ATIVO")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">Apenas Ativos</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="status" value="DESLIGADO" checked={statusFiltro === "DESLIGADO"} onChange={() => setStatusFiltro("DESLIGADO")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">Apenas Desligados</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="status" value="TODOS" checked={statusFiltro === "TODOS"} onChange={() => setStatusFiltro("TODOS")} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">Todos (Ignorar Status)</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <button 
            onClick={() => prepararGeracao("PDF")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileText size={18} /> Baixar PDF
          </button>
          
          <button 
            onClick={() => prepararGeracao("EXCEL")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileSpreadsheet size={18} /> Baixar Excel (.xlsx)
          </button>
        </div>

      </div>
    </div>
  );
}