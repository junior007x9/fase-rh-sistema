// Arquivo: app/components/BotaoImprimirContracheque.tsx
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Loader2 } from "lucide-react";

type Props = {
  servidor: { nome: string; matricula: string | null; cargo: string | null; lotacao: string | null };
  mesAno: string;
  salarioBase: number;
  lancamentos: any[];
  totais: { proventos: number; descontos: number; liquido: number };
};

export default function BotaoImprimirContracheque({ servidor, mesAno, salarioBase, lancamentos, totais }: Props) {
  const [gerando, setGerando] = useState(false);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const obterBase64DaImagem = async (url: string): Promise<string | null> => {
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) return null;
      const blob = await resposta.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const gerarPDF = async () => {
    setGerando(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoBase64 = await obterBase64DaImagem('/logo.jpg');

      const corAzul = [0, 51, 160] as [number, number, number];
      const corVermelha = [218, 41, 28] as [number, number, number];
      const corAmarela = [242, 169, 0] as [number, number, number];
      const corVerde = [21, 128, 61] as [number, number, number];
      const corPreta = [0, 0, 0] as [number, number, number];

      const desenharVia = (offsetY: number, tituloVia: string) => {
        doc.setFillColor(corVermelha[0], corVermelha[1], corVermelha[2]);
        doc.rect(0, offsetY, pageWidth / 3, 3, 'F');
        doc.setFillColor(corAmarela[0], corAmarela[1], corAmarela[2]);
        doc.rect(pageWidth / 3, offsetY, pageWidth / 3, 3, 'F');
        doc.setFillColor(corAzul[0], corAzul[1], corAzul[2]);
        doc.rect((pageWidth / 3) * 2, offsetY, pageWidth / 3, 3, 'F');

        let margemTexto = 14;
        if (logoBase64) {
          doc.addImage(logoBase64, 'JPEG', 14, offsetY + 6, 22, 22);
          margemTexto = 40;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
        doc.text("FASE/MA - RECURSOS HUMANOS", margemTexto, offsetY + 12);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", margemTexto, offsetY + 17);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(corAzul[0], corAzul[1], corAzul[2]);
        doc.text("RECIBO DE PAGAMENTO DE SALÁRIO", margemTexto, offsetY + 24);

        doc.setFontSize(9);
        doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
        doc.text(`Competência: ${mesAno.replace('-', '/')}`, 160, offsetY + 12);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text(tituloVia, 160, offsetY + 17);

        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.rect(14, offsetY + 30, 182, 28, 'FD'); 
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
        
        doc.text(`Matrícula:`, 18, offsetY + 36);
        doc.setFont("helvetica", "normal");
        doc.text(`${servidor.matricula || "N/A"}`, 35, offsetY + 36);
        
        doc.setFont("helvetica", "bold");
        doc.text(`Cargo / Função:`, 90, offsetY + 36);
        doc.setFont("helvetica", "normal");
        doc.text(`${servidor.cargo || "-"}`, 118, offsetY + 36, { maxWidth: 75 });

        doc.setFont("helvetica", "bold");
        doc.text(`Nome:`, 18, offsetY + 44);
        doc.setFont("helvetica", "normal");
        doc.text(`${servidor.nome}`, 30, offsetY + 44, { maxWidth: 160 });

        doc.setFont("helvetica", "bold");
        doc.text(`Lotação:`, 18, offsetY + 52);
        doc.setFont("helvetica", "normal");
        doc.text(`${servidor.lotacao || "-"}`, 33, offsetY + 52, { maxWidth: 160 });

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
          startY: offsetY + 62,
          head: [["Cód.", "Descrição", "Ref.", "Proventos", "Descontos"]],
          body: linhas,
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'right', cellWidth: 35 },
            4: { halign: 'right', cellWidth: 35 },
          },
          styles: { fontSize: 8, cellPadding: 2, textColor: [30, 30, 30] },
          alternateRowStyles: { fillColor: [252, 252, 252] },
          margin: { left: 14, right: 14 }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 4;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(200, 200, 200);
        doc.rect(14, finalY, 182, 18, 'FD');
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Total de Proventos:", 18, finalY + 7);
        doc.setTextColor(corVerde[0], corVerde[1], corVerde[2]);
        doc.text(formatarMoeda(totais.proventos), 50, finalY + 7);

        doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
        doc.text("Total de Descontos:", 85, finalY + 7);
        doc.setTextColor(corVermelha[0], corVermelha[1], corVermelha[2]);
        doc.text(formatarMoeda(totais.descontos), 118, finalY + 7);

        doc.setFillColor(220, 252, 231); 
        doc.rect(152, finalY, 44, 18, 'F');
        doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
        doc.setFontSize(8);
        doc.text("Líquido a Receber", 155, finalY + 6);
        doc.setFontSize(11);
        doc.setTextColor(corVerde[0], corVerde[1], corVerde[2]);
        doc.text(formatarMoeda(totais.liquido), 155, finalY + 13);

        doc.setTextColor(corPreta[0], corPreta[1], corPreta[2]);
        doc.setDrawColor(150, 150, 150);
        doc.line(60, finalY + 38, 150, finalY + 38);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Assinatura do Servidor", 105, finalY + 43, { align: "center" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("Reconheço a exatidão e o recebimento dos valores acima descritos.", 105, finalY + 47, { align: "center" });
      };

      desenharVia(0, "1ª Via - Recursos Humanos");

      // CORREÇÃO DO TYPESCRIPT AQUI! (Usando "as any")
      doc.setDrawColor(180, 180, 180);
      (doc as any).setLineDash([2, 2], 0);
      doc.line(14, 148, 196, 148);
      (doc as any).setLineDash([], 0); 
      
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text("✄ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -", 105, 147, { align: "center" });

      desenharVia(153, "2ª Via - Servidor");

      const nomeArquivo = `Contracheque_${servidor.nome.split(' ')[0]}_${mesAno}.pdf`;
      doc.save(nomeArquivo);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o contracheque. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <button 
      onClick={gerarPDF}
      disabled={gerando}
      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
    >
      {gerando ? (
        <><Loader2 size={18} className="animate-spin" /> Gerando PDF...</>
      ) : (
        <><Download size={18} /> Baixar Contracheque Oficial</>
      )}
    </button>
  );
}