// Arquivo: app/relatorios/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { eq } from "drizzle-orm";
import GeradorRelatorios from "./GeradorRelatorios";
import { FileSpreadsheet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  // Buscamos TUDO de uma vez para que o Client Component possa filtrar na velocidade da luz
  const baseDados = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    nome: dadosPessoais.nome,
    cpf: documentos.cpf,
    dataNascimento: dadosPessoais.dataNascimento,
    telefone: dadosPessoais.telefone,
    email: dadosPessoais.email,
    cargo: servidores.cargo,
    lotacao: servidores.lotacao,
    vinculo: servidores.vinculo,
    status: servidores.status,
    dataAdmissao: servidores.dataAdmissao
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .leftJoin(documentos, eq(servidores.id, documentos.servidorId));

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500">
      
      <header className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-inner">
            <FileSpreadsheet size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Relatórios Gerenciais</h1>
            <p className="text-slate-500 mt-1 text-sm">Gere e exporte planilhas personalizadas baseadas no banco de dados.</p>
          </div>
        </div>
      </header>

      {/* Chamamos o componente cliente passando toda a base de dados */}
      <GeradorRelatorios baseDados={baseDados} />
      
    </div>
  );
}