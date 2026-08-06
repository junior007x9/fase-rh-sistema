// Arquivo: app/folha/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, lancamentosFolha } from "../../db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Calculator, Calendar, Search, FileText, ChevronRight, ChevronLeft, AlertCircle, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default async function FolhaPagamentoPage({ searchParams }: { searchParams: Promise<{ mesAno?: string, busca?: string, pagina?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  const dataAtual = new Date();
  const mesAtualPadrao = `${String(dataAtual.getMonth() + 1).padStart(2, '0')}-${dataAtual.getFullYear()}`;
  
  const mesAnoFiltro = resolvedSearchParams?.mesAno || mesAtualPadrao;
  const termoBusca = resolvedSearchParams?.busca || "";
  
  // PAGINAÇÃO - Configuração inicial
  const paginaAtual = Number(resolvedSearchParams?.pagina) || 1;
  const itensPorPagina = 20;

  // 1. Busca os Servidores Ativos
  const listaServidores = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    cargo: servidores.cargo,
    remuneracaoBase: servidores.remuneracaoBase,
    nome: dadosPessoais.nome,
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .where(eq(servidores.status, "ATIVO"));

  // 2. Busca TODOS os lançamentos da folha DESSA competência
  const lancamentosMes = await db.select()
    .from(lancamentosFolha)
    .where(eq(lancamentosFolha.mesAno, mesAnoFiltro));

  // 3. Monta um mapa consolidado com os totais de cada servidor
  const totaisServidores: Record<string, { proventos: number, descontos: number }> = {};
  
  lancamentosMes.forEach(lan => {
    if (!totaisServidores[lan.servidorId]) {
      totaisServidores[lan.servidorId] = { proventos: 0, descontos: 0 };
    }
    if (lan.tipo === 'PROVENTO') totaisServidores[lan.servidorId].proventos += lan.valorFinal;
    if (lan.tipo === 'DESCONTO') totaisServidores[lan.servidorId].descontos += lan.valorFinal;
  });

  // Filtro de busca textual
  const servidoresFiltrados = listaServidores.filter(s => {
    if (!termoBusca) return true;
    const buscaLower = termoBusca.toLowerCase();
    return (s.nome?.toLowerCase().includes(buscaLower) || s.matricula?.toLowerCase().includes(buscaLower));
  });

  // ---------------------------------------------------------------------------
  // LÓGICA DE PAGINAÇÃO NO ARRAY (Impede a tela de travar)
  // ---------------------------------------------------------------------------
  const totalRegistros = servidoresFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);
  const offset = (paginaAtual - 1) * itensPorPagina;
  
  // Corta a lista para exibir apenas os 20 servidores da página atual
  const servidoresPaginados = servidoresFiltrados.slice(offset, offset + itensPorPagina);

  // Calcula o impacto total da folha para a empresa (Usando todos os filtrados para bater o valor real)
  let totalGeralEmpresa = 0;
  servidoresFiltrados.forEach(srv => {
    const totaisSrv = totaisServidores[srv.id] || { proventos: 0, descontos: 0 };
    const baseCalculo = mesAnoFiltro.startsWith('13') ? 0 : (srv.remuneracaoBase || 0);
    const liquido = (baseCalculo + totaisSrv.proventos) - totaisSrv.descontos;
    totalGeralEmpresa += liquido;
  });

  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Helper para montar a URL da paginação sem perder a busca
  const urlPaginacao = (novaPagina: number) => {
    const params = new URLSearchParams();
    if (termoBusca) params.set("busca", termoBusca);
    if (mesAnoFiltro) params.set("mesAno", mesAnoFiltro);
    params.set("pagina", String(novaPagina));
    return `/folha?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Movimento: Folha de Pagamento</h1>
            <p className="text-gray-500 mt-1">Visão consolidada e lançamentos da competência.</p>
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form className="flex-1 flex gap-4 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              name="busca" 
              defaultValue={termoBusca}
              placeholder="Buscar por nome ou matrícula..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="w-64 relative flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <select 
              name="mesAno" 
              defaultValue={mesAnoFiltro}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-gray-700"
            >
              {[2024, 2025, 2026, 2027].map(ano => (
                <optgroup key={ano} label={`Ano ${ano}`}>
                  {nomesMeses.map((mes, index) => {
                    const valor = `${String(index + 1).padStart(2, '0')}-${ano}`;
                    return <option key={valor} value={valor}>{mes} / {ano}</option>
                  })}
                  <option value={`13-${ano}`} className="font-bold text-emerald-700">13º Salário (Abono) / {ano}</option>
                </optgroup>
              ))}
            </select>
          </div>

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* LISTA CONSOLIDADA DOS SERVIDORES */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2">
            <Banknote size={18} className="text-emerald-400"/> 
            Espelho da Folha {mesAnoFiltro.startsWith('13') ? "(13º Salário)" : "(Regular)"}
          </h2>
          <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
            Competência: {mesAnoFiltro}
          </span>
        </div>
        
        {servidoresPaginados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <AlertCircle size={40} className="text-gray-300 mb-3" />
            <p>Nenhum servidor encontrado nesta página.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {servidoresPaginados.map((srv) => {
              const totaisSrv = totaisServidores[srv.id] || { proventos: 0, descontos: 0 };
              
              const baseCalculo = mesAnoFiltro.startsWith('13') ? 0 : (srv.remuneracaoBase || 0);
              const totalProventosFinal = baseCalculo + totaisSrv.proventos;
              const liquido = totalProventosFinal - totaisSrv.descontos;
              
              return (
                <div key={srv.id} className="p-4 hover:bg-emerald-50/50 transition-colors flex flex-col xl:flex-row items-center justify-between gap-6 group">
                  
                  {/* IDENTIFICAÇÃO */}
                  <div className="w-full xl:w-1/3 flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                      {srv.nome?.charAt(0) || 'S'}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{srv.nome}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Matrícula: {srv.matricula || "S/N"} | {srv.cargo}
                      </p>
                    </div>
                  </div>

                  {/* TOTAIS FINANCEIROS CONSOLIDADOS */}
                  <div className="w-full xl:w-auto flex-1 grid grid-cols-4 gap-4 text-right items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Base Contratual</p>
                      <p className="text-sm font-semibold text-gray-700">{formatarMoeda(srv.remuneracaoBase || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-wide">Tot. Proventos</p>
                      <p className="text-sm font-semibold text-green-700">{formatarMoeda(totalProventosFinal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-red-600/70 font-bold uppercase tracking-wide">Tot. Descontos</p>
                      <p className="text-sm font-semibold text-red-700">{formatarMoeda(totaisSrv.descontos)}</p>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                      <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide">Líquido</p>
                      <p className="text-base font-black text-emerald-900">{formatarMoeda(liquido)}</p>
                    </div>
                  </div>
                  
                  {/* BOTÃO LANÇAR */}
                  <div className="w-full xl:w-auto flex justify-end">
                    <Link 
                      href={`/folha/${srv.id}?mesAno=${mesAnoFiltro}`} 
                      className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
                    >
                      <FileText size={16} /> Lançar Eventos <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* CONTROLES DE PAGINAÇÃO */}
            {totalPaginas > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <p className="text-xs text-slate-500 font-medium">
                  Mostrando página <strong className="text-slate-800">{paginaAtual}</strong> de <strong className="text-slate-800">{totalPaginas}</strong> 
                  <span className="hidden sm:inline"> ({totalRegistros} servidores encontrados)</span>
                </p>
                
                <div className="flex items-center gap-2">
                  {paginaAtual > 1 ? (
                    <Link 
                      href={urlPaginacao(paginaAtual - 1)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft size={16} /> Anterior
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-sm font-bold flex items-center gap-1 cursor-not-allowed">
                      <ChevronLeft size={16} /> Anterior
                    </button>
                  )}

                  {paginaAtual < totalPaginas ? (
                    <Link 
                      href={urlPaginacao(paginaAtual + 1)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-1"
                    >
                      Próxima <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-sm font-bold flex items-center gap-1 cursor-not-allowed">
                      Próxima <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* RODAPÉ: TOTAL DA FOLHA */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end items-center gap-4">
              <span className="text-sm font-bold text-gray-500 uppercase">Impacto Líquido Total da Folha:</span>
              <span className="text-xl font-black text-gray-900">{formatarMoeda(totalGeralEmpresa)}</span>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}