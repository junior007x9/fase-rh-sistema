// Arquivo: app/servidores/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { eq, like, or } from "drizzle-orm";
import Link from "next/link";
import { Search, Plus, Eye } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServidoresListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; // Tipagem atualizada para Promise
}) {
  // CORREÇÃO: Aguardando a Promise do Next.js ser resolvida antes de ler o "q"
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || "";

  // Consulta ao banco de dados utilizando JOIN para unir as tabelas
  let query = db
    .select({
      id: servidores.id,
      nome: dadosPessoais.nome,
      cpf: documentos.cpf,
      vinculo: servidores.vinculo,
      dataAdmissao: servidores.dataAdmissao,
      status: servidores.status,
    })
    .from(servidores)
    .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .leftJoin(documentos, eq(servidores.id, documentos.servidorId));

  // Aplica o filtro de busca se houver algo digitado (Nome ou CPF)
  if (q) {
    query = query.where(
      or(
        like(dadosPessoais.nome, `%${q}%`),
        like(documentos.cpf, `%${q}%`)
      )
    );
  }

  const listaServidores = await query;

  // Função para processar a busca no servidor e atualizar a URL
  async function realizarBusca(formData: FormData) {
    "use server";
    const busca = formData.get("busca") as string;
    if (busca) {
      redirect(`/servidores?q=${encodeURIComponent(busca)}`);
    } else {
      redirect(`/servidores`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servidores</h1>
          <p className="text-gray-500 mt-1">Gerencie a lista de servidores e aplique filtros.</p>
        </div>
        <Link 
          href="/servidores/novo" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> Novo Servidor
        </Link>
      </header>

      {/* Barra de Filtros e Busca */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form action={realizarBusca} className="flex w-full md:w-1/2 relative">
          <input 
            type="text" 
            name="busca" 
            defaultValue={q}
            placeholder="Buscar por Nome ou CPF..." 
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
          <button type="submit" className="ml-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors">
            Filtrar
          </button>
        </form>
        
        {q && (
          <Link href="/servidores" className="text-sm text-red-600 hover:underline font-medium">
            Limpar Filtros
          </Link>
        )}
      </section>

      {/* Tabela de Dados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-sm font-semibold text-slate-600">
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">CPF</th>
                <th className="py-4 px-6">Vínculo</th>
                <th className="py-4 px-6">Admissão</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaServidores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhum servidor encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                listaServidores.map((servidor) => (
                  <tr key={servidor.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{servidor.nome || "Não informado"}</td>
                    <td className="py-4 px-6 text-gray-600">{servidor.cpf || "Não informado"}</td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                        {servidor.vinculo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{servidor.dataAdmissao}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        servidor.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {servidor.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/servidores/${servidor.id}`} 
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye size={16} /> Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}