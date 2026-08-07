// Arquivo: app/servidores/[id]/page.tsx 

import { db } from "../../../db/index";
import { 
  servidores, dadosPessoais, documentos, enderecos, dadosBancarios, 
  dependentesPensionistas, historicoTransferencias, lotacoes, periodosAquisitivos, lancamentosFolha 
} from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Landmark, Users, FileWarning, Clock, ShieldAlert, 
  Pencil, X, Briefcase, DollarSign, ArrowRightLeft, History, User
} from "lucide-react";
import BotaoExcluir from "../../components/BotaoExcluir";
import BotaoImprimirFicha from "../../components/BotaoImprimirFicha";
import BotaoDeclaracaoVinculo from "../../components/BotaoDeclaracaoVinculo";
import BotaoTermoDesligamento from "../../components/BotaoTermoDesligamento";
import { salvarEndereco, atualizarEndereco, excluirEndereco, salvarContaBancaria, atualizarContaBancaria, excluirContaBancaria } from "../../actions/anexos";
import { salvarDependente, atualizarDependente, excluirDependente, registrarDesligamento, atualizarDesligamento, excluirDesligamento } from "../../actions/complementos";
import { registrarTransferencia } from "../../actions/folha";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarMoedaExibicao, formatarDataExibicao, calcularTempoDeCasa } from "../../utils/formatters";

export const dynamic = "force-dynamic";

export default async function PerfilServidorPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ editarDependente?: string, editarEndereco?: string, editarBanco?: string, editarDesligamento?: string, novaTransferencia?: string }> 
}) {
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;

  const resolvedSearchParams = await searchParams;
  const editarDependenteId = resolvedSearchParams?.editarDependente;
  const editarEndereco = resolvedSearchParams?.editarEndereco === "true";
  const editarBanco = resolvedSearchParams?.editarBanco === "true";
  const editarDesligamento = resolvedSearchParams?.editarDesligamento === "true";
  const abrirTransferencia = resolvedSearchParams?.novaTransferencia === "true";

  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, servidorId));
  const [endereco] = await db.select().from(enderecos).where(eq(enderecos.servidorId, servidorId));
  const [banco] = await db.select().from(dadosBancarios).where(eq(dadosBancarios.servidorId, servidorId));
  
  const listaDependentes = await db.select().from(dependentesPensionistas).where(eq(dependentesPensionistas.servidorId, servidorId));
  
  // SEGURANÇA: Busca lotações da tabela oficial ou extrai dos servidores se estiver vazia
  let listaLotacoes = await db.select().from(lotacoes);
  if (listaLotacoes.length === 0) {
    const todosServidoresLotacao = await db.select({ lotacao: servidores.lotacao }).from(servidores);
    const lotacoesUnicas = Array.from(new Set(todosServidoresLotacao.map(s => s.lotacao).filter(Boolean))) as string[];
    listaLotacoes = lotacoesUnicas.map((nome, index) => ({ 
      id: String(index), 
      nome, 
      sigla: "", 
      criadoEm: null 
    }));
  }
  
  const historicoMovimentacoes = await db.select()
    .from(historicoTransferencias)
    .where(eq(historicoTransferencias.servidorId, servidorId))
    .orderBy(desc(historicoTransferencias.dataOcorrencia));

  // Busca dados de Férias e Rescisão para os relatórios
  const ferias = await db.select()
    .from(periodosAquisitivos)
    .where(eq(periodosAquisitivos.servidorId, servidorId));

  let folhaRescisao: any[] = [];
  if (servidorBase && servidorBase.status === 'DESLIGADO' && servidorBase.dataDesligamento) {
    const parts = servidorBase.dataDesligamento.split('-');
    if (parts.length === 3) {
      const [ano, mes] = parts;
      folhaRescisao = await db.select().from(lancamentosFolha)
        .where(and(eq(lancamentosFolha.servidorId, servidorId), eq(lancamentosFolha.mesAno, `${mes}-${ano}`)));
    }
  }

  if (!servidorBase || !pessoal) {
    return <div className="p-8 text-center text-red-500 font-bold">Servidor não encontrado.</div>;
  }

  // Usando a nossa Central de Formatação
  const tempoCasa = calcularTempoDeCasa(servidorBase.dataAdmissao, servidorBase.dataDesligamento);
  const dependenteEditando = editarDependenteId ? listaDependentes.find(d => d.id === editarDependenteId) : null;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 relative animate-in fade-in duration-500">
      
      {/* MODAL DE TRANSFERÊNCIA */}
      {abrirTransferencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={22} />
                <h3 className="font-extrabold text-lg">Transferir Lotação</h3>
              </div>
              <Link href={`/servidores/${servidorId}`} scroll={false} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                <X size={20} />
              </Link>
            </div>
            
            <form action={registrarTransferencia} className="p-6 sm:p-8 space-y-6">
              <input type="hidden" name="servidorId" value={servidorId} />
              <input type="hidden" name="lotacaoAnterior" value={servidorBase.lotacao || ""} />
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Briefcase size={20}/></div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-blue-600/70 tracking-wider">Lotação Atual</span>
                  <span className="font-bold text-sm">{servidorBase.lotacao || "Nenhuma lotação informada"}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nova Lotação (Para onde vai?) *</label>
                  <select name="lotacaoNova" required className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700">
                    <option value="">Selecione o novo setor...</option>
                    {listaLotacoes.map((l) => (
                      <option key={l.id} value={l.nome}>{l.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data da Transferência *</label>
                  <input type="date" name="dataOcorrencia" required className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Motivo / Documento (Opcional)</label>
                  <input type="text" name="motivo" placeholder="Ex: Portaria Nº 123/2026..." className="w-full border border-slate-200 p-3 text-sm rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-700" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Link href={`/servidores/${servidorId}`} scroll={false} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center">
                  Cancelar
                </Link>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
                  <ArrowRightLeft size={18} /> Efetivar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* CABEÇALHO DO PERFIL */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-6 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/servidores" className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-colors hidden sm:block">
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>
          
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0 shadow-inner">
            {pessoal.nome ? pessoal.nome.charAt(0).toUpperCase() : 'S'}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{pessoal.nome}</h1>
            <div className="flex flex-wrap gap-2 items-center mt-1.5">
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md border ${servidorBase.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {servidorBase.status}
              </span>
              <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
                <Clock size={12}/> {tempoCasa}
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Matrícula: {servidorBase.matricula || "Pendente"}
              </span>
              <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                {servidorBase.cargo || "Sem cargo"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <BotaoImprimirFicha servidor={servidorBase} pessoal={pessoal} ferias={ferias} />
          <BotaoDeclaracaoVinculo servidor={servidorBase} pessoal={pessoal} historico={historicoMovimentacoes} />
          
          {servidorBase.status === 'DESLIGADO' && (
            <BotaoTermoDesligamento servidor={servidorBase} pessoal={pessoal} folhaRescisao={folhaRescisao} />
          )}

          <Link 
            href={`/servidores/${servidorId}?novaTransferencia=true`} 
            scroll={false}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <ArrowRightLeft size={16} /> Transferir
          </Link>
          <Link 
            href={`/servidores/${servidorId}/ausencias`} 
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex-1 md:flex-none text-center"
          >
            Férias
          </Link>
        </div>
      </header>

      {/* CORPO DO PERFIL - 2 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* COLUNA ESQUERDA */}
        <div className="space-y-6 lg:space-y-8">

          {/* VÍNCULO INSTITUCIONAL E FOLHA */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800">Vínculo e Base Salarial</h2>
              </div>
              <Link href={`/servidores/${servidorId}/editar`} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <Pencil size={14} /> Editar
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm text-slate-700">
              <div><span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Matrícula</span>{servidorBase.matricula || "Não gerada"}</div>
              <div><span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Tipo de Vínculo</span>{servidorBase.vinculo}</div>
              
              <div className="col-span-2"><span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Cargo Efetivo / Contratado</span><span className="font-medium">{servidorBase.cargo || "Não informado"}</span></div>
              
              <div><span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Lotação Atual</span>{servidorBase.lotacao || "Não informada"}</div>
              <div><span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Data de Admissão</span>{formatarDataExibicao(servidorBase.dataAdmissao) || "Não informada"}</div>
              
              <div className="col-span-2 border-t border-slate-100 pt-5 mt-1 grid grid-cols-2 gap-5">
                <div className="col-span-2"><span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Função (Comissionada/Gratificada)</span>
                  {servidorBase.funcao ? (
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-xs border border-amber-200">{servidorBase.funcao}</span>
                  ) : "Nenhuma função gratificada registrada"}
                </div>
                <div>
                  <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/> Jornada</span>
                  <span className="font-medium">{servidorBase.jornada || "Não informada"}</span>
                </div>
                <div>
                  <span className="font-bold block text-[10px] text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><DollarSign size={12}/> Remuneração Base</span>
                  <span className="text-lg font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 block w-fit">{formatarMoedaExibicao(servidorBase.remuneracaoBase)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* HISTÓRICO DE TRANSFERÊNCIAS */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><History size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Histórico de Movimentações</h2>
            </div>

            <div className="space-y-4 relative">
              {historicoMovimentacoes.length === 0 ? (
                <div className="text-sm text-slate-500 font-medium text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhuma transferência registrada no histórico.
                </div>
              ) : (
                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>
              )}

              {historicoMovimentacoes.map((mov) => (
                <div key={mov.id} className="relative z-10 flex gap-4 items-start">
                  <div className="mt-1 w-7 h-7 rounded-full bg-blue-50 border-[3px] border-white flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-slate-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1 shadow-sm hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-slate-800">{mov.lotacaoNova}</p>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                        {formatarDataExibicao(mov.dataOcorrencia)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mr-1">Saiu de:</span> 
                      {mov.lotacaoAnterior || "Registro Inicial"}
                    </p>
                    {mov.motivo && <p className="text-xs text-slate-500 mt-2 p-2 bg-white rounded-md border border-slate-100 italic">"{mov.motivo}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DEPENDENTES E PENSIONISTAS */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800">Dependentes e Pensionistas</h2>
              </div>
              {dependenteEditando && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg transition-colors">
                  <X size={18} />
                </Link>
              )}
            </div>
            
            <form action={dependenteEditando ? atualizarDependente : salvarDependente} className={`mb-6 p-5 rounded-xl border grid grid-cols-2 gap-4 transition-all ${dependenteEditando ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
              <input type="hidden" name="servidorId" value={servidorId} />
              {dependenteEditando && <input type="hidden" name="id" value={dependenteEditando.id} />}
              
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome Completo *</label>
                <input type="text" name="nome" defaultValue={dependenteEditando?.nome || ""} required className="w-full border border-slate-200 p-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-700" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo *</label>
                <select name="tipo" defaultValue={dependenteEditando?.tipo || "DEPENDENTE"} required className="w-full border border-slate-200 p-2.5 text-sm rounded-lg bg-white outline-none focus:ring-2 focus:ring-purple-500 text-slate-700">
                  <option value="DEPENDENTE">Dependente</option>
                  <option value="PENSIONISTA">Pensionista</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Parentesco *</label>
                <input type="text" name="parentesco" defaultValue={dependenteEditando?.parentesco || ""} required placeholder="Ex: Filho(a)" className="w-full border border-slate-200 p-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-700" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Documento (CPF/RG) - Opcional</label>
                <input type="text" name="documentoReferencia" defaultValue={dependenteEditando?.documentoReferencia || ""} className="w-full border border-slate-200 p-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-700" />
              </div>
              <div className="col-span-2 pt-2">
                <button type="submit" className={`w-full text-white p-3 rounded-xl text-sm font-bold transition-all shadow-md ${dependenteEditando ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'}`}>
                  {dependenteEditando ? "Salvar Alterações do Dependente" : "Adicionar Novo Registro"}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {listaDependentes.map((d) => (
                <div key={d.id} className={`p-4 bg-white border rounded-xl shadow-sm border-l-4 flex justify-between items-center group transition-all ${dependenteEditando?.id === d.id ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 border-l-purple-500 hover:shadow-md hover:border-slate-300'}`}>
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <User size={14} className="text-slate-400"/> {d.nome}
                    </p>
                    <div className="flex gap-2 items-center mt-1.5">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{d.tipo}</span>
                      <span className="text-xs font-medium text-slate-500 border-l border-slate-200 pl-2">Parentesco: {d.parentesco}</span>
                    </div>
                    {d.documentoReferencia && <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-1.5 rounded border border-slate-100 inline-block">Doc: {d.documentoReferencia}</p>}
                  </div>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link href={`/servidores/${servidorId}?editarDependente=${d.id}`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </Link>
                    <BotaoExcluir id={d.id} nomeRegistro={d.nome} acaoExcluir={excluirDependente as any} />
                  </div>
                </div>
              ))}
              {listaDependentes.length === 0 && !dependenteEditando && (
                <p className="text-sm text-slate-400 text-center py-2 italic">Nenhum dependente ou pensionista registrado.</p>
              )}
            </div>
          </section>

        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* ENDEREÇO RESIDENCIAL */}
          <section className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all ${editarEndereco ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
             <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MapPin size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800">Endereço Residencial</h2>
              </div>
              {endereco && !editarEndereco && (
                <div className="flex gap-2">
                  <Link href={`/servidores/${servidorId}?editarEndereco=true`} scroll={false} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={18} /></Link>
                  <BotaoExcluir id={endereco.id} nomeRegistro="Endereço" acaoExcluir={excluirEndereco as any} />
                </div>
              )}
              {editarEndereco && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200"><X size={18} /></Link>
              )}
            </div>

            {endereco && !editarEndereco ? (
              <div className="text-sm text-slate-700 space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <p className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Logradouro</span> <span className="font-semibold text-right">{endereco.logradouro}, {endereco.numero}</span></p>
                <p className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Bairro</span> <span className="font-semibold text-right">{endereco.bairro}</span></p>
                <p className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Cidade/UF</span> <span className="font-semibold text-right">{endereco.cidade} - {endereco.estado}</span></p>
                <p className="flex justify-between items-end"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">CEP</span> <span className="font-semibold text-right">{endereco.cep}</span></p>
              </div>
            ) : (
              <form action={endereco ? atualizarEndereco : salvarEndereco} className="space-y-4">
                <input type="hidden" name="servidorId" value={servidorId} />
                {endereco && <input type="hidden" name="id" value={endereco.id} />}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Rua / Avenida *</label>
                    <input type="text" name="logradouro" defaultValue={endereco?.logradouro || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nº *</label>
                    <input type="text" name="numero" defaultValue={endereco?.numero || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Bairro *</label>
                    <input type="text" name="bairro" defaultValue={endereco?.bairro || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">CEP *</label>
                    <input type="text" name="cep" defaultValue={endereco?.cep || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cidade *</label>
                  <input type="text" name="cidade" defaultValue={endereco?.cidade || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500 text-slate-700" />
                </div>
                <div className="pt-2">
                  <button type="submit" className={`w-full text-white p-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${endereco ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
                    {endereco ? "Salvar Alterações de Endereço" : "Salvar Endereço Completo"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* DADOS BANCÁRIOS */}
          <section className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all ${editarBanco ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Landmark size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800">Dados Bancários</h2>
              </div>
              {banco && !editarBanco && (
                <div className="flex gap-2">
                  <Link href={`/servidores/${servidorId}?editarBanco=true`} scroll={false} className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Pencil size={18} /></Link>
                  <BotaoExcluir id={banco.id} nomeRegistro="Conta Bancária" acaoExcluir={excluirContaBancaria as any} />
                </div>
              )}
              {editarBanco && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200"><X size={18} /></Link>
              )}
            </div>
            
            {banco && !editarBanco ? (
               <div className="text-sm text-slate-700 space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <p className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Titular</span> <span className="font-semibold text-right">{banco.nomeTitular}</span></p>
                <p className="flex justify-between items-end border-b border-slate-200 pb-2"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Instituição Bancária</span> <span className="font-semibold text-right">{banco.banco}</span></p>
                <p className="flex justify-between items-end"><span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Agência / Conta</span> <span className="font-semibold text-right">{banco.agencia} / {banco.conta}</span></p>
              </div>
            ) : (
              <form action={banco ? atualizarContaBancaria : salvarContaBancaria} className="space-y-4">
                <input type="hidden" name="servidorId" value={servidorId} />
                {banco && <input type="hidden" name="id" value={banco.id} />}
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome do Titular da Conta *</label>
                  <input type="text" name="nomeTitular" defaultValue={banco?.nomeTitular || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Banco *</label>
                    <input type="text" name="banco" defaultValue={banco?.banco || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Agência *</label>
                    <input type="text" name="agencia" defaultValue={banco?.agencia || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Conta *</label>
                    <input type="text" name="conta" defaultValue={banco?.conta || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700" />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" className={`w-full text-white p-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${banco ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}>
                    {banco ? "Salvar Alterações Bancárias" : "Salvar Dados Bancários"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* DESLIGAMENTO INSTITUCIONAL */}
          <section className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all ${editarDesligamento ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-red-200'}`}>
            <div className="flex items-center justify-between border-b border-red-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-600"><FileWarning size={20} /></div>
                <h2 className="text-xl font-bold text-slate-800">Desligamento Institucional</h2>
              </div>
              
              {servidorBase.status === 'DESLIGADO' && !editarDesligamento && (
                <div className="flex gap-2">
                  <Link href={`/servidores/${servidorId}?editarDesligamento=true`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Pencil size={18} /></Link>
                  <BotaoExcluir id={servidorId} nomeRegistro="Desligamento (Reativar Servidor)" acaoExcluir={excluirDesligamento as any} />
                </div>
              )}
              {editarDesligamento && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200"><X size={18} /></Link>
              )}
            </div>
            
            {servidorBase.status === 'DESLIGADO' && !editarDesligamento ? (
              <div className="text-sm text-red-800 space-y-3 p-5 bg-red-50 rounded-xl border border-red-100">
                <p className="flex justify-between items-end border-b border-red-200/50 pb-2"><span className="font-bold text-[10px] text-red-500/80 uppercase tracking-widest">Data do Desligamento</span> <span className="font-extrabold text-right">{formatarDataExibicao(servidorBase.dataDesligamento)}</span></p>
                <p className="flex justify-between items-end border-b border-red-200/50 pb-2"><span className="font-bold text-[10px] text-red-500/80 uppercase tracking-widest">Motivo</span> <span className="font-semibold text-right">{servidorBase.motivoDesligamento}</span></p>
                {servidorBase.numeroProcessoDesligamento && <p className="flex justify-between items-end"><span className="font-bold text-[10px] text-red-500/80 uppercase tracking-widest">Nº Processo</span> <span className="font-semibold text-right">{servidorBase.numeroProcessoDesligamento}</span></p>}
              </div>
            ) : (
              <form action={editarDesligamento ? atualizarDesligamento : registrarDesligamento} className="space-y-4">
                <input type="hidden" name="servidorId" value={servidorId} />
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data Exata do Desligamento *</label>
                  <input type="date" name="dataDesligamento" defaultValue={servidorBase?.dataDesligamento || ""} required className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-slate-50 focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-slate-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Motivo do Desligamento *</label>
                  <textarea name="motivoDesligamento" defaultValue={servidorBase?.motivoDesligamento || ""} required rows={3} placeholder="Ex: Fim do contrato, pedido de demissão, etc." className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-slate-50 focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-slate-700 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Número do Processo (Opcional)</label>
                  <input type="text" name="numeroProcessoDesligamento" defaultValue={servidorBase?.numeroProcessoDesligamento || ""} placeholder="Ex: 2026/00123" className="w-full border border-slate-200 p-3 text-sm rounded-xl outline-none bg-slate-50 focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors text-slate-700" />
                </div>
                <div className="pt-2">
                  <button type="submit" className={`w-full text-white p-3.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all shadow-md ${editarDesligamento ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}>
                    {editarDesligamento ? "Salvar Correção" : <><ShieldAlert size={18} /> Confirmar Desligamento</>}
                  </button>
                </div>
              </form>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}