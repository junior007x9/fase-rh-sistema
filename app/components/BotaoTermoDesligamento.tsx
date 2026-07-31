// Arquivo: app/components/BotaoTermoDesligamento.tsx
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileWarning, Loader2 } from "lucide-react";

type Props = { servidor: any; pessoal: any; folhaRescisao: any[] };

export default function BotaoTermoDesligamento({ servidor, pessoal, folhaRescisao }: Props) {
  const [gerando, setGerando] = useState(false);

  const gerarTermo = async () => {
    setGerando(true);
    try {
      const doc = new jsPDF();
      
      // LOGO E CABEÇALHO
      try {
        const img = new Image(); img.src = "/logo.jpg";
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        doc.addImage(img, "JPEG", 14, 10, 35, 18);
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(0, 51, 160);
        doc.text("FASE/MA - RECURSOS HUMANOS", 55, 18);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", 55, 23);
      } catch (e) {}

      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(0, 0, 0);
      doc.text("TERMO DE RESCISÃO DO CONTRATO DE TRABALHO", 105, 40, { align: "center" });

      // DADOS DO TRABALHADOR
      autoTable(doc, {
        startY: 50,
        head: [["DADOS DO SERVIDOR E DESLIGAMENTO"]],
        body: [
          [`Nome: ${pessoal.nome}   |   CPF: ${pessoal.cpf}`],
          [`Cargo: ${servidor.cargo}   |   Matrícula: ${servidor.matricula}`],
          [`Data Admissão: ${servidor.dataAdmissao?.split('-').reverse().join('/')}   |   Data Afastamento: ${servidor.dataDesligamento?.split('-').reverse().join('/')}`],
          [`Motivo da Rescisão: ${servidor.motivoDesligamento}`]
        ],
        theme: 'grid', headStyles: { fillColor: [0, 51, 160] }, styles: { fontSize: 9 }
      });

      // VERBAS RESCISÓRIAS (Puxando do banco financeiro que criamos no módulo de Folha)
      let totalProv = 0, totalDesc = 0;
      const linhasVerbas = folhaRescisao.map(lan => {
        if (lan.tipo === "PROVENTO") totalProv += lan.valorFinal;
        if (lan.tipo === "DESCONTO") totalDesc += lan.valorFinal;
        return [
          lan.descricaoEvento,
          lan.quantidadeReferencia || "-",
          lan.tipo === "PROVENTO" ? `R$ ${lan.valorFinal.toFixed(2)}` : "-",
          lan.tipo === "DESCONTO" ? `R$ ${lan.valorFinal.toFixed(2)}` : "-"
        ];
      });

      if (linhasVerbas.length === 0) linhasVerbas.push(["Nenhum cálculo de rescisão processado na Folha.", "-", "-", "-"]);

      const yVerbas = (doc as any).lastAutoTable.finalY + 10;
      autoTable(doc, {
        startY: yVerbas,
        head: [["Descrição das Verbas", "Ref.", "Proventos", "Descontos"]],
        body: linhasVerbas,
        theme: 'grid', headStyles: { fillColor: [50, 50, 50] }, styles: { fontSize: 9 }
      });

      // TOTALIZADORES
      const liquido = totalProv - totalDesc;
      const yTotal = (doc as any).lastAutoTable.finalY + 5;
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text(`Total de Proventos: R$ ${totalProv.toFixed(2)}`, 14, yTotal);
      doc.text(`Total de Descontos: R$ ${totalDesc.toFixed(2)}`, 80, yTotal);
      doc.setTextColor(0, 128, 0); // Verde para o líquido
      doc.text(`VALOR LÍQUIDO RESCISÓRIO: R$ ${liquido.toFixed(2)}`, 140, yTotal);

      // ASSINATURAS
      doc.setTextColor(0, 0, 0);
      const finalY = yTotal + 40;
      doc.setDrawColor(100, 100, 100);
      doc.line(20, finalY, 90, finalY); doc.line(120, finalY, 190, finalY);
      doc.setFontSize(9);
      doc.text("FASE/MA (Empregador)", 55, finalY + 5, { align: "center" });
      doc.text("Assinatura do Servidor", 155, finalY + 5, { align: "center" });

      doc.save(`Termo_Rescisao_${pessoal.nome?.split(' ')[0]}.pdf`);
    } catch (error) {
      alert("Erro ao gerar termo.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <button onClick={gerarTermo} disabled={gerando} className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
      {gerando ? <Loader2 size={16} className="animate-spin" /> : <FileWarning size={16} />} Termo de Rescisão
    </button>
  );
}