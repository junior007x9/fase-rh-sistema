// Arquivo: components/ExportarBotoes.tsx
"use client";

import { FileDown, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  cargos: any[];
  lotacoes: any[];
}

export default function ExportarBotoes({ cargos, lotacoes }: Props) {
  
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsCargos = XLSX.utils.json_to_sheet(cargos);
    const wsLotacoes = XLSX.utils.json_to_sheet(lotacoes);
    XLSX.utils.book_append_sheet(wb, wsCargos, "Por Cargo");
    XLSX.utils.book_append_sheet(wb, wsLotacoes, "Por Lotação");
    XLSX.writeFile(wb, "Relatorio_FASE_MA.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Servidores - FASE MA", 14, 15);
    
    // Tabela Cargos
    doc.text("Quantitativo por Cargo", 14, 25);
    autoTable(doc, { startY: 30, head: [["Cargo", "Quantidade"]], body: cargos.map(c => [c.cargo, c.quantidade]) });
    
    // Tabela Lotações
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.text("Quantitativo por Lotação", 14, finalY + 10);
    autoTable(doc, { startY: finalY + 15, head: [["Lotação", "Sigla", "Quantidade"]], body: lotacoes.map(l => [l.lotacao, l.sigla, l.quantidade]) });
    
    doc.save("Relatorio_FASE_MA.pdf");
  };

  return (
    <div className="flex gap-3">
      <button onClick={exportarExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
        <FileDown size={18} /> Baixar Excel
      </button>
      <button onClick={exportarPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
        <FileText size={18} /> Baixar PDF
      </button>
    </div>
  );
}