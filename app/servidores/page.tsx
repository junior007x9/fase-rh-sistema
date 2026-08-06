// Arquivo: app/servidores/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { eq, or, sql } from "drizzle-orm";
import { Plus, UserCheck, UserX, ChevronLeft, ChevronRight, Eye, Edit, Wallet } from "lucide-react";
import Link from "next/link";
import LiveSearch from "../components/LiveSearch";

export const dynamic = "force-dynamic";

// Função para formatar o Salário Base bonitinho na tabela
function formatarMoeda(valor: number | null) {
  if (!valor) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default async function ServidoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, pagina?: string }>
}) {
  const params = await searchParams;
  const q = params?.q || "";
  const paginaAtual = Number(params?.pagina) || 1;
  const itensPorPagina = 15;
  const offset = (paginaAtual - 1) * itensPorPagina;

  // Lógica de busca blindada (ignora maiúsculas/minúsculas)
  const buscaSQL = q ? `%${q.toLowerCase()}%` : null;
  const condicoesDeBusca = buscaSQL
    ? or(
        sql`lower(${dadosPessoais.nome}) LIKE ${buscaSQL}`,
        sql`${documentos.cpf} LIKE ${buscaSQL}`,
        sql`lower(${servidores.matricula}) LIKE ${buscaSQL}`
      )
    : undefined;

  // Busca o Total de Registros para a Paginação funcionar perfeitamente
  const [totalQuery] = await db.select({ count: sql<number>`count(*)` })
    .from(servidores)
    .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
    .where(condicoesDeBusca);
  
  const totalRegistros = totalQuery.count;
  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina) || 1;

  // Busca apenas os 15 servidores da página atual (Muito leve e rápido!)
  const listaServidores = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    cargo: servidores.cargo,
    lotacao: servidores.lotacao,
    status: servidores.status,
    remuneracaoBase: servidores.remuneracaoBase, // <-- Trazendo o salário do banco
    nome: dadosPessoais.nome,
    cpf: documentos.cpf,
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
  .where(condicoesDeBusca)
  .limit(itensPorPagina)
  .offset(offset);

  // Helper para montar a URL de paginação sem perder a busca
  const getPageUrl = (novaPagina: number) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    p.set('pagina', novaPagina.toString());
    return `?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="w-full xl:w-auto text-center xl:text-left">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Cadastro de Servidores</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os <strong className="text-blue-600">{totalRegistros}</strong> servidores registrados na base de dados.
          </p>
        </div>

        <div className="flex w-full xl:w-auto flex-col sm:flex-row items-center gap-3">
          {/* BARRA DE BUSCA LIVE */}
          <div className="w-full sm:w-[400px]">
            <LiveSearch paramName="q" defaultValue={q} placeholder="Buscar por nome, matrícula ou CPF..." />
          </div>

          <Link href="/servidores/novo" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm shadow-blue-600/20">
            <Plus size={18} /> Novo Servidor
          </Link>
        </div>
      </div>

      {/* TABELA DE SERVIDORES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold min-w-[250px]">Nome / Identificação</th>
                <th className="p-4 font-bold min-w-[200px]">Cargo / Lotação</th>
                <th className="p-4 font-bold min-w-[150px]">Salário Base</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaServidores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <UserX size={48} className="mb-3 text-slate-300" />
                      <p className="text-base font-medium text-slate-600">Nenhum servidor encontrado.</p>
                      <p className="text-sm mt-1">Não achamos resultados para a busca "{q}".</p>
                    </div>
                  </td>
                </tr>
              ) : (
                listaServidores.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* NOME E MATRÍCULA */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                          {srv.nome ? srv.nome.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{srv.nome || 'Nome Não Informado'}</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Matrícula: {srv.matricula || 'N/A'} • CPF: {srv.cpf || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CARGO E LOTAÇÃO */}
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-700">{srv.cargo || 'Cargo Não Informado'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {srv.lotacao || 'Lotação Indefinida'}
                      </div>
                    </td>

                    {/* SALÁRIO BASE (FORMATADO) */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm bg-slate-50 border border-slate-100 w-fit px-2.5 py-1 rounded-lg">
                        <Wallet size={14} className="text-slate-400" />
                        {formatarMoeda(srv.remuneracaoBase)}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="p-4">
                      {srv.status === 'ATIVO' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <UserCheck size={14} /> ATIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                          <UserX size={14} /> DESLIGADO
                        </span>
                      )}
                    </td>

                    {/* AÇÕES */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/servidores/${srv.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all" title="Ver Perfil Completo">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/servidores/${srv.id}/editar`} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-lg transition-all" title="Editar Dados">
                          <Edit size={18} />
                        </Link>
                      </div>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between bg-slate-50 gap-4">
            <span className="text-sm font-medium text-slate-500">
              Mostrando página <strong className="text-slate-800">{paginaAtual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong>
            </span>
            
            <div className="flex gap-2">
              {paginaAtual > 1 ? (
                <Link href={getPageUrl(paginaAtual - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1 shadow-sm">
                  <ChevronLeft size={16} /> Anterior
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}

              {paginaAtual < totalPaginas ? (
                <Link href={getPageUrl(paginaAtual + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1 shadow-sm">
                  Próxima <ChevronRight size={16} />
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 flex items-center gap-1 cursor-not-allowed">
                  Próxima <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}