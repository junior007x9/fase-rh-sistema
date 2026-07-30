// Arquivo: app/servidores/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, documentos } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Users, Search, ChevronRight, BadgeCheck, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServidoresPage() {
  // Busca todos os servidores cruzando os dados pessoais e documentos
  const listaServidores = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    vinculo: servidores.vinculo,
    status: servidores.status,
    nome: dadosPessoais.nome,
    cpf: documentos.cpf
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .leftJoin(documentos, eq(servidores.id, documentos.servidorId))
  .orderBy(desc(servidores.criadoEm));

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" /> Servidores
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os colaboradores da instituição.</p>
        </div>
        <Link 
          href="/servidores/novo" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> Novo Servidor
        </Link>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-500">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, matrícula ou CPF..." 
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-4">Matrícula</th>
                <th className="p-4">Nome do Servidor</th>
                <th className="p-4">CPF</th>
                <th className="p-4">Vínculo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaServidores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum servidor cadastrado ainda.
                  </td>
                </tr>
              ) : (
                listaServidores.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-600 font-medium">
                      {srv.matricula || <span className="text-gray-400 text-xs italic">Não gerada</span>}
                    </td>
                    <td className="p-4 font-bold text-gray-900">{srv.nome}</td>
                    <td className="p-4 text-gray-600">{srv.cpf}</td>
                    <td className="p-4 text-gray-600">{srv.vinculo}</td>
                    <td className="p-4">
                      {srv.status === "ATIVO" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <BadgeCheck size={14} /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          <AlertCircle size={14} /> Desligado
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/servidores/${srv.id}`}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold"
                      >
                        Abrir Perfil <ChevronRight size={16} />
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