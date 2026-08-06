// Arquivo: app/servidores/page.tsx
import { db } from "../db/index";
import { servidores, dadosPessoais, documentos } from "../db/schema";
import { eq, or, sql } from "drizzle-orm";
import { Search, Plus, UserCheck, UserX, ChevronLeft, ChevronRight, Eye, Edit } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ServidoresPage({
  searchParams,
}: {
  searchParams: { q?: string; pagina?: string }
}) {
  // 1. Controle de Busca e Paginação
  const q = searchParams?.q || "";
  const paginaAtual = Number(searchParams?.pagina) || 1;
  const itensPorPagina = 15;
  const offset = (paginaAtual - 1) * itensPorPagina;

  // 2. Montar Filtros de Pesquisa
  const buscaSQL = q ? `%${q.toLowerCase()}%` : null;
  const condicoesDeBusca = buscaSQL
    ? or(
        sql`lower(${dadosPessoais.nome}) LIKE ${buscaSQL}`,
        sql`${documentos.cpf} LIKE ${buscaSQL}`,
        sql`lower(${servidores.matricula}) LIKE ${buscaSQL}`
      )
    : undefined;

  // 3. Contar total de resultados (para a paginação saber até onde ir)
  const [totalQuery] = await db.select({ count: sql<number>`count(*)` })
    .from(servidores)
    .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
    .where(condicoesDeBusca);
  
  const totalRegistros = totalQuery.count;
  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina) || 1;

  // 4. Buscar apenas os 15 da página atual
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

  // 5. Função para manter a pesquisa ao trocar de página
  const getPageUrl = (novaPagina: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('pagina', novaPagina.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* CABEÇALHO E BARRA DE PESQUISA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Servidores</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os {totalRegistros} servidores cadastrados na base.</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          {/* O FORMULÁRIO "GET" ACIONA A BUSCA AUTOMATICAMENTE PELO NEXT.JS */}
          <form method="GET" className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, matrícula ou CPF..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            <button type="submit" className="hidden">Buscar</button>
          </form>

          <Link href="/servidores/novo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm">
            <Plus size={18} /> Novo
          </Link>
        </div>
      </div>

      {/* TABELA DE SERVIDORES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Nome / Matrícula</th>
                <th className="p-4 font-semibold">Cargo / Lotação</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaServidores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Nenhum servidor encontrado para esta busca.
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

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Mostrando página <strong className="text-slate-800">{paginaAtual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong>
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