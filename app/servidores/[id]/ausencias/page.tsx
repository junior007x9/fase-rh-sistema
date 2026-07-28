// Arquivo: app/servidores/[id]/ausencias/page.tsx
import { db } from "../../../../db/index";
import { servidores, dadosPessoais, periodosAquisitivos, eventosAusencia } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, CalendarRange, Clock, ShieldAlert } from "lucide-react";
import { salvarPeriodoAquisitivo, salvarEventoAusencia } from "../../../../actions/ausencias";

export const dynamic = "force-dynamic";

export default async function AusenciasPage({ params }: { params: { id: string } }) {
  const servidorId = params.id;

  // Buscando dados do servidor
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  
  // Buscando Períodos Aquisitivos
  const periodos = await db.select().from(periodosAquisitivos)
    .where(eq(periodosAquisitivos.servidorId, servidorId))
    .orderBy(desc(periodosAquisitivos.dataInicio));

  // Buscando Eventos de Ausência
  const ausencias = await db.select().from(eventosAusencia)
    .where(eq(eventosAusencia.servidorId, servidorId))
    .orderBy(desc(eventosAusencia.criadoEm));

  if (!pessoal) return <div className="p-8 text-center text-red-500 font-bold">Servidor não encontrado.</div>;

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
            <p className="text-gray-500 mt-1">Servidor(a): <span className="font-semibold">{pessoal.nome}</span></p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. PERÍODOS AQUISITIVOS DE FÉRIAS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <CalendarRange className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Períodos Aquisitivos (Férias)</h2>
          </div>

          <form action={salvarPeriodoAquisitivo} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Registrar Novo Período</h3>
            <input type="hidden" name="servidorId" value={servidorId} />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                <input type="date" name="dataInicio" required className="border p-2 rounded-md w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                <input type="date" name="dataFim" required className="border p-2 rounded-md w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md text-sm font-bold hover:bg-blue-700">Adicionar Período Aquisitivo</button>
          </form>

          <div className="space-y-3">
            {periodos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum período aquisitivo registrado.</p>
            ) : (
              periodos.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.dataInicio} a {p.dataFim}</p>
                    <p className="text-xs text-gray-500">Dias restantes: {p.diasRestantes}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    p.status === 'PENDENTE' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. REGISTRO DE EVENTOS DE AUSÊNCIA */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Clock className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Histórico de Ausências</h2>
          </div>

          <form action={salvarEventoAusencia} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <h3 className="text-sm font-bold text-slate-700 mb-3">Registrar Nova Ausência</h3>
            <input type="hidden" name="servidorId" value={servidorId} />
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Ausência</label>
              <select name="tipoAusencia" required className="border p-2 rounded-md w-full text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
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
                <input type="date" name="dataInicio" required className="border p-2 rounded-md w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fim da Ausência</label>
                <input type="date" name="dataFim" required className="border p-2 rounded-md w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Vincular a Período Aquisitivo (Se Férias)</label>
              <select name="periodoAquisitivoId" className="border p-2 rounded-md w-full text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Não vincular</option>
                {periodos.filter(p => p.status === 'PENDENTE').map(p => (
                  <option key={p.id} value={p.id}>{p.dataInicio} a {p.dataFim}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Observação / Motivo</label>
              <input type="text" name="observacao" className="border p-2 rounded-md w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Opcional" />
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded-md text-sm font-bold hover:bg-slate-800">Registrar Ausência</button>
          </form>

          <div className="space-y-3">
            {ausencias.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhuma ausência registrada.</p>
            ) : (
              ausencias.map((a) => (
                <div key={a.id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-blue-500">
                  <p className="text-sm font-bold text-gray-800">{a.tipoAusencia.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-600 mt-1">Período: {a.dataInicio} até {a.dataFim}</p>
                  {a.observacao && <p className="text-xs text-gray-500 mt-1 italic">Obs: {a.observacao}</p>}
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}