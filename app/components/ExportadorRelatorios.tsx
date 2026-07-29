// Arquivo: app/components/ExportadorRelatorios.tsx
"use client";

import { FileText, FileSpreadsheet, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useState } from "react";

export default function ExportadorRelatorios({ dados }: { dados: any[] }) {
  const [gerando, setGerando] = useState(false);

  // CORES DO MARANHÃO / FASE
  const corAzul = [0, 40, 104]; // Azul escuro
  const corVermelha = [206, 24, 30]; // Vermelho Maranhão
  const corAmarela = [244, 192, 30]; // Amarelo
  const corCinza = [240, 244, 248]; // Fundo zebrado

  // ==========================================
  // 📄 GERAÇÃO DE PDF FORMATADO
  // ==========================================
  const gerarPDF = () => {
    setGerando(true);
    const doc = new jsPDF("landscape"); // Paisagem para caber a tabela

    // Carregar o Logo da FASE (que está na sua pasta public)
    const img = new window.Image();
    img.src = "/logo.jpg";
    img.onload = () => {
      // 1. Cabeçalho com Logo
      doc.addImage(img, "JPEG", 14, 10, 35, 30);

      // 2. Títulos
      doc.setFontSize(16);
      doc.setTextColor(corAzul[0], corAzul[1], corAzul[2]);
      doc.setFont("helvetica", "bold");
      doc.text("FASE - FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO", 55, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text("Governo do Estado do Maranhão", 55, 26);
      doc.text("Relatório Analítico de Servidores e Lotações", 55, 32);

      // 3. Linha decorativa com as cores do Maranhão
      doc.setDrawColor(corVermelha[0], corVermelha[1], corVermelha[2]);
      doc.setLineWidth(1.5);
      doc.line(14, 45, 140, 45); // Linha Vermelha
      doc.setDrawColor(corAmarela[0], corAmarela[1], corAmarela[2]);
      doc.line(140, 45, 282, 45); // Linha Amarela

      // 4. Data de Geração
      doc.setFontSize(9);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 235, 38);

      // 5. Estruturar os dados para a tabela
      const tableData = dados.map((d) => [
        d.nome,
        d.cpf,
        d.vinculo,
        d.status,
        new Date(d.dataAdmissao).toLocaleDateString("pt-BR"),
      ]);

      // 6. Gerar Tabela Estilizada
      autoTable(doc, {
        startY: 50,
        head: [["Nome Completo", "CPF", "Vínculo", "Status", "Data Admissão"]],
        body: tableData,
        headStyles: {
          fillColor: corAzul as [number, number, number],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: corCinza as [number, number, number] },
        styles: { fontSize: 10, cellPadding: 4 },
      });

      // 7. Salvar o arquivo
      doc.save("Relatorio_Servidores_FASE_MA.pdf");
      setGerando(false);
    };
  };

  // ==========================================
  // 📊 GERAÇÃO DE EXCEL (PLANILHA INTELIGENTE)
  // ==========================================
  const gerarExcel = async () => {
    setGerando(true);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Servidores FASE");

    // 1. Configurar as Colunas
    worksheet.columns = [
      { header: "Nome Completo", key: "nome", width: 45 },
      { header: "CPF", key: "cpf", width: 18 },
      { header: "Vínculo", key: "vinculo", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Data Admissão", key: "dataAdmissao", width: 20 },
    ];

    // 2. Estilizar o Cabeçalho (Azul Maranhão com texto Branco)
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF002868" }, // Azul Escuro
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 12 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FFCE181E" } }, // Borda inferior vermelha
      };
    });

    // 3. Inserir Dados e Colocar Bordas
    dados.forEach((d) => {
      const row = worksheet.addRow({
        nome: d.nome,
        cpf: d.cpf,
        vinculo: d.vinculo,
        status: d.status,
        dataAdmissao: new Date(d.dataAdmissao).toLocaleDateString("pt-BR"),
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // 4. Salvar o arquivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "Relatorio_Servidores_FASE_MA.xlsx");
    setGerando(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* CARD PDF */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-red-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
        <div className="bg-red-50 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
          <FileText size={32} className="text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Documento Oficial PDF</h3>
        <p className="text-slate-500 mb-6">Gera um relatório formatado, com timbre e o logo da FASE-MA. Ideal para impressão e assinaturas.</p>
        <button 
          onClick={gerarPDF} 
          disabled={gerando}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
        >
          <Download size={20} /> Baixar PDF
        </button>
      </div>

      {/* CARD EXCEL */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
        <div className="bg-green-50 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
          <FileSpreadsheet size={32} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Planilha Inteligente</h3>
        <p className="text-slate-500 mb-6">Gera um arquivo Excel estruturado e estilizado. Perfeito para auditorias, filtros e cálculos avançados.</p>
        <button 
          onClick={gerarExcel} 
          disabled={gerando}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
        >
          <Download size={20} /> Baixar Excel
        </button>
      </div>
    </div>
  );
}