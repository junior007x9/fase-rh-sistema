// Arquivo: app/ferias/page.tsx
export const dynamic = "force-dynamic";

import { db } from "../../db/index";
import { servidores, dadosPessoais, eventosAusencia } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { CalendarDays, FileWarning, CheckCircle, Pencil, X, Calendar } from "lucide-react";
import Link from "next/link";
import BotaoExcluir from "../components/BotaoExcluir";
import { registrarAusencia, atualizarAusencia, excluirAusencia } from "../actions/ferias";

// Função auxiliar para formatar datas (YYYY-MM-DD para DD/MM/YYYY) evitando bugs de fuso horário
const formatarData = (dataBase: string) => {
  if (!dataBase) return "";
  return dataBase.split('-').reverse().join('/');
};

// Função auxiliar para deixar o nome do tipo de ausência mais legível
const formatarTipoAusencia = (tipo: string) => {
  const tipos: Record<string, string> = {
    FERIAS: "Férias",
    LICENCA_MATERNIDADE: "Licença Maternidade",
    SAUDE: "Licença Saúde",
    LICENCA_PREMIO: "Licença Prêmio",
    AFASTAMENTO_SUPERIOR_15: "Afastamento > 15 dias"
  };
  return tipos[tipo] || tipo.replace(/_/g, ' ');
};

export default async function FeriasAusenciasPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ editar?: string }> 
}) {
  let listaServidoresAtivos: any[] = [];
  let historicoAusencias: any[] = [];
  let eventoEditando = null;

  try {
    // 1. Resolve a promessa do searchParams (Correção Next.js 15+)
    const resolvedSearchParams = await searchParams;
    const idEdicao = resolvedSearchParams?.editar;

    // 2. Busca os servidores ATIVOS para popular o select do formulário
    listaServidoresAtivos = await db
      .select({
        id: servidores.id,
        nome: dadosPessoais.nome,
        matricula: servidores.matricula,
      })
      .from(servidores)
      .innerJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
      .where(eq(servidores.status, "ATIVO"))
      .orderBy(dadosPessoais.nome);

    // 3. Busca o histórico geral de ausências registradas
    historicoAusencias = await db
      .select({
        id: eventosAusencia.id,
        tipoAusencia: eventosAusencia.tipoAusencia,
        dataInicio: eventosAusencia.dataInicio,
        dataFim: eventosAusencia.dataFim,
        observacao: eventosAusencia.observacao,
        nomeServidor: dadosPessoais.nome,
        servidorId: eventosAusencia.servidorId,
      })
      .from(eventosAusencia)
      .innerJoin(dadosPessoais, eq(eventosAusencia.servidorId, dadosPessoais.servidorId))
      .orderBy(desc(eventosAusencia.criadoEm));

    // 4. Verifica se estamos no modo de edição
    if (idEdicao) {
      eventoEditando = historicoAusencias.find(e => e.id === idEdicao);
    }
  } catch (error) {
    console.error("Erro ao carregar dados de Férias:", error);
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <header className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Férias e Ausências</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os afastamentos e licenças dos servidores da instituição de forma centralizada.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* ========================================== */}
        {/* COLUNA ESQUERDA: FORMULÁRIO DE REGISTRO */}
        {/* ========================================== */}
        <section className={`lg:col-span-1 p-6 sm:p-8 rounded-2xl border shadow-sm h-fit transition-all duration-300 ${eventoEditando ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${eventoEditando ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                {eventoEditando ? <Pencil size={20} /> : <CalendarDays size={20} />}
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {eventoEditando ? "Editando Evento" : "Registrar Evento"}
              </h2>
            </div>
            {eventoEditando && (
              <Link href="/ferias" className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors" title="Cancelar Edição">
                <X size={18} />
              </Link>
            )}
          </div>

          <form action={eventoEditando ? atualizarAusencia : registrarAusencia} className="space-y-4">
            
            {/* Campo oculto com ID se estiver editando */}
            {eventoEditando && <input type="hidden" name="id" value={eventoEditando.id} />}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Servidor *</label>
              <select name="servidorId" defaultValue={eventoEditando?.servidorId || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700">
                <option value="">Selecione um servidor...</option>
                {listaServidoresAtivos.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome} {s.matricula ? `(${s.matricula})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Ausência *</label>
              <select name="tipoAusencia" defaultValue={eventoEditando?.tipoAusencia || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700">
                <option value="">Selecione o tipo...</option>
                <option value="FERIAS">Férias</option>
                <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                <option value="SAUDE">Licença Saúde / Atestado</option>
                <option value="LICENCA_PREMIO">Licença Prêmio</option>
                <option value="AFASTAMENTO_SUPERIOR_15">Afastamento Superior a 15 dias</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Início *</label>
                <input type="date" name="dataInicio" defaultValue={eventoEditando?.dataInicio || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fim *</label>
                <input type="date" name="dataFim" defaultValue={eventoEditando?.dataFim || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700" />
              </div>
            </div>

            <div className="pb-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Observações / Processo nº</label>
              <textarea name="observacao" defaultValue={eventoEditando?.observacao || ""} rows={3} placeholder="Detalhes adicionais..." className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700 resize-none"></textarea>
            </div>

            <button type="submit" className={`w-full text-white p-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${eventoEditando ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
              {eventoEditando ? "Salvar Alterações" : "Registrar Evento"}
            </button>
          </form>
        </section>

        {/* ========================================== */}
        {/* COLUNA DIREITA: TABELA DE HISTÓRICO */}
        {/* ========================================== */}
        <section className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2 shrink-0">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><FileWarning size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Histórico Recente de Afastamentos</h2>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Servidor</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Motivo</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">Período</th>
                  <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicoAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 bg-slate-50/50 rounded-xl">
                      <CheckCircle size={32} className="mx-auto text-emerald-400 mb-3" />
                      <span className="font-medium text-sm">Nenhuma ausência registrada no sistema.</span>
                    </td>
                  </tr>
                ) : (
                  historicoAusencias.map((evento) => (
                    <tr key={evento.id} className={`group transition-colors ${eventoEditando?.id === evento.id ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}>
                      
                      {/* Servidor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                            {evento.nomeServidor.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{evento.nomeServidor}</p>
                            {evento.observacao && <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={evento.observacao}>{evento.observacao}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Motivo */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          evento.tipoAusencia === 'FERIAS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          evento.tipoAusencia === 'SAUDE' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {formatarTipoAusencia(evento.tipoAusencia)}
                        </span>
                      </td>

                      {/* Período */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{formatarData(evento.dataInicio)}</span>
                          <span className="text-slate-300">-</span>
                          <span>{formatarData(evento.dataFim)}</span>
                        </div>
                      </td>
                      
                      {/* BOTÕES DE AÇÃO */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          
                          {/* Lápis de Edição */}
                          <Link 
                            href={`/ferias?editar=${evento.id}`} 
                            scroll={false}
                            className="p-2 bg-white border border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded-lg transition-colors shadow-sm"
                            title="Editar Evento"
                          >
                            <Pencil size={14} />
                          </Link>

                          {/* Lixeira de Exclusão com Auditoria */}
                          <BotaoExcluir 
                            id={evento.id} 
                            nomeRegistro={`${evento.nomeServidor} (${formatarTipoAusencia(evento.tipoAusencia)})`} 
                            acaoExcluir={excluirAusencia as any} 
                          />
                        </div>
                      </td>
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