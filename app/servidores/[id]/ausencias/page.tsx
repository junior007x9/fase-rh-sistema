// Arquivo: app/servidores/[id]/ausencias/page.tsx
import { db } from "../../../../db/index";
import { servidores, dadosPessoais, periodosAquisitivos, eventosAusencia } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, CalendarRange, Clock, Pencil, X } from "lucide-react";
import BotaoExcluir from "../../../components/BotaoExcluir";
import { 
  salvarPeriodoAquisitivo, 
  atualizarPeriodoAquisitivo, 
  excluirPeriodoAquisitivo, 
  salvarEventoAusencia, 
  atualizarAusencia, 
  excluirAusencia 
} from "../../../actions/ausencias";

export const dynamic = "force-dynamic";

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
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/servidores/${servidorId}`} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Férias e Ausências</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              Servidor(a): <span className="font-semibold">{pessoal.nome}</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                Matrícula: {servidorBase.matricula || "Não informada"}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. PERÍODOS AQUISITIVOS DE FÉRIAS */}
        <section className={`p-6 rounded-xl border shadow-sm h-fit transition-colors ${periodoEditando ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="text-blue-600" />
              <h2 className={`text-xl font-semibold ${periodoEditando ? 'text-amber-800' : 'text-gray-800'}`}>
                {periodoEditando ? "Editando Período Aquisitivo" : "Períodos Aquisitivos (Férias)"}
              </h2>
            </div>
            {periodoEditando && (
              <Link href={`/servidores/${servidorId}/ausencias`} scroll={false} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </Link>
            )}
          </div>

          <form action={periodoEditando ? atualizarPeriodoAquisitivo : salvarPeriodoAquisitivo} className={`mb-6 p-4 rounded-lg border transition-colors ${periodoEditando ? 'bg-amber-100/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <h3 className={`text-sm font-bold mb-3 ${periodoEditando ? 'text-amber-900' : 'text-slate-700'}`}>
              {periodoEditando ? "Alterar Período" : "Registrar Novo Período"}
            </h3>
            
            <input type="hidden" name="servidorId" value={servidorId} />
            {periodoEditando && <input type="hidden" name="id" value={periodoEditando.id} />}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                <input type="date" name="dataInicio" defaultValue={periodoEditando?.dataInicio || ""} required className="border p-2 rounded-md w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                <input type="date" name="dataFim" defaultValue={periodoEditando?.dataFim || ""} required className="border p-2 rounded-md w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className={`w-full text-white p-2 rounded-md text-sm font-bold transition-colors ${periodoEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {periodoEditando ? "Salvar Alterações" : "Adicionar Período Aquisitivo"}
            </button>
          </form>

          <div className="space-y-3">
            {periodos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum período aquisitivo registrado.</p>
            ) : (
              periodos.map((p) => (
                <div key={p.id} className={`flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm group transition-colors ${periodoEditando?.id === p.id ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 hover:bg-slate-50'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.dataInicio} a {p.dataFim}</p>
                    <p className="text-xs text-gray-500">Dias restantes: {p.diasRestantes}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      p.status === 'PENDENTE' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {p.status}
                    </span>
                    <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Link href={`/servidores/${servidorId}/ausencias?editarPeriodo=${p.id}`} scroll={false} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md">
                        <Pencil size={14} />
                      </Link>
                      <BotaoExcluir id={p.id} nomeRegistro={`Período ${p.dataInicio} a ${p.dataFim}`} acaoExcluir={excluirPeriodoAquisitivo as any} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. REGISTRO DE EVENTOS DE AUSÊNCIA */}
        <section className={`p-6 rounded-xl border shadow-sm transition-colors ${ausenciaEditando ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-blue-600" />
              <h2 className={`text-xl font-semibold ${ausenciaEditando ? 'text-amber-800' : 'text-gray-800'}`}>
                {ausenciaEditando ? "Editando Ausência" : "Histórico de Ausências"}
              </h2>
            </div>
            {ausenciaEditando && (
              <Link href={`/servidores/${servidorId}/ausencias`} scroll={false} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </Link>
            )}
          </div>

          <form action={ausenciaEditando ? atualizarAusencia : salvarEventoAusencia} className={`mb-6 p-4 rounded-lg border transition-colors ${ausenciaEditando ? 'bg-amber-100/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
             <h3 className={`text-sm font-bold mb-3 ${ausenciaEditando ? 'text-amber-900' : 'text-slate-700'}`}>
               {ausenciaEditando ? "Alterar Ausência" : "Registrar Nova Ausência"}
             </h3>
            
            <input type="hidden" name="servidorId" value={servidorId} />
            {ausenciaEditando && <input type="hidden" name="id" value={ausenciaEditando.id} />}
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Ausência</label>
              <select name="tipoAusencia" defaultValue={ausenciaEditando?.tipoAusencia || "FERIAS"} required className="border p-2 rounded-md w-full text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="FERIAS">Férias</option>
                <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                <option value="SAUDE">Saúde / Atestado</option>
                <option value="LICENCA_PREMIO">Licença Prêmio</option>
                <option value="AFASTAMENTO_SUPERIOR_15">Afastamento Superior a 15 Dias</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Início da Ausência</label>
                <input type="date" name="dataInicio" defaultValue={ausenciaEditando?.dataInicio || ""} required className="border p-2 rounded-md w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fim da Ausência</label>
                <input type="date" name="dataFim" defaultValue={ausenciaEditando?.dataFim || ""} required className="border p-2 rounded-md w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Vincular a Período Aquisitivo (Se Férias)</label>
              <select name="periodoAquisitivoId" defaultValue={ausenciaEditando?.periodoAquisitivoId || ""} className="border p-2 rounded-md w-full text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Não vincular</option>
                {periodos.filter(p => p.status === 'PENDENTE').map(p => (
                  <option key={p.id} value={p.id}>{p.dataInicio} a {p.dataFim}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Observação / Motivo</label>
              <input type="text" name="observacao" defaultValue={ausenciaEditando?.observacao || ""} className="border p-2 rounded-md w-full text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500" placeholder="Opcional" />
            </div>

            <button type="submit" className={`w-full text-white p-2 rounded-md text-sm font-bold transition-colors ${ausenciaEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {ausenciaEditando ? "Salvar Alterações" : "Registrar Ausência"}
            </button>
          </form>

          <div className="space-y-3">
            {ausencias.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma ausência registrada.</p>
            ) : (
              ausencias.map((a) => (
                <div key={a.id} className={`p-3 bg-white border rounded-lg shadow-sm border-l-4 flex justify-between items-center group transition-colors ${ausenciaEditando?.id === a.id ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 border-l-blue-500 hover:bg-slate-50'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{a.tipoAusencia.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600 mt-1">Período: {a.dataInicio} até {a.dataFim}</p>
                    {a.observacao && <p className="text-xs text-gray-500 mt-1 italic">Obs: {a.observacao}</p>}
                  </div>
                  <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link href={`/servidores/${servidorId}/ausencias?editarAusencia=${a.id}`} scroll={false} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md">
                      <Pencil size={14} />
                    </Link>
                    <BotaoExcluir id={a.id} nomeRegistro={a.tipoAusencia} acaoExcluir={excluirAusencia as any} />
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