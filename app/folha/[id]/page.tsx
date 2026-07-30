// Arquivo: app/folha/[id]/page.tsx
import { db } from "../../../db/index";
import { servidores, dadosPessoais, lancamentosFolha } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Trash2, FileText, Download } from "lucide-react";
import { EVENTOS_FOLHA } from "../../utils/calculosFolha";
import { adicionarLancamentoFolha, excluirLancamentoFolha } from "../../actions/folha";

export const dynamic = "force-dynamic";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default async function FolhaServidorPage({ 
  params, searchParams 
}: { 
  params: Promise<{ id: string }>, searchParams: Promise<{ mesAno: string }> 
}) {
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  const mesAno = resolvedSearchParams.mesAno;

  if (!mesAno) return <div>Mês/Ano não informado.</div>;

  // Busca os dados do Servidor
  const [srv] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  
  if (!srv || !pessoal) return <div>Servidor não encontrado.</div>;

  const salarioBase = srv.remuneracaoBase || 0;

  // Busca todos os lançamentos que já foram feitos neste mês para este servidor
  const lancamentos = await db.select()
    .from(lancamentosFolha)
    .where(and(
      eq(lancamentosFolha.servidorId, servidorId),
      eq(lancamentosFolha.mesAno, mesAno)
    ));

  // ==========================================
  // CÁLCULOS DO CONTRACHEQUE
  // ==========================================
  let totalProventos = salarioBase;
  let totalDescontos = 0;

  lancamentos.forEach(lan => {
    if (lan.tipo === "PROVENTO") totalProventos += lan.valorFinal;
    if (lan.tipo === "DESCONTO") totalDescontos += lan.valorFinal;
  });

  const salarioLiquido = totalProventos - totalDescontos;
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/folha?mesAno=${mesAno}`} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lançamentos da Folha</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Servidor: <span className="font-bold text-gray-700">{pessoal.nome}</span> | Competência: <span className="font-bold text-emerald-600">{mesAno}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LADO ESQUERDO: FORMULÁRIO DE LANÇAMENTO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <PlusCircle size={18} className="text-emerald-600" /> Adicionar Evento
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
                <p className="text-[10px] text-gray-500 mt-1 italic">Para Faltas, o cálculo (Salário/30 * Dias) é automático.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Qtd / Dias</label>
                  <input type="number" step="0.5" min="0" name="quantidade" placeholder="Ex: 2" className="w-full border p-2.5 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" min="0" name="valorManual" placeholder="Ex: 150.00" className="w-full border p-2.5 text-sm rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 shadow-sm">
                Lançar na Folha
              </button>
            </form>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
            <strong>Dica:</strong> Valores informados no campo "Valor (R$)" são aplicados diretamente. Se lançar uma "Falta" informando apenas os "Dias", o sistema calculará o valor exato sozinho!
          </div>
        </div>

        {/* LADO DIREITO: O CONTRACHEQUE (HOLERITE) */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden font-sans">
            
            {/* Cabeçalho do Holerite */}
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

            {/* Dados do Funcionário */}
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

            {/* Tabela de Eventos */}
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
                
                {/* Linha 1: Salário Base Fixo */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-500">001</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">Salário Base</td>
                  <td className="px-4 py-3 text-center text-gray-500">30d</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">{formatarMoeda(salarioBase)}</td>
                  <td className="px-4 py-3 text-right text-gray-400">-</td>
                  <td className="px-2 py-3"></td>
                </tr>

                {/* Linhas Dinâmicas: Lançamentos da Folha */}
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
                      <form action={async () => {
                        "use server";
                        await excluirLancamentoFolha(lan.id, servidorId);
                      }}>
                        <button type="submit" className="text-gray-300 hover:text-red-500 transition-colors" title="Remover evento">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Rodapé de Totais */}
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