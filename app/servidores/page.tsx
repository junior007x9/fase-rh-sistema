// Arquivo: app/servidores/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos, historicoFuncional, cargos, lotacoes } from "../../db/schema";
import { eq, or, like, and, isNull } from "drizzle-orm";
import { Search, Pencil } from "lucide-react";
import Link from "next/link";
import BotaoExcluir from "../components/BotaoExcluir";
import { excluirServidor } from "../actions/servidores";

export const dynamic = "force-dynamic";

export default async function ServidoresPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || "";

  // 1. SOLUÇÃO DO ERRO DO TYPESCRIPT: 
  // Criamos a condição fora da query. Se não houver texto, ela fica 'undefined'.
  const condicaoBusca = q
    ? or(
        like(dadosPessoais.nome, `%${q}%`),
        like(documentos.cpf, `%${q}%`),
        like(documentos.rg, `%${q}%`)
      )
    : undefined;

  // 2. Consulta tipada com segurança, agrupando todas as tabelas (Cargo, Lotação, Admissão)
  const listaServidores = await db
    .select({
      id: servidores.id,
      nome: dadosPessoais.nome,
      cpf: documentos.cpf,
      rg: documentos.rg,
      dataAdmissao: servidores.dataAdmissao,
      dataDesligamento: servidores.dataDesligamento,
      cargo: cargos.nome,
      lotacao: lotacoes.nome,
      status: servidores.status,
    })
    .from(servidores)
    .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
    // Pega apenas a alocação atual (onde dataFim é nulo)
    .leftJoin(
      historicoFuncional,
      and(eq(servidores.id, historicoFuncional.servidorId), isNull(historicoFuncional.dataFim))
    )
    .leftJoin(cargos, eq(historicoFuncional.cargoId, cargos.id))
    .leftJoin(lotacoes, eq(historicoFuncional.lotacaoId, lotacoes.id))
    .where(condicaoBusca); // O Drizzle resolve o undefined automaticamente!

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servidores</h1>
          <p className="text-gray-500 mt-1">Gestão e filtro de informações pessoais e institucionais.</p>
        </div>
        <Link
          href="/servidores/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Novo Servidor
        </Link>
      </header>

      {/* SESSÃO DE BUSCA E FILTROS */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <form className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por Nome, CPF ou RG..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Filtrar
          </button>
          <Link href="/servidores" className="w-full sm:w-auto text-center text-gray-500 hover:text-gray-700 px-4 py-2 font-medium">
            Limpar
          </Link>
        </form>
      </section>

      {/* LISTAGEM DOS SERVIDORES */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-600">Servidor (CPF/RG)</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Cargo / Lotação</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Admissão</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaServidores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhum servidor encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                listaServidores.map((servidor) => (
                  <tr key={servidor.id} className="border-b border-gray-100 hover:bg-slate-50 group transition-colors">
                    
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{servidor.nome || "Sem nome"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">CPF: {servidor.cpf} | RG: {servidor.rg}</p>
                    </td>
                    
                    <td className="py-3 px-4">
                      <p className="text-gray-800 font-medium">{servidor.cargo || "Não alocado"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{servidor.lotacao || "Sem lotação"}</p>
                    </td>
                    
                    <td className="py-3 px-4 text-xs text-gray-600">
                      <p>Entrada: {servidor.dataAdmissao}</p>
                      {servidor.dataDesligamento && (
                        <p className="text-red-500 mt-1 font-medium">Desligado: {servidor.dataDesligamento}</p>
                      )}
                    </td>
                    
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${
                        servidor.status === 'ATIVO' ? 'bg-green-100 text-green-800 border-green-200' :
                        servidor.status === 'AFASTADO' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {servidor.status}
                      </span>
                    </td>

                    {/* COLUNA DE AÇÕES COM LÁPIS E LIXEIRA */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {/* Lápis de Edição (Abre o perfil completo do servidor) */}
                        <Link 
                          href={`/servidores/${servidor.id}`}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors shadow-sm"
                          title="Ver / Editar Ficha do Servidor"
                        >
                          <Pencil size={16} />
                        </Link>

                        {/* Lixeira de Exclusão Segura */}
                        <BotaoExcluir 
                          id={servidor.id} 
                          nomeRegistro={servidor.nome || "Servidor Desconhecido"} 
                          acaoExcluir={excluirServidor as any} 
                        />
                      </div>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}