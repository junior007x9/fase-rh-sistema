// Arquivo: app/relatorios/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais } from "../../db/schema";
import ExportadorRelatorios from "../components/ExportadorRelatorios";
import { BarChart3 } from "lucide-react";

export default async function RelatoriosPage() {
  // 1. Busca os dados do banco
  const listaServidores = await db.select().from(servidores);
  const listaDadosPessoais = await db.select().from(dadosPessoais);

  // 2. Mescla os dados das duas tabelas de forma segura
  const dadosCompletos = listaServidores.map((servidor) => {
    const dados = listaDadosPessoais.find((d) => d.servidorId === servidor.id);
    return {
      id: servidor.id,
      nome: dados?.nome || "Nome não cadastrado",
      cpf: dados?.cpf || "---",
      vinculo: servidor.vinculo,
      status: servidor.status,
      dataAdmissao: servidor.dataAdmissao,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Central de Relatórios</h1>
        </div>
        <p className="text-blue-100 mt-2 text-lg max-w-2xl">
          Exporte os dados dos servidores da Fundação de Atendimento Socioeducativo de forma profissional, segura e formatada com as cores do Estado do Maranhão.
        </p>
      </div>

      {/* COMPONENTE CLIENTE COM OS BOTÕES DE EXPORTAÇÃO */}
      <ExportadorRelatorios dados={dadosCompletos} />

    </div>
  );
}