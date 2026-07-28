// Arquivo: app/page.tsx
import { db } from "../db/index";
import { servidores, candidatos } from "../db/schema";
import { sql } from "drizzle-orm";
import { Users, UserCheck, UserX, BookOpen } from "lucide-react";
import Link from "next/link"; // Adicionada a importação do Link

// Força a página a sempre buscar dados novos ao invés de usar cache estático
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Buscando o quantitativo de servidores (Requisito do PDF)
  const totalServidoresResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(servidores);
  
  const servidoresAtivosResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(servidores)
    .where(sql`${servidores.status} = 'ATIVO'`);

  // 2. Buscando o quantitativo do Recrutamento (Cadastro de reserva)
  const candidatosReservaResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(candidatos)
    .where(sql`${candidatos.status} = 'RESERVA'`);

  // Extraindo os números
  const totalServidores = totalServidoresResult[0]?.count || 0;
  const servidoresAtivos = servidoresAtivosResult[0]?.count || 0;
  const candidatosReserva = candidatosReservaResult[0]?.count || 0;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Interativo</h1>
        <p className="text-gray-500 mt-2">Visão geral dos recursos humanos da FASE-MA.</p>
      </header>

      {/* Grid de Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card: Servidores Ativos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600">
            <UserCheck size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Servidores Ativos</p>
            <h3 className="text-2xl font-bold text-gray-900">{servidoresAtivos}</h3>
          </div>
        </div>

        {/* Card: Total de Servidores (Histórico) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-slate-100 p-4 rounded-lg text-slate-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Registrado</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalServidores}</h3>
          </div>
        </div>

        {/* Card: Cadastro de Reserva */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-lg text-green-600">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cadastro de Reserva</p>
            <h3 className="text-2xl font-bold text-gray-900">{candidatosReserva}</h3>
          </div>
        </div>

        {/* Card: Afastamentos (Placeholder para módulo futuro) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-lg text-amber-600">
            <UserX size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Afastamentos/Férias</p>
            <h3 className="text-2xl font-bold text-gray-900">0</h3>
          </div>
        </div>

      </div>

      {/* Área de Acesso Rápido */}
      <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
        <div className="flex gap-4">
          {/* Botão transformado em Link e importado no topo */}
          <Link 
            href="/servidores/novo" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm inline-block"
          >
            + Novo Servidor
          </Link>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Gerar Relatório
          </button>
        </div>
      </section>
    </div>
  );
}