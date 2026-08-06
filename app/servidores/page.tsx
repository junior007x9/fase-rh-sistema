// Arquivo: app/servidores/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { eq, or, sql } from "drizzle-orm";
import { Plus, UserCheck, UserX, ChevronLeft, ChevronRight, Eye, Edit } from "lucide-react";
import Link from "next/link";
import LiveSearch from "../components/LiveSearch"; // Importando a mágica aqui

export const dynamic = "force-dynamic";

export default async function ServidoresPage({
  searchParams,
}: {
  searchParams: any
}) {
  const params = await Promise.resolve(searchParams);
  const q = params?.q || "";
  const paginaAtual = Number(params?.pagina) || 1;
  const itensPorPagina = 15;
  const offset = (paginaAtual - 1) * itensPorPagina;

  const buscaSQL = q ? `%${q.toLowerCase()}%` : null;
  const condicoesDeBusca = buscaSQL
    ? or(
        sql`lower(${dadosPessoais.nome}) LIKE ${buscaSQL}`,
        sql`${documentos.cpf} LIKE ${buscaSQL}`,
        sql`lower(${servidores.matricula}) LIKE ${buscaSQL}`
      )
    : undefined;

  const [totalQuery] = await db.select({ count: sql<number>`count(*)` })
    .from(servidores)
    .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
    .where(condicoesDeBusca);
  
  const totalRegistros = totalQuery.count;
  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina) || 1;

  const listaServidores = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    nome: dadosPessoais.nome,
    cpf: documentos.cpf,
    cargo: servidores.cargo,
    lotacao: servidores.lotacao,
    status: servidores.status,
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
  .where(condicoesDeBusca)
  .limit(itensPorPagina)
  .offset(offset);

  const getPageUrl = (novaPagina: number) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    p.set('pagina', novaPagina.toString());
    return `?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="w-full lg:w-auto text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-800">Servidores</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os {totalRegistros} servidores cadastrados na base.</p>
        </div>

        <div className="flex w-full lg:w-auto flex-col sm:flex-row items-center gap-3">
          
          {/* SUBSTITUÍMOS O FORMULÁRIO ANTIGO PELO NOSSO NOVO COMPONENTE */}
          <div className="w-full sm:w-[400px]">
            <LiveSearch paramName="q" defaultValue={q} placeholder="Buscar por nome, matrícula ou CPF..." />
          </div>

          <Link href="/servidores/novo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm">
            <Plus size={18} /> Novo
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold min-w-[250px]">Nome / Matrícula</th>
                <th className="p-4 font-semibold min-w-[200px]">Cargo / Lotação</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaServidores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Nenhum servidor encontrado para a busca "{q}".
                  </td>
                </tr>
              ) : (
                listaServidores.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{srv.nome}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Matrícula: {srv.matricula || 'N/A'} • CPF: {srv.cpf}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700">{srv.cargo || 'Não Informado'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{srv.lotacao || 'Não Informada'}</div>
                    </td>
                    <td className="p-4">
                      {srv.status === 'ATIVO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <UserCheck size={14} /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <UserX size={14} /> Desligado
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <Link href={`/servidores/${srv.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} />
                      </Link>
                      <Link href={`/servidores/${srv.id}/editar`} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Página <strong className="text-slate-800">{paginaAtual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong>
            </span>
            <div className="flex gap-2">
              {paginaAtual > 1 && (
                <Link href={getPageUrl(paginaAtual - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-1">
                  <ChevronLeft size={16} /> Anterior
                </Link>
              )}
              {paginaAtual < totalPaginas && (
                <Link href={getPageUrl(paginaAtual + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-1">
                  Próxima <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}