// Arquivo: app/cargos-lotacoes/page.tsx
import { db } from "../../db/index";
import { cargos, lotacoes } from "../../db/schema";
import { salvarCargo, salvarLotacao } from "../actions/cargos-lotacoes"; // <-- Importação corrigida aqui (../)
import { Briefcase, Building, Plus } from "lucide-react";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CargosLotacoesPage() {
  // Buscando os dados cadastrados ordenados pelos mais recentes
  const listaCargos = await db.select().from(cargos).orderBy(desc(cargos.criadoEm));
  const listaLotacoes = await db.select().from(lotacoes).orderBy(desc(lotacoes.criadoEm));

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cargos e Lotações</h1>
        <p className="text-gray-500 mt-1">Gerencie a estrutura organizacional da FASE-MA.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. MÓDULO DE CARGOS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Cargos da Instituição</h2>
          </div>

          {/* Formulário de Novo Cargo */}
          <form action={salvarCargo} className="flex gap-2 mb-6">
            <input 
              type="text" 
              name="nome" 
              placeholder="Nome do Cargo (ex: SOCIOEDUCADOR)" 
              required 
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Adicionar
            </button>
          </form>

          {/* Lista de Cargos */}
          <div className="flex-1 overflow-y-auto max-h-96 border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600">Nome do Cargo</th>
                </tr>
              </thead>
              <tbody>
                {listaCargos.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 text-center text-gray-500">Nenhum cargo cadastrado.</td>
                  </tr>
                ) : (
                  listaCargos.map((cargo) => (
                    <tr key={cargo.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-gray-800 font-medium">{cargo.nome}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>


        {/* 2. MÓDULO DE LOTAÇÕES */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Building className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Unidades e Lotações</h2>
          </div>

          {/* Formulário de Nova Lotação */}
          <form action={salvarLotacao} className="flex gap-2 mb-6">
            <input 
              type="text" 
              name="nome" 
              placeholder="Nome (ex: SEDE SÃO LUÍS)" 
              required 
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="text" 
              name="sigla" 
              placeholder="Sigla (ex: SEDE)" 
              required 
              className="w-24 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Adicionar
            </button>
          </form>

          {/* Lista de Lotações */}
          <div className="flex-1 overflow-y-auto max-h-96 border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600">Sigla</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Nome da Lotação</th>
                </tr>
              </thead>
              <tbody>
                {listaLotacoes.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 px-4 text-center text-gray-500">Nenhuma lotação cadastrada.</td>
                  </tr>
                ) : (
                  listaLotacoes.map((lotacao) => (
                    <tr key={lotacao.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-gray-600 font-bold">{lotacao.sigla}</td>
                      <td className="py-3 px-4 text-gray-800">{lotacao.nome}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}