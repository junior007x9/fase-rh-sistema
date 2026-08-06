// Arquivo: app/page.tsx
import { db } from "../db/index";
import { servidores, dadosPessoais, lotacoes, eventosAusencia, periodosAquisitivos } from "../db/schema";
import { eq, sql, count } from "drizzle-orm";
import { Users, UserMinus, UserX, MapPin, Briefcase, Gift, Calendar, BarChart3, PieChart, CalendarClock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Buscando métricas expandidas para os 6 cards
  const totalServidoresQuery = await db.select({ count: sql<number>`count(*)` }).from(servidores).where(eq(servidores.status, "ATIVO"));
  const totalDesligadosQuery = await db.select({ count: sql<number>`count(*)` }).from(servidores).where(eq(servidores.status, "DESLIGADO"));
  const totalLotacoesQuery = await db.select({ count: sql<number>`count(*)` }).from(lotacoes);
  const totalFeriasPendentesQuery = await db.select({ count: count() }).from(periodosAquisitivos).where(eq(periodosAquisitivos.status, 'PENDENTE'));

  const totalAtivos = totalServidoresQuery[0]?.count || 0;
  const totalDesligados = totalDesligadosQuery[0]?.count || 0;
  const totalLotacoes = totalLotacoesQuery[0]?.count || 0;
  const totalFeriasPendentes = totalFeriasPendentesQuery[0]?.count || 0;

  // Busca dados para o Gráfico de Vínculos (Dinâmico)
  const vinculosData = await db.select({
    vinculo: servidores.vinculo,
    total: sql<number>`count(*)`
  })
  .from(servidores)
  .where(eq(servidores.status, "ATIVO"))
  .groupBy(servidores.vinculo);

  // 🚀 BUSCANDO DADOS REAIS DE AUSÊNCIAS E LICENÇAS
  const listaAusencias = await db.select().from(eventosAusencia);
  const totalAfastados = listaAusencias.length;

  // Lógica do Gráfico de Ausências (Últimos 6 meses)
  const nomesMesesCurto = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const ultimos6Meses = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: nomesMesesCurto[d.getMonth()],
      mes: d.getMonth() + 1,
      ano: d.getFullYear(),
      val: 0
    };
  });

  // Agrupando as ausências por mês no gráfico
  listaAusencias.forEach(aus => {
    const dataRef = (aus as any).dataInicio || (aus as any).criadoEm;
    if (dataRef) {
      const parts = dataRef.toString().split('T')[0].split('-');
      if (parts.length >= 2) {
        const [ano, mes] = parts;
        const mesIndex = ultimos6Meses.findIndex(m => m.mes === parseInt(mes) && m.ano === parseInt(ano));
        if (mesIndex !== -1) {
          ultimos6Meses[mesIndex].val++;
        }
      }
    } else {
      ultimos6Meses[5].val++;
    }
  });

  const maxAusencias = Math.max(...ultimos6Meses.map(m => m.val), 5); 

  // Buscando todos os servidores ativos para os Aniversariantes
  const listaServidores = await db.select({
    id: servidores.id,
    nome: dadosPessoais.nome,
    dataNascimento: dadosPessoais.dataNascimento,
    cargo: servidores.cargo,
    lotacao: servidores.lotacao
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .where(eq(servidores.status, "ATIVO"));

  // Lógica para Aniversariantes do Mês
  const mesAtual = new Date().getMonth() + 1; // 1 a 12
  const nomeMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const nomeMesAtual = nomeMeses[mesAtual - 1];

  const aniversariantesDoMes = listaServidores.filter(srv => {
    if (!srv.dataNascimento) return false;
    const parts = srv.dataNascimento.split('-');
    if (parts.length >= 2) {
      const [ano, mes, dia] = parts;
      return parseInt(mes) === mesAtual;
    }
    return false;
  }).sort((a, b) => {
    const diaA = parseInt(a.dataNascimento!.split('-')[2] || '0');
    const diaB = parseInt(b.dataNascimento!.split('-')[2] || '0');
    return diaA - diaB;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Interativo</h1>
        <p className="text-gray-500 text-sm mt-1">Visão estratégica dos recursos humanos da FASE-MA.</p>
      </header>

      {/* CARDS SUPERIORES (6 INDICADORES CHAVE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Ativos */}
        <div className="bg-blue-600 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-[10px] font-semibold uppercase tracking-wider">Ativos</p>
            <h2 className="text-2xl font-extrabold mt-1">{totalAtivos}</h2>
          </div>
          <Users size={32} className="absolute right-2 bottom-2 text-blue-500 opacity-40" />
        </div>

        {/* Afastamentos */}
        <div className="bg-orange-500 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-orange-100 text-[10px] font-semibold uppercase tracking-wider">Atestados</p>
            <h2 className="text-2xl font-extrabold mt-1">{totalAfastados}</h2>
          </div>
          <UserMinus size={32} className="absolute right-2 bottom-2 text-orange-400 opacity-40" />
        </div>

        {/* Desligados / Rescisões */}
        <div className="bg-red-600 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-red-100 text-[10px] font-semibold uppercase tracking-wider">Desligados</p>
            <h2 className="text-2xl font-extrabold mt-1">{totalDesligados}</h2>
          </div>
          <UserX size={32} className="absolute right-2 bottom-2 text-red-500 opacity-40" />
        </div>

        {/* Lotações */}
        <div className="bg-purple-600 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-purple-100 text-[10px] font-semibold uppercase tracking-wider">Lotações</p>
            <h2 className="text-2xl font-extrabold mt-1">{totalLotacoes}</h2>
          </div>
          <MapPin size={32} className="absolute right-2 bottom-2 text-purple-500 opacity-40" />
        </div>

        {/* Férias Pendentes */}
        <div className="bg-teal-600 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-teal-100 text-[10px] font-semibold uppercase tracking-wider">Férias Pend.</p>
            <h2 className="text-2xl font-extrabold mt-1">{totalFeriasPendentes}</h2>
          </div>
          <CalendarClock size={32} className="absolute right-2 bottom-2 text-teal-500 opacity-40" />
        </div>

        {/* Cadastro de Reserva */}
        <div className="bg-emerald-600 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-emerald-100 text-[10px] font-semibold uppercase tracking-wider">Banco Reserva</p>
            <h2 className="text-2xl font-extrabold mt-1">0</h2>
          </div>
          <Briefcase size={32} className="absolute right-2 bottom-2 text-emerald-400 opacity-40" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SESSÃO DE GRÁFICOS (Ocupa 2 colunas) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* GRÁFICO 1: Distribuição por Vínculo (COM SCROLL INTERNO COMPACTO) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="text-blue-600" size={18} />
              <h3 className="text-base font-bold text-gray-800">Distribuição por Vínculo</h3>
            </div>
            
            {/* Altura fixa com rolagem interna para não esticar a tela */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {vinculosData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-12">Nenhum dado disponível.</p>
              ) : (
                vinculosData.map((v) => {
                  const percent = totalAtivos > 0 ? Math.round((v.total / totalAtivos) * 100) : 0;
                  return (
                    <div key={v.vinculo}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700 uppercase">{v.vinculo || "NÃO INFORMADO"}</span>
                        <span className="text-gray-500 font-medium">{v.total} serv. ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GRÁFICO 2: Ausências e Licenças */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-orange-500" size={18} />
              <h3 className="text-base font-bold text-gray-800">Cenário de Ausências</h3>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 h-40 mt-4 border-b border-gray-100 pb-2 relative">
              {ultimos6Meses.map((item, i) => {
                const alturaBarra = Math.round((item.val / maxAusencias) * 100);
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div 
                      className="w-full max-w-[2rem] bg-orange-100 group-hover:bg-orange-500 rounded-t-md transition-colors relative flex items-end justify-center" 
                      style={{ height: `${alturaBarra}%`, minHeight: '4px' }}
                    >
                      <span className="absolute -top-7 text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.val}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-gray-400 mt-2">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* CARD DE ANIVERSARIANTES DO MÊS (COM SCROLL INTERNO COMPACTO) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[380px]">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3.5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <Gift size={18} />
              <h2 className="font-bold text-base">Aniversariantes</h2>
            </div>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              {nomeMesAtual}
            </span>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto">
            {aniversariantesDoMes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-8">
                <Calendar size={28} className="opacity-20" />
                <p className="text-xs">Nenhum aniversário este mês.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {aniversariantesDoMes.map(srv => {
                  const parts = srv.dataNascimento?.split('-');
                  const dia = parts && parts.length === 3 ? parts[2] : '--';
                  return (
                    <li key={srv.id} className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 transition-colors">
                      <div className="bg-white text-pink-600 font-bold text-sm h-8 w-8 min-w-[32px] rounded-full flex items-center justify-center shadow-sm border border-pink-100">
                        {dia}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-gray-800 truncate">{srv.nome}</p>
                        <p className="text-[11px] text-gray-500 truncate">{srv.cargo || 'Servidor'} • {srv.lotacao}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          
          <div className="p-2.5 border-t bg-gray-50 text-center shrink-0">
            <Link href="/relatorios" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              Gerer Relatório Completo &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}