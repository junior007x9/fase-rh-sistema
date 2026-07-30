// Arquivo: app/servidores/[id]/page.tsx
import { db } from "../../../db/index";
import { 
  servidores, dadosPessoais, documentos, enderecos, dadosBancarios, contatosEmergencia, dependentesPensionistas 
} from "../../../db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Landmark, PhoneCall, Users, FileWarning, Clock, ShieldAlert, Pencil, X 
} from "lucide-react";
import BotaoExcluir from "../../components/BotaoExcluir";
import { salvarEndereco, atualizarEndereco, excluirEndereco, salvarContaBancaria, atualizarContaBancaria, excluirContaBancaria } from "../../actions/anexos";
import { salvarDependente, atualizarDependente, excluirDependente, registrarDesligamento, atualizarDesligamento, excluirDesligamento } from "../../actions/complementos";

export const dynamic = "force-dynamic";

// Função para calcular automaticamente o Tempo de Casa
function calcularTempoDeCasa(admissao: string, desligamento: string | null) {
  const dataInicio = new Date(admissao);
  const dataFim = desligamento ? new Date(desligamento) : new Date();
  let anos = dataFim.getFullYear() - dataInicio.getFullYear();
  let meses = dataFim.getMonth() - dataInicio.getMonth();
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  if (anos === 0 && meses === 0) return "Menos de 1 mês";
  return `${anos > 0 ? `${anos} ano(s)` : ''} ${meses > 0 ? `e ${meses} mês(es)` : ''}`.trim();
}

export default async function PerfilServidorPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ editarDependente?: string, editarEndereco?: string, editarBanco?: string, editarDesligamento?: string }> 
}) {
  // 1. AWAIT OBRIGATÓRIO EM NEXT.JS 15/16 PARA PARÂMETROS
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;

  const resolvedSearchParams = await searchParams;
  const editarDependenteId = resolvedSearchParams?.editarDependente;
  const editarEndereco = resolvedSearchParams?.editarEndereco === "true";
  const editarBanco = resolvedSearchParams?.editarBanco === "true";
  const editarDesligamento = resolvedSearchParams?.editarDesligamento === "true";

  // Buscando todos os dados relacionados ao servidor
  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, servidorId));
  const [endereco] = await db.select().from(enderecos).where(eq(enderecos.servidorId, servidorId));
  const [banco] = await db.select().from(dadosBancarios).where(eq(dadosBancarios.servidorId, servidorId));
  
  const listaDependentes = await db.select().from(dependentesPensionistas).where(eq(dependentesPensionistas.servidorId, servidorId));

  if (!servidorBase || !pessoal) {
    return <div className="p-8 text-center text-red-500 font-bold">Servidor não encontrado.</div>;
  }

  const tempoCasa = calcularTempoDeCasa(servidorBase.dataAdmissao, servidorBase.dataDesligamento);

  const dependenteEditando = editarDependenteId ? listaDependentes.find(d => d.id === editarDependenteId) : null;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/servidores" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pessoal.nome}</h1>
            <p className="text-gray-500 flex flex-wrap gap-2 items-center mt-1">
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${servidorBase.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {servidorBase.status}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Clock size={12}/> Tempo de Instituição: {tempoCasa}
              </span>
              <span className="text-sm">CPF: {docs?.cpf}</span>
            </p>
          </div>
        </div>
        <Link 
          href={`/servidores/${servidorId}/ausencias`} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
          Gerenciar Férias e Ausências
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA ESQUERDA */}
        <div className="space-y-8">
          
          {/* DEPENDENTES E PENSIONISTAS */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Dependentes e Pensionistas</h2>
              </div>
              {dependenteEditando && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="text-gray-400 hover:text-red-500">
                  <X size={20} />
                </Link>
              )}
            </div>
            
            <form action={dependenteEditando ? atualizarDependente : salvarDependente} className={`mb-6 p-4 rounded-lg border grid grid-cols-2 gap-3 transition-colors ${dependenteEditando ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <input type="hidden" name="servidorId" value={servidorId} />
              {dependenteEditando && <input type="hidden" name="id" value={dependenteEditando.id} />}
              
              <div className="col-span-2">
                <input type="text" name="nome" defaultValue={dependenteEditando?.nome || ""} required placeholder="Nome Completo *" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
              </div>
              <div>
                <select name="tipo" defaultValue={dependenteEditando?.tipo || "DEPENDENTE"} required className="w-full border p-2 text-sm rounded-md bg-white outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="DEPENDENTE">Dependente</option>
                  <option value="PENSIONISTA">Pensionista</option>
                </select>
              </div>
              <div>
                <input type="text" name="parentesco" defaultValue={dependenteEditando?.parentesco || ""} required placeholder="Parentesco *" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
              </div>
              <div className="col-span-2">
                <input type="text" name="documentoReferencia" defaultValue={dependenteEditando?.documentoReferencia || ""} placeholder="Documento (CPF/RG) - Opcional" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
              </div>
              <div className="col-span-2">
                <button type="submit" className={`w-full text-white p-2 rounded-md text-sm font-bold transition-colors ${dependenteEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  {dependenteEditando ? "Salvar Alterações" : "Adicionar Registro"}
                </button>
              </div>
            </form>

            {listaDependentes.map((d) => (
              <div key={d.id} className={`p-3 bg-white border rounded-lg shadow-sm border-l-4 mb-2 flex justify-between items-center group transition-colors ${dependenteEditando?.id === d.id ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 border-l-purple-500 hover:bg-slate-50'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-800">{d.nome}</p>
                  <p className="text-xs text-gray-600 mt-1">{d.tipo} | Parentesco: {d.parentesco}</p>
                  {d.documentoReferencia && <p className="text-xs text-gray-500 mt-1">Doc: {d.documentoReferencia}</p>}
                </div>
                <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Link href={`/servidores/${servidorId}?editarDependente=${d.id}`} scroll={false} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md">
                    <Pencil size={14} />
                  </Link>
                  <BotaoExcluir id={d.id} nomeRegistro={d.nome} acaoExcluir={excluirDependente as any} />
                </div>
              </div>
            ))}
          </section>

          {/* ENDEREÇO RESIDENCIAL */}
          <section className={`p-6 rounded-xl border shadow-sm transition-colors ${editarEndereco ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
             <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Endereço Residencial</h2>
              </div>
              {endereco && !editarEndereco && (
                <div className="flex gap-2">
                  <Link href={`/servidores/${servidorId}?editarEndereco=true`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Pencil size={16} /></Link>
                  <BotaoExcluir id={endereco.id} nomeRegistro="Endereço" acaoExcluir={excluirEndereco as any} />
                </div>
              )}
              {editarEndereco && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="text-gray-400 hover:text-red-500"><X size={20} /></Link>
              )}
            </div>

            {endereco && !editarEndereco ? (
              <div className="text-sm text-gray-700 space-y-2">
                <p><span className="font-semibold">Logradouro:</span> {endereco.logradouro}, {endereco.numero}</p>
                <p><span className="font-semibold">Bairro:</span> {endereco.bairro}</p>
                <p><span className="font-semibold">Cidade/UF:</span> {endereco.cidade} - {endereco.estado}</p>
                <p><span className="font-semibold">CEP:</span> {endereco.cep}</p>
              </div>
            ) : (
              <form action={endereco ? atualizarEndereco : salvarEndereco} className="space-y-3">
                <input type="hidden" name="servidorId" value={servidorId} />
                {endereco && <input type="hidden" name="id" value={endereco.id} />}
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><input type="text" name="logradouro" defaultValue={endereco?.logradouro || ""} placeholder="Rua/Avenida" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                  <div><input type="text" name="numero" defaultValue={endereco?.numero || ""} placeholder="Nº" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><input type="text" name="bairro" defaultValue={endereco?.bairro || ""} placeholder="Bairro" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                  <div><input type="text" name="cep" defaultValue={endereco?.cep || ""} placeholder="CEP" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                </div>
                <div><input type="text" name="cidade" defaultValue={endereco?.cidade || ""} placeholder="Cidade" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                <button type="submit" className={`w-full text-white p-2 rounded-md text-sm font-bold transition-colors ${endereco ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  {endereco ? "Salvar Alterações" : "Salvar Endereço"}
                </button>
              </form>
            )}
          </section>

        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-8">
          
          {/* DESLIGAMENTO INSTITUCIONAL */}
          <section className={`p-6 rounded-xl border shadow-sm transition-colors ${editarDesligamento ? 'bg-amber-50 border-amber-300' : 'bg-white border-red-200'}`}>
            <div className="flex items-center justify-between border-b border-red-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileWarning className="text-red-600" />
                <h2 className="text-xl font-semibold text-gray-800">Desligamento Institucional</h2>
              </div>
              
              {servidorBase.status === 'DESLIGADO' && !editarDesligamento && (
                <div className="flex gap-2">
                  <Link href={`/servidores/${servidorId}?editarDesligamento=true`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Pencil size={16} /></Link>
                  <BotaoExcluir id={servidorId} nomeRegistro="Desligamento (Reativar Servidor)" acaoExcluir={excluirDesligamento as any} />
                </div>
              )}
              {editarDesligamento && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="text-gray-400 hover:text-red-500"><X size={20} /></Link>
              )}
            </div>
            
            {servidorBase.status === 'DESLIGADO' && !editarDesligamento ? (
              <div className="text-sm text-red-800 space-y-2 p-3 bg-red-100/50 rounded-lg border border-red-100">
                <p><span className="font-bold">Data do Desligamento:</span> {servidorBase.dataDesligamento}</p>
                <p><span className="font-bold">Motivo:</span> {servidorBase.motivoDesligamento}</p>
                {servidorBase.numeroProcessoDesligamento && <p><span className="font-bold">Nº Processo:</span> {servidorBase.numeroProcessoDesligamento}</p>}
              </div>
            ) : (
              <form action={editarDesligamento ? atualizarDesligamento : registrarDesligamento} className="space-y-3">
                <input type="hidden" name="servidorId" value={servidorId} />
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Data do Desligamento *</label>
                  <input type="date" name="dataDesligamento" defaultValue={servidorBase?.dataDesligamento || ""} required className="w-full border p-2 text-sm rounded-md outline-none bg-white focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Motivo *</label>
                  <textarea name="motivoDesligamento" defaultValue={servidorBase?.motivoDesligamento || ""} required rows={2} placeholder="Ex: Fim do contrato, pedido de demissão, etc." className="w-full border p-2 text-sm rounded-md outline-none bg-white focus:ring-2 focus:ring-red-500"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Número do Processo (Opcional)</label>
                  <input type="text" name="numeroProcessoDesligamento" defaultValue={servidorBase?.numeroProcessoDesligamento || ""} placeholder="Ex: 2026/00123" className="w-full border p-2 text-sm rounded-md outline-none bg-white focus:ring-2 focus:ring-red-500" />
                </div>
                <button type="submit" className={`w-full text-white p-2 rounded-md text-sm font-bold flex justify-center items-center gap-2 transition-colors ${editarDesligamento ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {editarDesligamento ? "Salvar Correção" : <><ShieldAlert size={16} /> Confirmar Desligamento</>}
                </button>
              </form>
            )}
          </section>

          {/* DADOS BANCÁRIOS */}
          <section className={`p-6 rounded-xl border shadow-sm transition-colors ${editarBanco ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Landmark className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Dados Bancários</h2>
              </div>
              {banco && !editarBanco && (
                <div className="flex gap-2">
                  <Link href={`/servidores/${servidorId}?editarBanco=true`} scroll={false} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Pencil size={16} /></Link>
                  <BotaoExcluir id={banco.id} nomeRegistro="Conta Bancária" acaoExcluir={excluirContaBancaria as any} />
                </div>
              )}
              {editarBanco && (
                <Link href={`/servidores/${servidorId}`} scroll={false} className="text-gray-400 hover:text-red-500"><X size={20} /></Link>
              )}
            </div>
            
            {banco && !editarBanco ? (
               <div className="text-sm text-gray-700 space-y-2">
                <p><span className="font-semibold">Titular:</span> {banco.nomeTitular}</p>
                <p><span className="font-semibold">Banco:</span> {banco.banco}</p>
                <p><span className="font-semibold">Agência/Conta:</span> {banco.agencia} / {banco.conta}</p>
              </div>
            ) : (
              <form action={banco ? atualizarContaBancaria : salvarContaBancaria} className="space-y-3">
                <input type="hidden" name="servidorId" value={servidorId} />
                {banco && <input type="hidden" name="id" value={banco.id} />}
                
                <div><input type="text" name="nomeTitular" defaultValue={banco?.nomeTitular || ""} placeholder="Nome Completo do Titular" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1"><input type="text" name="banco" defaultValue={banco?.banco || ""} placeholder="Banco" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                  <div className="col-span-1"><input type="text" name="agencia" defaultValue={banco?.agencia || ""} placeholder="Agência" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                  <div className="col-span-1"><input type="text" name="conta" defaultValue={banco?.conta || ""} placeholder="Conta" required className="w-full border p-2 text-sm rounded-md outline-none bg-white" /></div>
                </div>
                <button type="submit" className={`w-full text-white p-2 rounded-md text-sm font-bold transition-colors ${banco ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  {banco ? "Salvar Alterações" : "Salvar Dados Bancários"}
                </button>
              </form>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}