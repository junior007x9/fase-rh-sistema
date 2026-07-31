// Arquivo: app/components/BotaoImprimirFicha.tsx
"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Printer, Loader2, Image as ImageIcon } from "lucide-react";

type Props = {
  servidor: any;
  pessoal: any;
  ferias: any[];
};

export default function BotaoImprimirFicha({ servidor, pessoal, ferias }: Props) {
  const [gerando, setGerando] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  // Lê a foto selecionada no computador e converte para texto (Base64) para o PDF
  const lerArquivoComoBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGerarComFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fotoBase64 = await lerArquivoComoBase64(file);
        await gerarFichaPDF(fotoBase64);
      } catch (error) {
        console.error("Erro ao ler foto", error);
        alert("Ocorreu um erro ao ler a imagem. Tente outra foto.");
      }
    }
    // Limpa o input para poder selecionar a mesma foto novamente, se necessário
    if (inputFotoRef.current) inputFotoRef.current.value = "";
  };

  const gerarFichaPDF = async (fotoServidorBase64: string | null = null) => {
    setGerando(true);
    
    try {
      const doc = new jsPDF();
      
      // ==========================================
      // 1. CABEÇALHO E LOGOMARCA OFICIAL (CORRIGIDO PARA JPG)
      // ==========================================
      try {
        const img = new Image();
        img.src = "/logo.jpg"; // Lendo a sua logo.jpg da pasta public
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        doc.addImage(img, "JPEG", 14, 10, 35, 18); // Imprime a logo
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 160);
        doc.text("FASE/MA - RECURSOS HUMANOS", 55, 18);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", 55, 23);
      } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 160);
        doc.text("FASE/MA - RECURSOS HUMANOS", 14, 18);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("FUNDAÇÃO DE ATENDIMENTO SOCIOEDUCATIVO DO MARANHÃO", 14, 23);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("FICHA DE REGISTRO DE EMPREGADO", 14, 40);

      // ==========================================
      // 2. FOTO 3x4 DO SERVIDOR
      // ==========================================
      if (fotoServidorBase64) {
        // Se escolheu foto, imprime a imagem no local exato
        doc.addImage(fotoServidorBase64, 165, 12, 30, 40);
        doc.setDrawColor(150, 150, 150);
        doc.rect(165, 12, 30, 40); // Borda em volta da foto
      } else {
        // Se não escolheu, imprime o quadro vazio
        doc.setDrawColor(150, 150, 150);
        doc.setFillColor(245, 245, 245);
        doc.rect(165, 12, 30, 40, 'FD');
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("FOTO 3x4", 172, 33);
      }

      let currentY = 55;
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
    <div className="flex gap-2">
      {/* INPUT INVISÍVEL PARA SELECIONAR A FOTO DO COMPUTADOR */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={inputFotoRef} 
        onChange={handleGerarComFoto} 
      />

      <button 
        onClick={() => gerarFichaPDF(null)}
        disabled={gerando}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        title="Imprimir com o quadro de foto em branco"
      >
        {gerando ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
        Imprimir Ficha
      </button>

      <button 
        onClick={() => inputFotoRef.current?.click()}
        disabled={gerando}
        className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
        title="Selecionar foto do servidor no seu computador e imprimir"
      >
        <ImageIcon size={18} />
        Com Foto
      </button>
    </div>
  );
}