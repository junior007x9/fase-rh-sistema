// Arquivo: app/page.tsx
export const dynamic = 'force-dynamic'; // ⚡ ESTA É A LINHA MÁGICA QUE RESOLVE O PROBLEMA

import { db } from "../db/index";
import { servidores, candidatos, lotacoes, eventosAusencia } from "../db/schema";
import { Users, UserMinus, Briefcase, MapPin, UserPlus, FileText } from "lucide-react";
import Link from "next/link";
import DashboardCharts from "./components/DashboardCharts";

export default async function DashboardPage() {
  // 1. Buscando Dados do Banco em Tempo Real
  const todosServidores = await db.select().from(servidores);
  const totalCandidatos = await db.select().from(candidatos);
  const totalLotacoes = await db.select().from(lotacoes);
  const todasAusencias = await db.select().from(eventosAusencia);

  // 2. Processando Metricas dos Cards
  const ativos = todosServidores.filter(s => s.status === 'ATIVO').length;
  const afastados = todosServidores.filter(s => s.status === 'AFASTADO').length;
  const emReserva = totalCandidatos.filter(c => c.status === 'RESERVA').length;

  // 3. Processando Dados para os Gráficos
  // Gráfico de Vínculos
  const vinculosCount = todosServidores.reduce((acc: any, curr) => {
    acc[curr.vinculo] = (acc[curr.vinculo] || 0) + 1;
    return acc;
  }, {});
  const vinculosData = Object.keys(vinculosCount).map(key => ({ name: key, value: vinculosCount[key] }));

  // Gráfico de Ausências
  const ausenciasCount = todasAusencias.reduce((acc: any, curr) => {
    const nomeLimpo = curr.tipoAusencia.replace(/_/g, ' ');
    acc[nomeLimpo] = (acc[nomeLimpo] || 0) + 1;
    return acc;
  }, {});
  const ausenciasData = Object.keys(ausenciasCount).map(key => ({ name: key, value: ausenciasCount[key] }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Interativo</h1>
        <p className="text-slate-500 mt-2 text-lg">Visão estratégica dos recursos humanos da FASE-MA.</p>
      </div>

      {/* CARDS DE INDICADORES (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Ativos */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium mb-1">Servidores Ativos</p>
              <h3 className="text-4xl font-bold">{ativos}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Card 2: Afastados */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-2xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 font-medium mb-1">Afastamentos/Licenças</p>
              <h3 className="text-4xl font-bold">{afastados}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <UserMinus size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Card 3: Lotações */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 font-medium mb-1">Total de Lotações</p>
              <h3 className="text-4xl font-bold">{totalLotacoes.length}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <MapPin size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Card 4: Recrutamento */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium mb-1">Cadastro de Reserva</p>
              <h3 className="text-4xl font-bold">{emReserva}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Briefcase size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS (Componente Cliente) */}
      <DashboardCharts 
        vinculosData={vinculosData.length > 0 ? vinculosData : [{name: 'Sem Dados', value: 1}]} 
        ausenciasData={ausenciasData} 
      />

      {/* AÇÕES RÁPIDAS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/servidores/novo" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
            <UserPlus size={18} /> Novo Servidor
          </Link>
          <Link href="/relatorios" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer">
            <FileText size={18} /> Gerar Relatório
          </Link>
        </div>
      </div>

    </div>
  );
}