// Arquivo: app/components/BotaoDeclaracaoVinculo.tsx
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Loader2 } from "lucide-react";

type Props = {
  servidor: any;
  pessoal: any;
  historico: any[];
};

export default function BotaoDeclaracaoVinculo({ servidor, pessoal, historico }: Props) {
  const [gerando, setGerando] = useState(false);

  const gerarDeclaracao = async () => {
    setGerando(true);
    try {
      const doc = new jsPDF();
      
      // 1. CABEÇALHO COM LOGO OFICIAL
      try {
        const img = new Image();
        img.src = "/logo.jpg";
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        doc.addImage(img, "JPEG", 14, 10, 35, 18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 160);
        doc.text("FASE/MA - RECURSOS HUMANOS", 55, 18);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", 55, 23);
      } catch (e) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(0, 51, 160);
        doc.text("FASE/MA - RECURSOS HUMANOS", 14, 18);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("DECLARAÇÃO DE VÍNCULO EMPREGATÍCIO", 105, 45, { align: "center" });

      // 2. TEXTO DA DECLARAÇÃO
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setLineHeightFactor(1.5);
      
      const dataAdmissao = servidor.dataAdmissao?.split('-').reverse().join('/') || "___/___/_____";
      const dataDesligamento = servidor.dataDesligamento?.split('-').reverse().join('/');
      const periodoTexto = servidor.status === 'ATIVO' 
        ? `desde o dia ${dataAdmissao}, encontrando-se atualmente ATIVO` 
        : `no período de ${dataAdmissao} a ${dataDesligamento}`;

      const textoDeclaracao = `Declaramos para os devidos fins que o(a) Sr(a). ${pessoal.nome}, inscrito(a) no CPF sob o nº ${pessoal.cpf || "não informado"} e RG nº ${pessoal.rg || "não informado"}, mantém/manteve vínculo empregatício com a Fundação de Atendimento Socioeducativo do Maranhão (FASE/MA), matrícula nº ${servidor.matricula || "S/N"}, ${periodoTexto}, exercendo o cargo de ${servidor.cargo} na lotação de ${servidor.lotacao}.`;

      doc.text(textoDeclaracao, 14, 60, { maxWidth: 180, align: "justify" });

      // 3. TABELA DE HISTÓRICO CONTRATUAL E LOTAÇÕES
      const bodyHistorico = historico.length > 0 ? historico.map(h => [
        h.dataOcorrencia?.split('-').reverse().join('/'),
        h.lotacaoNova,
        h.motivo || "Movimentação Interna"
      ]) : [["-", "Registro Inicial na Lotação Atual", "-"]];

      autoTable(doc, {
        startY: 90,
        head: [["Data da Movimentação", "Lotação / Setor", "Motivo"]],
        body: bodyHistorico,
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 160], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      // 4. DATA E ASSINATURA
      const dataHoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      
      doc.text(`Timon - MA, ${dataHoje}.`, 105, finalY, { align: "center" });
      
      doc.setDrawColor(100, 100, 100);
      doc.line(65, finalY + 25, 145, finalY + 25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Recursos Humanos - FASE/MA", 105, finalY + 30, { align: "center" });

      doc.save(`Declaracao_Vinculo_${pessoal.nome?.split(' ')[0]}.pdf`);
    } catch (error) {
      alert("Erro ao gerar a declaração.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <button onClick={gerarDeclaracao} disabled={gerando} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
      {gerando ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Declaração de Vínculo
    </button>
  );
}