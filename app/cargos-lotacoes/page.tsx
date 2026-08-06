// Arquivo: app/cargos-lotacoes/page.tsx
import { db } from "../db/index";
import { servidores } from "../db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { Briefcase, MapPin, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CargosLotacoesPage() {
  // 1. Busca Inteligente: Agrupa e conta Servidores Ativos por Cargo
  const relatorioCargos = await db.select({
    nome: servidores.cargo,
    quantidade: sql<number>`count(*)`
  })
  .from(servidores)
  .where(eq(servidores.status, 'ATIVO'))
  .groupBy(servidores.cargo)
  .orderBy(desc(sql`count(*)`));

  // 2. Busca Inteligente: Agrupa e conta Servidores Ativos por Lotação
  const relatorioLotacoes = await db.select({
    nome: servidores.lotacao,
    quantidade: sql<number>`count(*)`
  })
  .from(servidores)
  .where(eq(servidores.status, 'ATIVO'))
  .groupBy(servidores.lotacao)
  .orderBy(desc(sql`count(*)`));

  const totalCargos = relatorioCargos.length;
  const totalLotacoes = relatorioLotacoes.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* CABEÇALHO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Cargos e Lotações</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral e distribuição do quadro de servidores ativos da FASE-MA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: CARGOS */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Cargos Distintos</p>
              <h2 className="text-3xl font-bold mt-1">{totalCargos}</h2>
            </div>
            <Briefcase size={40} className="opacity-30" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-700">Distribuição por Cargo</h3>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
              {relatorioCargos.map((cargo, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                  <span className="font-semibold text-slate-700 text-sm">
                    {cargo.nome && cargo.nome !== "null" ? cargo.nome : "Não Informado"}
                  </span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-sm">
                    <Users size={14} className="text-blue-500" />
                    <span className="font-bold text-slate-700">{cargo.quantidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: LOTAÇÕES */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Unidades / Lotações Ativas</p>
              <h2 className="text-3xl font-bold mt-1">{totalLotacoes}</h2>
            </div>
            <MapPin size={40} className="opacity-30" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-700">Distribuição por Unidade</h3>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
              {relatorioLotacoes.map((lotacao, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                  <span className="font-semibold text-slate-700 text-sm line-clamp-2 pr-4">
                    {lotacao.nome && lotacao.nome !== "null" ? lotacao.nome : "Sem Lotação Vinculada"}
                  </span>
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-sm shrink-0">
                    <Users size={14} className="text-purple-500" />
                    <span className="font-bold text-slate-700">{lotacao.quantidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}