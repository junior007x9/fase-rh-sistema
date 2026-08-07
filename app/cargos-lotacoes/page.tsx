// Arquivo: app/cargos-lotacoes/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, lotacoes, cargos } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Briefcase, MapPin, Users, User, ChevronRight, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CargosLotacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string, nome?: string }>
}) {
  const params = await searchParams;
  const tipoFiltro = params?.tipo; // 'cargo' ou 'lotacao'
  const nomeFiltro = params?.nome ? decodeURIComponent(params.nome) : null;

  // 1. Busca todos os servidores ativos com seus dados pessoais e lotação/cargo
  const todosServidores = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    cargo: servidores.cargo,
    lotacao: servidores.lotacao,
    status: servidores.status,
    nome: dadosPessoais.nome,
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .where(eq(servidores.status, "ATIVO"));

  // 2. Agrupa os Cargos e Conta quantos servidores tem em cada um
  const mapaCargos: Record<string, any[]> = {};
  // 3. Agrupa as Lotações e Conta quantos servidores tem em cada uma
  const mapaLotacoes: Record<string, any[]> = {};

  todosServidores.forEach(srv => {
    const cargoNome = srv.cargo || "NÃO INFORMADO";
    const lotacaoNome = srv.lotacao || "NÃO INFORMADA";

    if (!mapaCargos[cargoNome]) mapaCargos[cargoNome] = [];
    mapaCargos[cargoNome].push(srv);

    if (!mapaLotacoes[lotacaoNome]) mapaLotacoes[lotacaoNome] = [];
    mapaLotacoes[lotacaoNome].push(srv);
  });

  const listaCargosResumo = Object.keys(mapaCargos).map(nome => ({
    nome,
    total: mapaCargos[nome].length
  })).sort((a, b) => b.total - a.total);

  const listaLotacoesResumo = Object.keys(mapaLotacoes).map(nome => ({
    nome,
    total: mapaLotacoes[nome].length
  })).sort((a, b) => b.total - a.total);

  // Servidores filtrados se o usuário clicou em um cargo ou lotação específica
  let servidoresExibidos: any[] = [];
  if (tipoFiltro === 'cargo' && nomeFiltro) {
    servidoresExibidos = mapaCargos[nomeFiltro] || [];
  } else if (tipoFiltro === 'lotacao' && nomeFiltro) {
    servidoresExibidos = mapaLotacoes[nomeFiltro] || [];
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <header className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Cargos e Lotações</h1>
          <p className="text-slate-500 text-sm mt-1">Visão gerencial e distribuição do quadro de servidores ativos da FASE-MA.</p>
        </div>
        {nomeFiltro && (
          <Link href="/cargos-lotacoes" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
            <X size={16} /> Limpar Filtro / Voltar ao Resumo
          </Link>
        )}
      </header>

      {/* SE UM FILTRO FOI CLICADO, MOSTRA OS SERVIDORES DAQUELE GRUPO */}
      {nomeFiltro ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Servidores alocados em:</span>
              <h2 className="text-lg font-extrabold text-emerald-400">{nomeFiltro}</h2>
            </div>
            <span className="bg-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700">
              {servidoresExibidos.length} servidor(es) encontrado(s)
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {servidoresExibidos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">Nenhum servidor encontrado neste registro.</div>
            ) : (
              servidoresExibidos.map(srv => (
                <div key={srv.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 border border-slate-200">
                      {srv.nome ? srv.nome.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{srv.nome}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Matrícula: <strong className="text-slate-700">{srv.matricula || 'N/A'}</strong> | Cargo: {srv.cargo} | Lotação: {srv.lotacao}
                      </p>
                    </div>
                  </div>
                  <Link href={`/servidores/${srv.id}`} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1 w-full sm:w-auto">
                    Ver Perfil <ChevronRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* VISÃO GERAL (CARDS DE RESUMO) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUNA 1: CARGOS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Briefcase size={22} />
                <h2 className="font-bold text-base">Distribuição por Cargo</h2>
              </div>
              <span className="text-[10px] sm:text-xs bg-blue-700 px-3 py-1 rounded-xl font-bold border border-blue-500/30">{listaCargosResumo.length} cargos distintos</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {listaCargosResumo.map((item) => (
                <Link 
                  key={item.nome} 
                  href={`/cargos-lotacoes?tipo=cargo&nome=${encodeURIComponent(item.nome)}`}
                  className="p-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{item.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                      {item.total} servidor(es)
                    </span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* COLUNA 2: LOTAÇÕES */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-purple-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <MapPin size={22} />
                <h2 className="font-bold text-base">Distribuição por Unidade / Lotação</h2>
              </div>
              <span className="text-[10px] sm:text-xs bg-purple-700 px-3 py-1 rounded-xl font-bold border border-purple-500/30">{listaLotacoesResumo.length} lotações ativas</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {listaLotacoesResumo.map((item) => (
                <Link 
                  key={item.nome} 
                  href={`/cargos-lotacoes?tipo=lotacao&nome=${encodeURIComponent(item.nome)}`}
                  className="p-4 hover:bg-purple-50/50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <MapPin size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-purple-700 transition-colors">{item.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full group-hover:bg-purple-100 group-hover:text-purple-800 transition-colors">
                      {item.total} servidor(es)
                    </span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}