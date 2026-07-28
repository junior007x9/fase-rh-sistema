// Arquivo: app/servidores/[id]/page.tsx
import { db } from "../../../db/index";
import { 
  servidores, dadosPessoais, documentos, enderecos, dadosBancarios, contatosEmergencia,
  historicoFuncional, cargos, lotacoes 
} from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, MapPin, Landmark, PhoneCall, User, Briefcase, History } from "lucide-react";
import { salvarEndereco, salvarContaBancaria, salvarContatoEmergencia } from "../../actions/anexos";
import { alocarServidor } from "../../actions/historico";

export const dynamic = "force-dynamic";

export default async function PerfilServidorPage({ 
  params 
}: { 
  params: Promise<{ id: string }> // Tipagem atualizada para Promise
}) {
  // CORREÇÃO: Aguardando a Promise do Next.js ser resolvida antes de ler o "id"
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;

  // 1. Buscando as informações básicas
  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, servidorId));
  const [endereco] = await db.select().from(enderecos).where(eq(enderecos.servidorId, servidorId));
  const [conta] = await db.select().from(dadosBancarios).where(eq(dadosBancarios.servidorId, servidorId));
  const [emergencia] = await db.select().from(contatosEmergencia).where(eq(contatosEmergencia.servidorId, servidorId));

  // 2. Buscando listas de Cargos e Lotações para o Formulário de Alocação
  const listaCargos = await db.select().from(cargos);
  const listaLotacoes = await db.select().from(lotacoes);

  // 3. Buscando o Histórico Funcional completo deste servidor (JOIN para pegar os nomes ao invés dos IDs)
  const historico = await db
    .select({
      id: historicoFuncional.id,
      dataInicio: historicoFuncional.dataInicio,
      dataFim: historicoFuncional.dataFim,
      observacao: historicoFuncional.observacao,
      cargo: cargos.nome,
      lotacao: lotacoes.nome,
      sigla: lotacoes.sigla
    })
    .from(historicoFuncional)
    .innerJoin(cargos, eq(historicoFuncional.cargoId, cargos.id))
    .innerJoin(lotacoes, eq(historicoFuncional.lotacaoId, lotacoes.id))
    .where(eq(historicoFuncional.servidorId, servidorId))
    .orderBy(desc(historicoFuncional.dataInicio));

  // Identificando a alocação atual (a que não tem data de fim)
  const alocacaoAtual = historico.find(h => !h.dataFim);

  if (!servidorBase || !pessoal) {
    return <div className="p-8 text-center text-red-500 font-bold">Servidor não encontrado.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/servidores" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pessoal.nome}</h1>
            <p className="text-gray-500 flex gap-2 items-center mt-1">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{servidorBase.vinculo}</span>
              <span>CPF: {docs?.cpf}</span>
            </p>
          </div>
        </div>
        
        {/* BOTÃO PARA ACESSAR FÉRIAS E AUSÊNCIAS */}
        <Link 
          href={`/servidores/${servidorId}/ausencias`} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
          Gerenciar Férias e Ausências
        </Link>
      </header>

      {/* SEÇÃO: HISTÓRICO FUNCIONAL (CARGO E LOTAÇÃO) */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <Briefcase className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Alocação Funcional</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário para Alteração/Nova Alocação */}
          <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <History size={16} /> Registrar Nova Alocação
            </h3>
            <form action={alocarServidor} className="space-y-4">
              <input type="hidden" name="servidorId" value={servidorId} />
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cargo *</label>
                <select name="cargoId" required className="w-full border p-2 rounded-md text-sm bg-white">
                  <option value="">Selecione...</option>
                  {listaCargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lotação / Unidade *</label>
                <select name="lotacaoId" required className="w-full border p-2 rounded-md text-sm bg-white">
                  <option value="">Selecione...</option>
                  {listaLotacoes.map(l => <option key={l.id} value={l.id}>{l.nome} ({l.sigla})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data de Início *</label>
                <input type="date" name="dataInicio" required className="w-full border p-2 rounded-md text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observação (Ex: Portaria nº)</label>
                <input type="text" name="observacao" placeholder="Opcional" className="w-full border p-2 rounded-md text-sm" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded-md font-medium text-sm hover:bg-slate-800 transition-colors">
                Salvar Alteração
              </button>
            </form>
          </div>

          {/* Tabela de Histórico (Trilha de Auditoria) */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Alocação Atual:</p>
              {alocacaoAtual ? (
                <p className="text-lg font-bold text-blue-700">
                  {alocacaoAtual.cargo} — {alocacaoAtual.lotacao}
                </p>
              ) : (
                <p className="text-lg font-bold text-red-500">Servidor aguardando alocação inicial</p>
              )}
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-4 font-semibold text-gray-600">Cargo</th>
                    <th className="py-2 px-4 font-semibold text-gray-600">Lotação</th>
                    <th className="py-2 px-4 font-semibold text-gray-600">Início</th>
                    <th className="py-2 px-4 font-semibold text-gray-600">Fim</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 px-4 text-center text-gray-500">Nenhum registro encontrado.</td>
                    </tr>
                  ) : (
                    historico.map((h) => (
                      <tr key={h.id} className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{h.cargo}</td>
                        <td className="py-3 px-4 text-gray-600">{h.lotacao}</td>
                        <td className="py-3 px-4 text-gray-600">{h.dataInicio}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {h.dataFim ? h.dataFim : <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">Atual</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* DEMAIS SEÇÕES (Resumo, Endereço, Conta, Emergência) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RESUMO DOS DADOS PRINCIPAIS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <User className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Resumo do Servidor</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>E-mail:</strong> {pessoal.email}</p>
            <p><strong>Telefone:</strong> {pessoal.telefone}</p>
            <p><strong>Data de Nascimento:</strong> {pessoal.dataNascimento}</p>
            <p><strong>Admissão:</strong> {servidorBase.dataAdmissao}</p>
            <p><strong>Status:</strong> {servidorBase.status}</p>
          </div>
        </section>

        {/* 1. SEÇÃO DE ENDEREÇO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <MapPin className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Endereço</h2>
          </div>
          {endereco ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Logradouro:</strong> {endereco.logradouro}, {endereco.numero}</p>
              <p><strong>Bairro:</strong> {endereco.bairro}</p>
              <p><strong>Cidade/UF:</strong> {endereco.cidade} - {endereco.estado}</p>
              <p><strong>CEP:</strong> {endereco.cep}</p>
            </div>
          ) : (
            <form action={salvarEndereco} className="space-y-3">
              <input type="hidden" name="servidorId" value={servidorId} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="cep" placeholder="CEP *" required className="border p-2 rounded-md w-full text-sm" />
                <input type="text" name="bairro" placeholder="Bairro *" required className="border p-2 rounded-md w-full text-sm" />
              </div>
              <div className="flex gap-3">
                <input type="text" name="logradouro" placeholder="Rua/Av *" required className="border p-2 rounded-md w-full text-sm" />
                <input type="text" name="numero" placeholder="Nº *" required className="border p-2 rounded-md w-32 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="cidade" placeholder="Cidade *" required className="border p-2 rounded-md w-full text-sm" />
                <input type="text" name="estado" placeholder="Estado (ex: MA) *" required className="border p-2 rounded-md w-full text-sm" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md font-medium mt-2 hover:bg-blue-700">Salvar Endereço</button>
            </form>
          )}
        </section>

        {/* 2. SEÇÃO CONTA BANCÁRIA */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Landmark className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Dados Bancários</h2>
          </div>
          {conta ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Banco:</strong> {conta.banco}</p>
              <p><strong>Agência:</strong> {conta.agencia}</p>
              <p><strong>Conta:</strong> {conta.conta}</p>
              <p><strong>Titular:</strong> {conta.nomeTitular}</p>
            </div>
          ) : (
            <form action={salvarContaBancaria} className="space-y-3">
              <input type="hidden" name="servidorId" value={servidorId} />
              <input type="text" name="banco" placeholder="Nome do Banco *" required className="border p-2 rounded-md w-full text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="agencia" placeholder="Agência *" required className="border p-2 rounded-md w-full text-sm" />
                <input type="text" name="conta" placeholder="Conta com Dígito *" required className="border p-2 rounded-md w-full text-sm" />
              </div>
              <input type="text" name="nomeTitular" placeholder="Nome do Titular da Conta *" required className="border p-2 rounded-md w-full text-sm" />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md font-medium mt-2 hover:bg-blue-700">Salvar Conta Bancária</button>
            </form>
          )}
        </section>

        {/* 3. SEÇÃO CONTATO DE EMERGÊNCIA */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <PhoneCall className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Contato de Emergência</h2>
          </div>
          {emergencia ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Nome:</strong> {emergencia.nomeContato}</p>
              <p><strong>Parentesco:</strong> {emergencia.parentesco}</p>
              <p><strong>Telefone:</strong> {emergencia.telefone}</p>
            </div>
          ) : (
            <form action={salvarContatoEmergencia} className="space-y-3">
              <input type="hidden" name="servidorId" value={servidorId} />
              <input type="text" name="nomeContato" placeholder="Nome do Contato *" required className="border p-2 rounded-md w-full text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="parentesco" placeholder="Grau de Parentesco *" required className="border p-2 rounded-md w-full text-sm" />
                <input type="text" name="telefone" placeholder="Telefone *" required className="border p-2 rounded-md w-full text-sm" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md font-medium mt-2 hover:bg-blue-700">Salvar Contato</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}