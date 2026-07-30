// Arquivo: app/page.tsx
import { db } from "../db/index";
import { servidores, dadosPessoais, lotacoes, ausencias } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { Users, UserMinus, MapPin, Briefcase, Gift, Calendar, BarChart3, PieChart } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Buscando métricas básicas
  const totalServidoresQuery = await db.select({ count: sql<number>`count(*)` }).from(servidores).where(eq(servidores.status, "ATIVO"));
  const totalLotacoesQuery = await db.select({ count: sql<number>`count(*)` }).from(lotacoes);

  const totalAtivos = totalServidoresQuery[0]?.count || 0;
  const totalLotacoes = totalLotacoesQuery[0]?.count || 0;

  // Busca dados para o Gráfico de Vínculos (Dinâmico)
  const vinculosData = await db.select({
    vinculo: servidores.vinculo,
    total: sql<number>`count(*)`
  })
  .from(servidores)
  .where(eq(servidores.status, "ATIVO"))
  .groupBy(servidores.vinculo);

  // 🚀 BUSCANDO DADOS REAIS DE AUSÊNCIAS E LICENÇAS
  const listaAusencias = await db.select().from(ausencias);
  const totalAfastados = listaAusencias.length; // Quantidade total cadastrada

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
    // Tenta usar a data de início para agrupar. Se não tiver, usa a data de criação
    const dataRef = (aus as any).dataInicio || (aus as any).criadoEm;
    if (dataRef) {
      const [ano, mes] = dataRef.split('T')[0].split('-'); // Suporta padrão ISO ou YYYY-MM-DD
      const mesIndex = ultimos6Meses.findIndex(m => m.mes === parseInt(mes) && m.ano === parseInt(ano));
      if (mesIndex !== -1) {
        ultimos6Meses[mesIndex].val++;
      }
    } else {
      // Se a ausência não tiver nenhuma data, joga no mês atual para refletir no gráfico
      ultimos6Meses[5].val++;
    }
  });

  // Define um teto visual para o gráfico não quebrar se os números forem pequenos
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
    const [ano, mes, dia] = srv.dataNascimento.split('-');
    return parseInt(mes) === mesAtual;
  }).sort((a, b) => {
    const diaA = parseInt(a.dataNascimento!.split('-')[2]);
    const diaB = parseInt(b.dataNascimento!.split('-')[2]);
    return diaA - diaB;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Interativo</h1>
        <p className="text-gray-500 mt-1">Visão estratégica dos recursos humanos da FASE-MA.</p>
      </header>

      {/* CARDS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium">Servidores Ativos</p>
            <h2 className="text-4xl font-bold mt-1">{totalAtivos}</h2>
          </div>
          <Users size={48} className="absolute right-4 bottom-4 text-blue-500 opacity-50" />
        </div>

        <div className="bg-orange-500 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-orange-100 text-sm font-medium">Afastamentos/Licenças</p>
            <h2 className="text-4xl font-bold mt-1">{totalAfastados}</h2>
          </div>
          <UserMinus size={48} className="absolute right-4 bottom-4 text-orange-400 opacity-50" />
        </div>

        <div className="bg-purple-600 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-purple-100 text-sm font-medium">Total de Lotações</p>
            <h2 className="text-4xl font-bold mt-1">{totalLotacoes}</h2>
          </div>
          <MapPin size={48} className="absolute right-4 bottom-4 text-purple-500 opacity-50" />
        </div>

        <div className="bg-emerald-500 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium">Cadastro de Reserva</p>
            <h2 className="text-4xl font-bold mt-1">0</h2>
          </div>
          <Briefcase size={48} className="absolute right-4 bottom-4 text-emerald-400 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SESSÃO DE GRÁFICOS */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* GRÁFICO 1: Distribuição por Vínculo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Distribuição por Vínculo</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-5">
              {vinculosData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">Nenhum dado disponível.</p>
              ) : (
                vinculosData.map((v) => {
                  const percent = totalAtivos > 0 ? Math.round((v.total / totalAtivos) * 100) : 0;
                  return (
                    <div key={v.vinculo}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-gray-700">{v.vinculo}</span>
                        <span className="text-gray-500 font-medium">{v.total} serv. ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GRÁFICO 2: Ausências e Licenças (AGORA DINÂMICO!) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-orange-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Cenário de Ausências</h3>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 h-40 mt-4 border-b border-gray-100 pb-2 relative">
              {ultimos6Meses.map((item, i) => {
                // Calcula a altura da barra em porcentagem baseada no mês com maior número de ausências
                const alturaBarra = Math.round((item.val / maxAusencias) * 100);
                
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div 
                      className="w-full max-w-[2.5rem] bg-orange-100 group-hover:bg-orange-500 rounded-t-md transition-colors relative flex items-end justify-center" 
                      style={{ height: `${alturaBarra}%`, minHeight: '4px' }}
                    >
                      {/* O número aparece flutuando quando você passa o mouse por cima (hover) */}
                      <span className="absolute -top-7 text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.val}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-400 mt-3">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* CARD DE ANIVERSARIANTES DO MÊS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Gift size={20} />
              <h2 className="font-bold text-lg">Aniversariantes</h2>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold uppercase tracking-wider">
              {nomeMesAtual}
            </span>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto max-h-[350px]">
            {aniversariantesDoMes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-8">
                <Calendar size={32} className="opacity-20" />
                <p className="text-sm">Nenhum aniversário este mês.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {aniversariantesDoMes.map(srv => {
                  const dia = srv.dataNascimento?.split('-')[2];
                  return (
                    <li key={srv.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 transition-colors">
                      <div className="bg-white text-pink-600 font-bold text-lg h-10 w-10 min-w-[40px] rounded-full flex items-center justify-center shadow-sm border border-pink-100">
                        {dia}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{srv.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{srv.cargo || 'Servidor'} • {srv.lotacao}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="p-3 border-t bg-gray-50 text-center">
            <Link href="/relatorios" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              Gerar Relatório Completo &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}