// Arquivo: app/cargos-lotacoes/page.tsx
import { db } from "../../db/index";
import { servidores } from "../../db/schema";
import { sql, eq, asc } from "drizzle-orm";
import { Briefcase, MapPin, Users, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CargosLotacoesPage({
  searchParams,
}: {
  searchParams: any
}) {
  const params = await Promise.resolve(searchParams);
  const qCargo = params?.qCargo || "";
  const qLotacao = params?.qLotacao || "";

  // 1. Busca Inteligente: Agrupa e conta Servidores Ativos por Cargo (ORDEM ALFABÉTICA)
  const relatorioCargosBruto = await db.select({
    nome: servidores.cargo,
    quantidade: sql<number>`count(*)`
  })
  .from(servidores)
  .where(eq(servidores.status, 'ATIVO'))
  .groupBy(servidores.cargo)
  .orderBy(asc(servidores.cargo));

  // 2. Busca Inteligente: Agrupa e conta Servidores Ativos por Lotação (ORDEM ALFABÉTICA)
  const relatorioLotacoesBruto = await db.select({
    nome: servidores.lotacao,
    quantidade: sql<number>`count(*)`
  })
  .from(servidores)
  .where(eq(servidores.status, 'ATIVO'))
  .groupBy(servidores.lotacao)
  .orderBy(asc(servidores.lotacao));

  // 3. Aplica os filtros de pesquisa localmente
  const relatorioCargos = relatorioCargosBruto.filter(c => {
    if (!qCargo) return true;
    const nome = c.nome ? c.nome.toLowerCase() : "não informado";
    return nome.includes(qCargo.toLowerCase());
  });

  const relatorioLotacoes = relatorioLotacoesBruto.filter(l => {
    if (!qLotacao) return true;
    const nome = l.nome ? l.nome.toLowerCase() : "sem lotação vinculada";
    return nome.includes(qLotacao.toLowerCase());
  });

  const totalCargos = relatorioCargosBruto.length;
  const totalLotacoes = relatorioLotacoesBruto.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* CABEÇALHO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Cargos e Lotações</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral e distribuição do quadro de servidores ativos da FASE-MA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ================= COLUNA 1: CARGOS ================= */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Cargos Distintos</p>
              <h2 className="text-3xl font-bold mt-1">{totalCargos}</h2>
            </div>
            <Briefcase size={40} className="opacity-30" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
              <h3 className="font-bold text-slate-700">Distribuição por Cargo (A-Z)</h3>
              
              {/* BARRA DE PESQUISA DE CARGOS */}
              <form method="GET" action="/cargos-lotacoes" className="relative">
                {/* O input hidden preserva a busca da outra coluna! */}
                <input type="hidden" name="qLotacao" value={qLotacao} /> 
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="qCargo"
                  defaultValue={qCargo}
                  placeholder="Pesquisar cargo..."
                  className="w-full pl-9 pr-20 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                  Buscar
                </button>
              </form>
            </div>
            
            <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
              {relatorioCargos.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Nenhum cargo encontrado.</p>
              ) : (
                relatorioCargos.map((cargo, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                    <span className="font-semibold text-slate-700 text-sm uppercase">
                      {cargo.nome && cargo.nome !== "null" ? cargo.nome : "NÃO INFORMADO"}
                    </span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-sm">
                      <Users size={14} className="text-blue-500" />
                      <span className="font-bold text-slate-700">{cargo.quantidade}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ================= COLUNA 2: LOTAÇÕES ================= */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 rounded-2xl text-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Unidades / Lotações Ativas</p>
              <h2 className="text-3xl font-bold mt-1">{totalLotacoes}</h2>
            </div>
            <MapPin size={40} className="opacity-30" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
              <h3 className="font-bold text-slate-700">Distribuição por Unidade (A-Z)</h3>
              
              {/* BARRA DE PESQUISA DE LOTAÇÕES */}
              <form method="GET" action="/cargos-lotacoes" className="relative">
                {/* O input hidden preserva a busca da outra coluna! */}
                <input type="hidden" name="qCargo" value={qCargo} />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="qLotacao"
                  defaultValue={qLotacao}
                  placeholder="Pesquisar lotação..."
                  className="w-full pl-9 pr-20 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded text-xs font-bold transition-colors">
                  Buscar
                </button>
              </form>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
              {relatorioLotacoes.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Nenhuma lotação encontrada.</p>
              ) : (
                relatorioLotacoes.map((lotacao, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors">
                    <span className="font-semibold text-slate-700 text-sm line-clamp-2 pr-4 uppercase">
                      {lotacao.nome && lotacao.nome !== "null" ? lotacao.nome : "SEM LOTAÇÃO VINCULADA"}
                    </span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-sm shrink-0">
                      <Users size={14} className="text-purple-500" />
                      <span className="font-bold text-slate-700">{lotacao.quantidade}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}