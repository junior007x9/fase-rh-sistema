// Arquivo: app/ferias/page.tsx
export const dynamic = "force-dynamic";

import { db } from "../../db/index";
import { servidores, dadosPessoais, eventosAusencia } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { CalendarDays, FileWarning, CheckCircle, Pencil, X } from "lucide-react";
import Link from "next/link";
import BotaoExcluir from "../components/BotaoExcluir";
import { registrarAusencia, atualizarAusencia, excluirAusencia } from "../actions/ferias";

export default async function FeriasAusenciasPage({ searchParams }: { searchParams: { editar?: string } }) {
  let listaServidoresAtivos: any[] = [];
  let historicoAusencias: any[] = [];
  let eventoEditando = null;

  try {
    // 1. Busca os servidores ATIVOS para popular o select do formulário
    listaServidoresAtivos = await db
      .select({
        id: servidores.id,
        nome: dadosPessoais.nome,
      })
      .from(servidores)
      .innerJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
      .where(eq(servidores.status, "ATIVO"))
      .orderBy(dadosPessoais.nome);

    // 2. Busca o histórico geral de ausências registradas
    historicoAusencias = await db
      .select({
        id: eventosAusencia.id,
        tipoAusencia: eventosAusencia.tipoAusencia,
        dataInicio: eventosAusencia.dataInicio,
        dataFim: eventosAusencia.dataFim,
        observacao: eventosAusencia.observacao,
        nomeServidor: dadosPessoais.nome,
        servidorId: eventosAusencia.servidorId, // Adicionado para a edição
      })
      .from(eventosAusencia)
      .innerJoin(dadosPessoais, eq(eventosAusencia.servidorId, dadosPessoais.servidorId))
      .orderBy(desc(eventosAusencia.criadoEm));

    // 3. Verifica se estamos no modo de edição
    const idEdicao = searchParams?.editar;
    if (idEdicao) {
      eventoEditando = historicoAusencias.find(e => e.id === idEdicao);
    }
  } catch (error) {
    console.error("Erro ao carregar dados de Férias:", error);
  }

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
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DE REGISTRO / EDIÇÃO */}
        <section className={`lg:col-span-1 p-6 rounded-xl border shadow-sm h-fit transition-colors duration-300 ${eventoEditando ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              {eventoEditando ? <Pencil className="text-amber-600" /> : <CalendarDays className="text-blue-600" />}
              <h2 className={`text-xl font-semibold ${eventoEditando ? 'text-amber-800' : 'text-gray-800'}`}>
                {eventoEditando ? "Editando Evento" : "Registrar Evento"}
              </h2>
            </div>
            {eventoEditando && (
              <Link href="/ferias" className="text-gray-400 hover:text-red-500 transition-colors" title="Cancelar Edição">
                <X size={24} />
              </Link>
            )}
          </div>

          <form action={eventoEditando ? atualizarAusencia : registrarAusencia} className="space-y-4">
            
            {/* Campo oculto com ID se estiver editando */}
            {eventoEditando && <input type="hidden" name="id" value={eventoEditando.id} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servidor *</label>
              <select name="servidorId" defaultValue={eventoEditando?.servidorId || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Selecione um servidor...</option>
                {listaServidoresAtivos.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ausência *</label>
              <select name="tipoAusencia" defaultValue={eventoEditando?.tipoAusencia || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
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
                <input type="date" name="dataInicio" defaultValue={eventoEditando?.dataInicio || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
                <input type="date" name="dataFim" defaultValue={eventoEditando?.dataFim || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações / Processo nº</label>
              <textarea name="observacao" defaultValue={eventoEditando?.observacao || ""} rows={3} placeholder="Detalhes adicionais..." className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>

            <button type="submit" className={`w-full text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-sm ${eventoEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {eventoEditando ? "Salvar Alterações" : "Registrar Ausência"}
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
                  <th className="py-3 px-4 font-semibold text-slate-600 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {historicoAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
                      Nenhuma ausência registrada no sistema.
                    </td>
                  </tr>
                ) : (
                  historicoAusencias.map((evento) => (
                    <tr key={evento.id} className={`border-b border-gray-100 group transition-colors ${eventoEditando?.id === evento.id ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="py-3 px-4 font-medium text-gray-900">{evento.nomeServidor}</td>
                      <td className="py-3 px-4">
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                          {formatarTipoAusencia(evento.tipoAusencia)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{new Date(evento.dataInicio).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(evento.dataFim).toLocaleDateString('pt-BR')}</td>
                      
                      {/* BOTÕES DE AÇÃO */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          
                          {/* Lápis de Edição */}
                          <Link 
                            href={`/ferias?editar=${evento.id}`} 
                            scroll={false}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors shadow-sm"
                            title="Editar Evento"
                          >
                            <Pencil size={16} />
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