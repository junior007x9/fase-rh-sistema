// Arquivo: app/ferias/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais, eventosAusencia } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { CalendarDays, FileWarning, CheckCircle } from "lucide-react";
import { registrarAusencia } from "../actions/ferias";

export const dynamic = "force-dynamic";

export default async function FeriasAusenciasPage() {
  // 1. Busca os servidores ATIVOS para popular o select do formulário
  const listaServidoresAtivos = await db
    .select({
      id: servidores.id,
      nome: dadosPessoais.nome,
    })
    .from(servidores)
    .innerJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .where(eq(servidores.status, "ATIVO"))
    .orderBy(dadosPessoais.nome);

  // 2. Busca o histórico geral de ausências registradas (com JOIN para pegar o nome da pessoa)
  const historicoAusencias = await db
    .select({
      id: eventosAusencia.id,
      tipoAusencia: eventosAusencia.tipoAusencia,
      dataInicio: eventosAusencia.dataInicio,
      dataFim: eventosAusencia.dataFim,
      observacao: eventosAusencia.observacao,
      nomeServidor: dadosPessoais.nome,
    })
    .from(eventosAusencia)
    .innerJoin(dadosPessoais, eq(eventosAusencia.servidorId, dadosPessoais.servidorId))
    .orderBy(desc(eventosAusencia.criadoEm));

  // Função auxiliar para deixar o nome do tipo de ausência mais legível
  const formatarTipoAusencia = (tipo: string) => {
    const tipos: Record<string, string> = {
      FERIAS: "Férias",
      LICENCA_MATERNIDADE: "Licença Maternidade",
      SAUDE: "Licença Saúde",
      LICENCA_PREMIO: "Licença Prêmio",
      AFASTAMENTO_SUPERIOR_15: "Afastamento > 15 dias"
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Férias e Ausências</h1>
        <p className="text-gray-500 mt-1">Gerencie os afastamentos e licenças dos servidores da instituição.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DE REGISTRO */}
        <section className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <CalendarDays className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Registrar Evento</h2>
          </div>

          <form action={registrarAusencia} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servidor *</label>
              <select name="servidorId" required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Selecione um servidor...</option>
                {listaServidoresAtivos.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ausência *</label>
              <select name="tipoAusencia" required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Selecione o tipo...</option>
                <option value="FERIAS">Férias</option>
                <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                <option value="SAUDE">Licença Saúde</option>
                <option value="LICENCA_PREMIO">Licença Prêmio</option>
                <option value="AFASTAMENTO_SUPERIOR_15">Afastamento Superior a 15 dias</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
                <input type="date" name="dataInicio" required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
                <input type="date" name="dataFim" required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Processo nº</label>
              <textarea name="observacao" rows={3} placeholder="Detalhes adicionais..." className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-sm">
              Registrar Ausência
            </button>
          </form>
        </section>

        {/* COLUNA DIREITA: TABELA DE HISTÓRICO */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <FileWarning className="text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Histórico Recente de Afastamentos</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600">Servidor</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Motivo</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Início</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Fim</th>
                </tr>
              </thead>
              <tbody>
                {historicoAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                      Nenhuma ausência registrada no sistema.
                    </td>
                  </tr>
                ) : (
                  historicoAusencias.map((evento) => (
                    <tr key={evento.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{evento.nomeServidor}</td>
                      <td className="py-3 px-4">
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">
                          {formatarTipoAusencia(evento.tipoAusencia)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{evento.dataInicio}</td>
                      <td className="py-3 px-4 text-gray-600">{evento.dataFim}</td>
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