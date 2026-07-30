// Arquivo: app/relatorios/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { eq } from "drizzle-orm";
import GeradorRelatorios from "./GeradorRelatorios";

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
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios Gerenciais</h1>
        <p className="text-gray-500 mt-1">Gere planilhas personalizadas baseadas nos dados dos servidores.</p>
      </header>

      {/* Chamamos o componente cliente passando toda a base de dados */}
      <GeradorRelatorios baseDados={baseDados} />
    </div>
  );
}