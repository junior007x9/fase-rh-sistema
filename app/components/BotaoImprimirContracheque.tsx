// Arquivo: app/components/BotaoImprimirContracheque.tsx
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

type Props = {
  servidor: { nome: string; matricula: string | null; cargo: string | null; lotacao: string | null };
  mesAno: string;
  salarioBase: number;
  lancamentos: any[];
  totais: { proventos: number; descontos: number; liquido: number };
};

export default function BotaoImprimirContracheque({ servidor, mesAno, salarioBase, lancamentos, totais }: Props) {
  
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    
    // Cores oficiais
    const corAzul = [0, 51, 160];
    const corPreta = [0, 0, 0];
    const corVerde = [21, 128, 61]; 
    const corVermelha = [185, 28, 28]; 

    // 1. Cabeçalho Institucional
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(corAzul[0], corAzul[1], corAzul[2]);
    doc.text("FASE/MA - RECURSOS HUMANOS", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
    doc.text("Recibo de Pagamento de Salário", 14, 26);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Competência: ${mesAno.replace('-', '/')}`, 155, 26);

    // 2. Quadro de Dados do Servidor
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 32, 182, 22, 'FD'); // FD = Fill and Draw (Fundo cinza claro e borda)
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Matrícula:", 18, 40);
    doc.setFont("helvetica", "normal");
    doc.text(servidor.matricula || "N/A", 36, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Nome:", 18, 48);
    doc.setFont("helvetica", "normal");
    doc.text(servidor.nome, 30, 48);

    doc.setFont("helvetica", "bold");
    doc.text("Cargo:", 100, 40);
    doc.setFont("helvetica", "normal");
    doc.text(servidor.cargo || "-", 112, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Lotação:", 100, 48);
    doc.setFont("helvetica", "normal");
    doc.text(servidor.lotacao || "-", 115, 48);

    // 3. Montando a Tabela de Eventos
    const linhas = [
      ["001", "Salário Base", "30d", formatarMoeda(salarioBase), "-"]
    ];

    lancamentos.forEach(lan => {
      linhas.push([
        lan.codigoEvento,
        lan.descricaoEvento,
        lan.quantidadeReferencia ? String(lan.quantidadeReferencia) : "-",
        lan.tipo === "PROVENTO" ? formatarMoeda(lan.valorFinal) : "-",
        lan.tipo === "DESCONTO" ? formatarMoeda(lan.valorFinal) : "-"
      ]);
    });

    autoTable(doc, {
      startY: 58,
      head: [["Cód.", "Descrição", "Ref.", "Proventos", "Descontos"]],
      body: linhas,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 35 },
      },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // Pega a posição Y (vertical) onde a tabela terminou
    const finalY = (doc as any).lastAutoTable.finalY + 6;

    // 4. Quadro de Totais
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY, 182, 25, 'FD');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Total de Proventos:", 18, finalY + 8);
    doc.setTextColor(corVerde[0], corVerde[1], corVerde[2]);
    doc.text(formatarMoeda(totais.proventos), 55, finalY + 8);

    doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
    doc.text("Total de Descontos:", 95, finalY + 8);
    doc.setTextColor(corVermelha[0], corVermelha[1], corVermelha[2]);
    doc.text(formatarMoeda(totais.descontos), 132, finalY + 8);

    // Destaque Líquido
    doc.setFillColor(220, 252, 231); // Verde muito claro
    doc.rect(150, finalY, 46, 25, 'F');
    doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
    doc.setFontSize(10);
    doc.text("Líquido a Receber", 154, finalY + 8);
    doc.setFontSize(12);
    doc.setTextColor(corVerde[0], corVerde[1], corVerde[2]);
    doc.text(formatarMoeda(totais.liquido), 154, finalY + 18);

    // 5. Linha de Assinatura
    doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
    doc.setDrawColor(0, 0, 0);
    doc.line(60, finalY + 60, 150, finalY + 60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Assinatura do Servidor", 105, finalY + 66, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Reconheço a exatidão e o recebimento dos valores acima descritos.", 105, finalY + 71, { align: "center" });

    // 6. Salvar Documento
    const nomeArquivo = `Contracheque_${servidor.nome.split(' ')[0]}_${mesAno}.pdf`;
    doc.save(nomeArquivo);
  };

  return (
    <button 
      onClick={gerarPDF}
      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
    >
      <Download size={18} /> Baixar Contracheque PDF
    </button>
  );
}