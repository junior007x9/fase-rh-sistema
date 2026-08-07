// Arquivo: app/servidores/[id]/ausencias/page.tsx
import { db } from "../../../../db/index";
import { servidores, dadosPessoais, periodosAquisitivos, eventosAusencia } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, CalendarRange, Clock, Pencil, X, Calendar, FileText } from "lucide-react";
import BotaoExcluir from "../../../components/BotaoExcluir";
import { 
  salvarPeriodoAquisitivo, 
  atualizarPeriodoAquisitivo, 
  excluirPeriodoAquisitivo, 
  salvarEventoAusencia, 
  atualizarAusencia, 
  excluirAusencia 
} from "../../../actions/ausencias";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataExibicao } from "../../../utils/formatters";

export const dynamic = "force-dynamic";

// Função auxiliar para deixar o nome do tipo de ausência mais legível e bonito na tela
const formatarTipoAusencia = (tipo: string) => {
  const tipos: Record<string, string> = {
    FERIAS: "Férias",
    LICENCA_MATERNIDADE: "Licença Maternidade",
    SAUDE: "Saúde / Atestado",
    LICENCA_PREMIO: "Licença Prêmio",
    AFASTAMENTO_SUPERIOR_15: "Afastamento > 15 dias"
  };
  return tipos[tipo] || tipo.replace(/_/g, ' ');
};

export default async function AusenciasPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ editarPeriodo?: string, editarAusencia?: string }> 
}) {
  // Await nos parâmetros (Padrão Next.js 15+)
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;
  
  const resolvedSearchParams = await searchParams;
  const editarPeriodoId = resolvedSearchParams?.editarPeriodo;
  const editarAusenciaId = resolvedSearchParams?.editarAusencia;

  // Buscando dados do servidor
  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  
  // Buscando Períodos Aquisitivos
  const periodos = await db.select().from(periodosAquisitivos)
    .where(eq(periodosAquisitivos.servidorId, servidorId))
    .orderBy(desc(periodosAquisitivos.dataInicio));

  // Buscando Eventos de Ausência
  const ausencias = await db.select().from(eventosAusencia)
    .where(eq(eventosAusencia.servidorId, servidorId))
    .orderBy(desc(eventosAusencia.criadoEm));

  if (!pessoal || !servidorBase) return <div className="p-8 text-center text-red-500 font-bold">Servidor não encontrado.</div>;

  // Estados de edição via URL
  const periodoEditando = editarPeriodoId ? periodos.find(p => p.id === editarPeriodoId) : null;
  const ausenciaEditando = editarAusenciaId ? ausencias.find(a => a.id === editarAusenciaId) : null;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/servidores/${servidorId}`} className="p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Férias e Ausências</h1>
            <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-2 text-sm">
              Servidor(a): <span className="font-bold text-slate-700">{pessoal.nome}</span>
              <span className="text-[10px] uppercase bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-200">
                Matrícula: {servidorBase.matricula || "Pendente"}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* ========================================== */}
        {/* 1. PERÍODOS AQUISITIVOS DE FÉRIAS */}
        {/* ========================================== */}
        <section className={`p-6 sm:p-8 rounded-2xl border shadow-sm h-fit transition-all ${periodoEditando ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CalendarRange size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Períodos Aquisitivos (Férias)</h2>
            </div>
            {periodoEditando && (
              <Link href={`/servidores/${servidorId}/ausencias`} scroll={false} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors">
                <X size={18} />
              </Link>
            )}
          </div>

          <form action={periodoEditando ? atualizarPeriodoAquisitivo : salvarPeriodoAquisitivo} className={`mb-6 p-5 rounded-xl border transition-all shadow-sm ${periodoEditando ? 'bg-amber-50 border-amber-300 shadow-amber-500/5' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${periodoEditando ? 'text-amber-700' : 'text-slate-500'}`}>
              {periodoEditando ? "Alterar Período" : "Registrar Novo Período"}
            </h3>
            
            <input type="hidden" name="servidorId" value={servidorId} />
            {periodoEditando && <input type="hidden" name="id" value={periodoEditando.id} />}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data Início</label>
                <input type="date" name="dataInicio" defaultValue={periodoEditando?.dataInicio || ""} required className="border border-slate-200 p-2.5 rounded-xl w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data Fim</label>
                <input type="date" name="dataFim" defaultValue={periodoEditando?.dataFim || ""} required className="border border-slate-200 p-2.5 rounded-xl w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700 transition-colors" />
              </div>
            </div>
            <button type="submit" className={`w-full text-white p-3 rounded-xl text-sm font-bold transition-all shadow-md ${periodoEditando ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
              {periodoEditando ? "Salvar Alterações" : "Adicionar Período Aquisitivo"}
            </button>
          </form>

          <div className="space-y-3">
            {periodos.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">Nenhum período aquisitivo registrado.</p>
            ) : (
              periodos.map((p) => (
                <div key={p.id} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-white border rounded-xl shadow-sm border-l-4 group transition-all gap-4 ${periodoEditando?.id === p.id ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 border-l-blue-500 hover:shadow-md hover:border-slate-300'}`}>
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/>
                      {formatarDataExibicao(p.dataInicio)} a {formatarDataExibicao(p.dataFim)}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1.5">Dias restantes: <span className="font-bold text-slate-700">{p.diasRestantes}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border ${
                      p.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {p.status}
                    </span>
                    <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/servidores/${servidorId}/ausencias?editarPeriodo=${p.id}`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </Link>
                      <BotaoExcluir id={p.id} nomeRegistro={`Período ${formatarDataExibicao(p.dataInicio)}`} acaoExcluir={excluirPeriodoAquisitivo as any} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ========================================== */}
        {/* 2. REGISTRO DE EVENTOS DE AUSÊNCIA */}
        {/* ========================================== */}
        <section className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all ${ausenciaEditando ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Clock size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Histórico de Ausências</h2>
            </div>
            {ausenciaEditando && (
              <Link href={`/servidores/${servidorId}/ausencias`} scroll={false} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors">
                <X size={18} />
              </Link>
            )}
          </div>

          <form action={ausenciaEditando ? atualizarAusencia : salvarEventoAusencia} className={`mb-6 p-5 rounded-xl border transition-all shadow-sm ${ausenciaEditando ? 'bg-amber-50 border-amber-300 shadow-amber-500/5' : 'bg-slate-50 border-slate-200'}`}>
             <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${ausenciaEditando ? 'text-amber-700' : 'text-slate-500'}`}>
               {ausenciaEditando ? "Alterar Ausência" : "Registrar Nova Ausência"}
             </h3>
            
            <input type="hidden" name="servidorId" value={servidorId} />
            {ausenciaEditando && <input type="hidden" name="id" value={ausenciaEditando.id} />}
            
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Ausência *</label>
              <select name="tipoAusencia" defaultValue={ausenciaEditando?.tipoAusencia || "FERIAS"} required className="border border-slate-200 p-3 rounded-xl w-full text-sm bg-white outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 transition-colors">
                <option value="FERIAS">Férias</option>
                <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                <option value="SAUDE">Saúde / Atestado</option>
                <option value="LICENCA_PREMIO">Licença Prêmio</option>
                <option value="AFASTAMENTO_SUPERIOR_15">Afastamento Superior a 15 Dias</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Início da Ausência *</label>
                <input type="date" name="dataInicio" defaultValue={ausenciaEditando?.dataInicio || ""} required className="border border-slate-200 p-3 rounded-xl w-full text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500 text-slate-700 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fim da Ausência *</label>
                <input type="date" name="dataFim" defaultValue={ausenciaEditando?.dataFim || ""} required className="border border-slate-200 p-3 rounded-xl w-full text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500 text-slate-700 transition-colors" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vincular a Período Aquisitivo (Se Férias)</label>
              <select name="periodoAquisitivoId" defaultValue={ausenciaEditando?.periodoAquisitivoId || ""} className="border border-slate-200 p-3 rounded-xl w-full text-sm bg-white outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 transition-colors">
                <option value="">Não vincular</option>
                {periodos.filter(p => p.status === 'PENDENTE').map(p => (
                  <option key={p.id} value={p.id}>{formatarDataExibicao(p.dataInicio)} a {formatarDataExibicao(p.dataFim)}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Observação / Motivo (Opcional)</label>
              <input type="text" name="observacao" defaultValue={ausenciaEditando?.observacao || ""} className="border border-slate-200 p-3 rounded-xl w-full text-sm outline-none bg-white focus:ring-2 focus:ring-purple-500 text-slate-700 transition-colors" placeholder="Ex: Portaria Nº 12, Atestado CID..." />
            </div>

            <button type="submit" className={`w-full text-white p-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${ausenciaEditando ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'}`}>
              {ausenciaEditando ? "Salvar Alterações" : "Registrar Ausência"}
            </button>
          </form>

          <div className="space-y-3">
            {ausencias.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">Nenhuma ausência registrada.</p>
            ) : (
              ausencias.map((a) => (
                <div key={a.id} className={`p-4 bg-white border rounded-xl shadow-sm border-l-4 flex justify-between items-start group transition-all ${ausenciaEditando?.id === a.id ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 border-l-purple-500 hover:shadow-md hover:border-slate-300'}`}>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{formatarTipoAusencia(a.tipoAusencia)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                         <Calendar size={10}/> {formatarDataExibicao(a.dataInicio)} a {formatarDataExibicao(a.dataFim)}
                      </span>
                    </div>
                    {a.observacao && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 flex gap-1.5 items-start">
                        <FileText size={14} className="text-slate-400 shrink-0"/> {a.observacao}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-2">
                    <Link href={`/servidores/${servidorId}/ausencias?editarAusencia=${a.id}`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </Link>
                    <BotaoExcluir id={a.id} nomeRegistro={formatarTipoAusencia(a.tipoAusencia)} acaoExcluir={excluirAusencia as any} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}