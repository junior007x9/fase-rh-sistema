// Arquivo: app/folha/[id]/page.tsx
import { db } from "../../../db/index";
import { servidores, dadosPessoais, lancamentosFolha } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Trash2, FileText, Sun, AlertOctagon, X, Plane, AlertTriangle } from "lucide-react";
import { EVENTOS_FOLHA } from "../../utils/calculosFolha";
import { adicionarLancamentoFolha, excluirLancamentoFolha, processarFerias, processarRescisao } from "../../actions/folha";
import BotaoImprimirContracheque from "../../../components/BotaoImprimirContracheque";

export const dynamic = "force-dynamic";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default async function FolhaServidorPage({ 
  params, searchParams 
}: { 
  params: Promise<{ id: string }>, searchParams: Promise<{ mesAno: string, modal?: string }> 
}) {
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  const mesAno = resolvedSearchParams.mesAno;
  const modalAberto = resolvedSearchParams.modal;

  if (!mesAno) return <div>Mês/Ano não informado.</div>;

  const [srv] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  if (!srv || !pessoal) return <div>Servidor não encontrado.</div>;

  const salarioBase = srv.remuneracaoBase || 0;

  const lancamentos = await db.select()
    .from(lancamentosFolha)
    .where(and(eq(lancamentosFolha.servidorId, servidorId), eq(lancamentosFolha.mesAno, mesAno)));

  let totalProventos = salarioBase;
  let totalDescontos = 0;
  lancamentos.forEach(lan => {
    if (lan.tipo === "PROVENTO") totalProventos += lan.valorFinal;
    if (lan.tipo === "DESCONTO") totalDescontos += lan.valorFinal;
  });
  const salarioLiquido = totalProventos - totalDescontos;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6 relative">
      
      {/* MODAL: FÉRIAS AUTOMÁTICAS */}
      {modalAberto === 'ferias' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2"><Plane size={20} /><h3 className="font-bold text-lg">Processar Férias</h3></div>
              <Link href={`/folha/${servidorId}?mesAno=${mesAno}`} scroll={false} className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-md"><X size={20} /></Link>
            </div>
            <form action={processarFerias} className="p-6">
              <input type="hidden" name="servidorId" value={servidorId} />
              <input type="hidden" name="mesAno" value={mesAno} />
              
              <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-lg border border-orange-100 mb-6">
                <strong>Automação:</strong> O sistema verificará a data de admissão ({srv.dataAdmissao?.split('-').reverse().join('/')}) e calculará as férias <strong>Integrais</strong> (se &gt;12 meses) ou <strong>Proporcionais em Avos</strong>, inserindo também o 1/3 Constitucional.
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descontar Pensão Alimentícia sobre Férias?</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" name="pensaoPerc" placeholder="0.00" className="w-full border p-3 pl-4 pr-10 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" />
                  <span className="absolute right-4 top-3 text-gray-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Deixe em branco se não houver desconto de pensão.</p>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Link href={`/folha/${servidorId}?mesAno=${mesAno}`} scroll={false} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</Link>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-md">Gerar e Lançar Férias</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESCISÃO */}
      {modalAberto === 'rescisao' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-red-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2"><AlertTriangle size={20} /><h3 className="font-bold text-lg">Processar Rescisão</h3></div>
              <Link href={`/folha/${servidorId}?mesAno=${mesAno}`} scroll={false} className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-md"><X size={20} /></Link>
            </div>
            <form action={processarRescisao} className="p-6 space-y-4">
              <input type="hidden" name="servidorId" value={servidorId} />
              
              <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 mb-2">
                O servidor será <strong>Desligado</strong> no sistema. O Saldo de Salário, 13º Proporcional, Férias, 1/3 e deduções de INSS/IRRF serão calculados automaticamente para o mês da rescisão.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data Exata do Desligamento *</label>
                  <input type="date" name="dataDesligamento" required className="w-full border p-3 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Possui Férias INTEGRAIS pendentes de pagamento?</label>
                  <select name="feriasVencidas" required className="w-full border p-3 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500">
                    <option value="nao">Não, apenas as proporcionais (calculadas sozinhas)</option>
                    <option value="sim">Sim, pagar 1 período de Férias Vencidas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Diferença de Salário?</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 font-bold">R$</span>
                    <input type="number" step="0.01" min="0" name="diferencaSalario" placeholder="0.00" className="w-full border p-3 pl-9 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pensão Alimentícia?</label>
                  <div className="relative">
                    <input type="number" step="0.01" min="0" name="pensaoPerc" placeholder="0.00" className="w-full border p-3 pr-8 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" />
                    <span className="absolute right-3 top-3 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Link href={`/folha/${servidorId}?mesAno=${mesAno}`} scroll={false} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</Link>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-md">Confirmar Rescisão</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CABEÇALHO DA TELA E BOTÕES DE MÓDULOS */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/folha?mesAno=${mesAno}`} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"><ArrowLeft size={20} className="text-gray-700" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lançamentos da Folha</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Servidor: <span className="font-bold text-gray-700">{pessoal.nome}</span> | Competência: <span className="font-bold text-emerald-600">{mesAno}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/folha/${servidorId}?mesAno=${mesAno}&modal=ferias`} scroll={false} className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
            <Sun size={16} /> Gerar Férias
          </Link>
          <Link href={`/folha/${servidorId}?mesAno=${mesAno}&modal=rescisao`} scroll={false} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
            <AlertOctagon size={16} /> Rescisão
          </Link>
          <div className="h-8 w-px bg-gray-300 mx-1"></div>
          <BotaoImprimirContracheque 
            servidor={{ nome: pessoal.nome || "", matricula: srv.matricula, cargo: srv.cargo, lotacao: srv.lotacao }}
            mesAno={mesAno} salarioBase={salarioBase} lancamentos={lancamentos}
            totais={{ proventos: totalProventos, descontos: totalDescontos, liquido: salarioLiquido }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LADO ESQUERDO: FORMULÁRIO DE LANÇAMENTO MANUAL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <PlusCircle size={18} className="text-emerald-600" /> Adicionar Evento Manual
            </h2>
            
            <form action={adicionarLancamentoFolha} className="space-y-4">
              <input type="hidden" name="servidorId" value={servidorId} />
              <input type="hidden" name="mesAno" value={mesAno} />
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Evento *</label>
                <select name="codigoEvento" required className="w-full border p-2.5 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecione...</option>
                  <optgroup label="Proventos (+)">
                    {Object.values(EVENTOS_FOLHA).filter(e => e.tipo === 'PROVENTO').map(e => (
                      <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nome}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Descontos (-)">
                    {Object.values(EVENTOS_FOLHA).filter(e => e.tipo === 'DESCONTO').map(e => (
                      <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nome}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Qtd / Dias</label>
                  <input type="number" step="0.5" min="0" name="quantidade" className="w-full border p-2.5 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" min="0" name="valorManual" className="w-full border p-2.5 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 shadow-sm">
                Lançar na Folha
              </button>
            </form>
          </div>
        </div>

        {/* LADO DIREITO: O CONTRACHEQUE */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden font-sans">
            
            <div className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-800 uppercase tracking-wide">FASE/MA</h2>
                <p className="text-xs text-gray-500 uppercase">Recibo de Pagamento de Salário</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-700">Competência: <span className="text-emerald-700">{mesAno.replace('-', '/')}</span></p>
                <p className="text-xs text-gray-500">Lotação: {srv.lotacao}</p>
              </div>
            </div>

            <div className="p-4 border-b border-gray-300 bg-white grid grid-cols-3 gap-4 text-sm">
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase">Funcionário</p>
                <p className="font-bold text-gray-800">{srv.matricula} - {pessoal.nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Cargo / Função</p>
                <p className="font-semibold text-gray-700">{srv.cargo} {srv.funcao ? `/ ${srv.funcao}` : ''}</p>
              </div>
            </div>

            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-300 text-xs text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-2 w-16 text-center">Cód.</th>
                  <th className="px-4 py-2">Descrição</th>
                  <th className="px-4 py-2 text-center">Ref.</th>
                  <th className="px-4 py-2 text-right text-green-700">Proventos</th>
                  <th className="px-4 py-2 text-right text-red-700">Descontos</th>
                  <th className="px-2 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-500">001</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">Salário Base</td>
                  <td className="px-4 py-3 text-center text-gray-500">30d</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">{formatarMoeda(salarioBase)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">-</td>
                  <td className="px-2 py-3"></td>
                </tr>
                {lancamentos.map(lan => (
                  <tr key={lan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center text-gray-500">{lan.codigoEvento}</td>
                    <td className="px-4 py-3 text-gray-800">{lan.descricaoEvento}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{lan.quantidadeReferencia || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">
                      {lan.tipo === 'PROVENTO' ? formatarMoeda(lan.valorFinal) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-red-700">
                      {lan.tipo === 'DESCONTO' ? formatarMoeda(lan.valorFinal) : '-'}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <form action={async () => { "use server"; await excluirLancamentoFolha(lan.id, servidorId); }}>
                        <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-100 border-t border-gray-300 p-4 grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <p className="text-xs text-gray-500 uppercase mb-1">Total de Proventos</p>
                <p className="font-bold text-green-700 text-lg">{formatarMoeda(totalProventos)}</p>
              </div>
              <div className="col-span-1 border-l border-gray-300 pl-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Total de Descontos</p>
                <p className="font-bold text-red-700 text-lg">{formatarMoeda(totalDescontos)}</p>
              </div>
              <div className="col-span-1 border-l border-gray-300 pl-4 bg-emerald-50 rounded-r-lg -mr-4 -my-4 p-4 border-l-emerald-200">
                <p className="text-xs text-emerald-800 uppercase font-bold mb-1">Valor Líquido a Receber</p>
                <p className="font-black text-emerald-900 text-2xl">{formatarMoeda(salarioLiquido)}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}