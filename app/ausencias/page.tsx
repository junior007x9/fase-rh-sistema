// Arquivo: app/ausencias/page.tsx
export const dynamic = 'force-dynamic';

import { db } from "../../db/index";
import { eventosAusencia, dadosPessoais } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { Clock, PlusCircle, Pencil, X, Info } from "lucide-react";
import BotaoExcluir from "../components/BotaoExcluir";
import Link from "next/link";
import { salvarEventoAusencia, excluirAusencia, atualizarAusencia } from "../actions/ausencias";

export default async function AusenciasPage({ searchParams }: { searchParams: Promise<{ editar?: string }> }) {
  const resolvedSearchParams = await searchParams;
  let listaAusencias: any[] = [];
  let listaServidores: any[] = [];
  let ausenciaEditando = null;

  try {
    listaServidores = await db.select().from(dadosPessoais);
    
    listaAusencias = await db
      .select({
        id: eventosAusencia.id,
        tipo: eventosAusencia.tipoAusencia,
        inicio: eventosAusencia.dataInicio,
        fim: eventosAusencia.dataFim,
        dias: eventosAusencia.dias, // NOVO
        cid: eventosAusencia.cid,   // NOVO
        motivo: eventosAusencia.observacao,
        servidorNome: dadosPessoais.nome,
        servidorId: eventosAusencia.servidorId,
      })
      .from(eventosAusencia)
      .leftJoin(dadosPessoais, eq(eventosAusencia.servidorId, dadosPessoais.servidorId))
      .orderBy(desc(eventosAusencia.dataInicio)); // Ordenação cronológica pela data de início

    const idEdicao = resolvedSearchParams?.editar;
    if (idEdicao) {
      ausenciaEditando = listaAusencias.find(a => a.id === idEdicao);
    }
  } catch (error) {
    console.error("Erro ao carregar ausências:", error);
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> Ausências e Licenças
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerenciamento de afastamentos, licenças médicas e premiações.</p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <div className={`p-6 rounded-2xl shadow-sm border h-fit transition-colors duration-300 ${ausenciaEditando ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${ausenciaEditando ? 'text-amber-800' : 'text-slate-800'}`}>
              {ausenciaEditando ? <Pencil size={20} className="text-amber-600" /> : <PlusCircle size={20} className="text-blue-600" />}
              {ausenciaEditando ? "Editando Afastamento" : "Registrar Afastamento"}
            </h2>
            {ausenciaEditando && (
              <Link href="/ausencias" className="text-slate-400 hover:text-red-500 transition-colors" title="Cancelar Edição">
                <X size={24} />
              </Link>
            )}
          </div>
          
          <form action={ausenciaEditando ? atualizarAusencia : salvarEventoAusencia} className="space-y-4">
            {ausenciaEditando && <input type="hidden" name="id" value={ausenciaEditando.id} />}

            {/* AVISO DA REGRA DE NEGÓCIO */}
            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>Ao selecionar <strong>Licença Saúde</strong>, informe apenas a <em>Data Início</em> e os <em>Dias</em>. Se passar de 15 dias, o sistema mudará para INSS automaticamente.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servidor</label>
              <select name="servidorId" defaultValue={ausenciaEditando?.servidorId || ""} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione o servidor...</option>
                {listaServidores.map((serv: any) => (
                  <option key={serv.servidorId} value={serv.servidorId}>{serv.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ausência</label>
              <select name="tipoAusencia" defaultValue={ausenciaEditando?.tipo || "SAUDE"} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="SAUDE">Licença Saúde / Médica (Atestados)</option>
                <option value="LICENCA_PREMIO">Licença Prêmio</option>
                <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                <option value="FERIAS">Férias</option>
                <option value="AFASTAMENTO_SUPERIOR_15">Afastamento Superior a 15 Dias (INSS)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                <input type="date" name="dataInicio" defaultValue={ausenciaEditando?.inicio || ""} required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                {/* SUBSTITUÍMOS DATA FIM POR QUANTIDADE DE DIAS */}
                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Dias</label>
                <input type="number" name="dias" min="1" defaultValue={ausenciaEditando?.dias || ""} required placeholder="Ex: 5" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código CID (Opcional)</label>
              <input type="text" name="cid" defaultValue={ausenciaEditando?.cid || ""} placeholder="Ex: J00, M54" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white uppercase" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observações</label>
              <textarea name="observacao" defaultValue={ausenciaEditando?.motivo || ""} rows={2} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Detalhes da clínica ou afastamento..."></textarea>
            </div>

            <button type="submit" className={`w-full text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm cursor-pointer ${ausenciaEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {ausenciaEditando ? "Salvar Alterações" : "Salvar Registro"}
            </button>
          </form>
        </div>

        {/* COLUNA 2: TABELA DE REGISTROS (Ordem Cronológica) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Histórico Cronológico de Afastamentos</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Servidor</th>
                  <th className="pb-3 font-semibold">Afastamento</th>
                  <th className="pb-3 font-semibold">Período</th>
                  <th className="pb-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {listaAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Nenhum afastamento registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  listaAusencias.map((item: any) => {
                    const isInss = item.tipo === "AFASTAMENTO_SUPERIOR_15";
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50 group transition-colors ${ausenciaEditando?.id === item.id ? 'bg-amber-50/50' : ''}`}>
                        
                        <td className="py-3 font-medium text-slate-800">
                          {item.servidorNome || "Desconhecido"}
                          {item.cid && <span className="block text-[10px] text-gray-400 uppercase mt-0.5 font-bold">CID: {item.cid}</span>}
                        </td>
                        
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${isInss ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {isInss ? 'Não Remunerado (INSS)' : 'Remunerado (Até 15d)'}
                          </span>
                          <span className="block text-[10px] text-gray-500 mt-1">{item.tipo}</span>
                        </td>
                        
                        <td className="py-3 text-xs text-gray-600">
                          {item.inicio.split('-').reverse().join('/')} até {item.fim.split('-').reverse().join('/')}
                          <strong className="block text-gray-800 mt-0.5">{item.dias} dias</strong>
                        </td>
                        
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/ausencias?editar=${item.id}`} 
                              scroll={false}
                              className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors shadow-sm"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </Link>
                            <BotaoExcluir 
                              id={item.id} 
                              nomeRegistro={`${item.servidorNome || 'Desconhecido'} (${item.tipo})`} 
                              acaoExcluir={excluirAusencia as any} 
                            />
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}