// Arquivo: app/components/BotaoImprimirFicha.tsx
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Printer, Loader2 } from "lucide-react";

type Props = {
  servidor: any;
  pessoal: any;
  ferias: any[];
};

export default function BotaoImprimirFicha({ servidor, pessoal, ferias }: Props) {
  const [gerando, setGerando] = useState(false);

  const gerarFichaPDF = async () => {
    setGerando(true);
    
    try {
      const doc = new jsPDF();
      
      // ==========================================
      // 1. CABEÇALHO E LOGOMARCA OFICIAL
      // ==========================================
      try {
        const img = new Image();
        img.src = "/logo.png"; // Caminho da logo oficial na pasta public
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Inserir Logo: X, Y, Largura, Altura
        doc.addImage(img, "PNG", 14, 10, 35, 18);
        
        // Textos deslocados para a direita para dar espaço à logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 160); // Azul Escuro Institucional
        doc.text("FASE/MA - RECURSOS HUMANOS", 55, 18);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", 55, 23);
      } catch (e) {
        // Fallback: Se a logo não for encontrada na pasta public, imprime sem ela
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 160);
        doc.text("FASE/MA - RECURSOS HUMANOS", 14, 18);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", 14, 23);
      }

      // Título do Documento
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("FICHA DE REGISTRO DE EMPREGADO", 14, 40);

      // ==========================================
      // 2. QUADRO DA FOTO 3x4
      // ==========================================
      doc.setDrawColor(150, 150, 150);
      doc.setFillColor(245, 245, 245);
      doc.rect(165, 12, 30, 40, 'FD'); // X, Y, Largura, Altura
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("FOTO 3x4", 172, 33);

      let currentY = 55;

      // ==========================================
      // COR PADRÃO UNIFICADA DOS RELATÓRIOS (Azul Escuro Oficial)
      // ==========================================
      const corCabecalhoTabela: [number, number, number] = [0, 51, 160];

      // ==========================================
      // 3. DADOS DE IDENTIFICAÇÃO (PESSOAIS)
      // ==========================================
      autoTable(doc, {
        startY: currentY,
        head: [["DADOS DE IDENTIFICAÇÃO"]],
        body: [
          [`Nome: ${pessoal.nome || "Não informado"}`],
          [`CPF: ${pessoal.cpf || "Não informado"}   |   RG: ${pessoal.rg || "Não informado"}`],
          [`Data de Nascimento: ${pessoal.dataNascimento ? pessoal.dataNascimento.split('-').reverse().join('/') : "Não informada"}`],
          [`Endereço: ${pessoal.endereco || "Não informado"}`],
          [`Telefone: ${pessoal.telefone || "Não informado"}   |   Email: ${pessoal.email || "Não informado"}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: corCabecalhoTabela, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50] }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // ==========================================
      // 4. DADOS CONTRATUAIS E REMUNERAÇÃO
      // ==========================================
      const remuneracaoFormatada = servidor.remuneracaoBase 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servidor.remuneracaoBase) 
        : "Não informada";

      autoTable(doc, {
        startY: currentY,
        head: [["HISTÓRICO CONTRATUAL E LOTAÇÃO"]],
        body: [
          [`Matrícula: ${servidor.matricula || "S/N"}`],
          [`Data de Admissão: ${servidor.dataAdmissao ? servidor.dataAdmissao.split('-').reverse().join('/') : "Não informada"}`],
          [`Cargo: ${servidor.cargo || "Não informado"}   |   Função: ${servidor.funcao || "-"}`],
          [`Lotação Atual: ${servidor.lotacao || "Não informada"}`],
          [`Remuneração Base Atual: ${remuneracaoFormatada}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: corCabecalhoTabela, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50] }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // ==========================================
      // 5. HISTÓRICO DE FÉRIAS
      // ==========================================
      const feriasBody = ferias.length > 0 
        ? ferias.map(f => [
            `${f.dataInicio.split('-').reverse().join('/')} a ${f.dataFim.split('-').reverse().join('/')}`,
            f.status,
            `${f.diasRestantes} dias`
          ])
        : [["Nenhum período de férias registrado.", "-", "-"]];

      autoTable(doc, {
        startY: currentY,
        head: [["Período Aquisitivo", "Status", "Dias Pendentes"]],
        body: feriasBody,
        theme: 'grid',
        headStyles: { fillColor: corCabecalhoTabela, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50], halign: 'center' }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // ==========================================
      // 6. DADOS DE DESLIGAMENTO (CONDICIONAL)
      // ==========================================
      if (servidor.status === 'DESLIGADO') {
        autoTable(doc, {
          startY: currentY,
          head: [["DADOS DE DESLIGAMENTO / RESCISÃO"]],
          body: [
            [`Data de Desligamento: ${servidor.dataDesligamento ? servidor.dataDesligamento.split('-').reverse().join('/') : "Não informada"}`],
            [`Motivo do Desligamento: ${servidor.motivoDesligamento || "Não informado"}`]
          ],
          theme: 'grid',
          // O Desligamento eu mantenho em um tom de vermelho/cinza escuro ou sigo o padrão? 
          // Vamos manter a padronização oficial.
          headStyles: { fillColor: corCabecalhoTabela, textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50] }
        });
      }

      // ==========================================
      // ASSINATURAS NO RODAPÉ
      // ==========================================
      const finalY = (doc as any).lastAutoTable.finalY + 40;
      if (finalY < 280) {
        doc.setDrawColor(150, 150, 150);
        doc.line(20, finalY, 80, finalY);
        doc.line(130, finalY, 190, finalY);
        
        doc.setFontSize(9);
        doc.text("Assinatura do Empregado", 50, finalY + 5, { align: "center" });
        doc.text("Recursos Humanos - FASE/MA", 160, finalY + 5, { align: "center" });
      }

      // GERAR E BAIXAR
      const nomeArquivo = `Ficha_Servidor_${pessoal.nome?.split(' ')[0] || "Registro"}.pdf`;
      doc.save(nomeArquivo);
      
    } catch (error) {
      console.error("Erro ao gerar PDF da ficha:", error);
      alert("Ocorreu um erro ao gerar a ficha. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <button 
      onClick={gerarFichaPDF}
      disabled={gerando}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
    >
      {gerando ? (
        <><Loader2 size={18} className="animate-spin" /> Gerando Ficha...</>
      ) : (
        <><Printer size={18} /> Imprimir Ficha 3x4</>
      )}
    </button>
  );
}