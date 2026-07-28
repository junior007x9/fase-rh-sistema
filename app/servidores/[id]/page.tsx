// Arquivo: app/servidores/[id]/page.tsx
import { db } from "../../../db/index";
import { 
  servidores, dadosPessoais, documentos, enderecos, dadosBancarios, contatosEmergencia, dependentesPensionistas 
} from "../../../db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Landmark, PhoneCall, Users, FileWarning, Clock, ShieldAlert 
} from "lucide-react";
import { salvarEndereco, salvarContaBancaria, salvarContatoEmergencia } from "../../actions/anexos";
import { salvarDependente, registrarDesligamento } from "../../actions/complementos";

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

export default async function PerfilServidorPage({ params }: { params: { id: string } }) {
  const servidorId = params.id;

  // Buscando todos os dados relacionados ao servidor
  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, servidorId));
  const [endereco] = await db.select().from(enderecos).where(eq(enderecos.servidorId, servidorId));
  const [banco] = await db.select().from(dadosBancarios).where(eq(dadosBancarios.servidorId, servidorId));
  
  const listaEmergencia = await db.select().from(contatosEmergencia).where(eq(contatosEmergencia.servidorId, servidorId));
  const listaDependentes = await db.select().from(dependentesPensionistas).where(eq(dependentesPensionistas.servidorId, servidorId));

  if (!servidorBase || !pessoal) {
    return <div className="p-8 text-center text-red-500 font-bold">Servidor não encontrado.</div>;
  }

  const tempoCasa = calcularTempoDeCasa(servidorBase.dataAdmissao, servidorBase.dataDesligamento);

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
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <Users className="text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Dependentes e Pensionistas</h2>
            </div>
            
            <form action={salvarDependente} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
              <input type="hidden" name="servidorId" value={servidorId} />
              <div className="col-span-2"><input type="text" name="nome" required placeholder="Nome Completo *" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div>
                <select name="tipo" required className="w-full border p-2 text-sm rounded-md bg-white outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="DEPENDENTE">Dependente</option>
                  <option value="PENSIONISTA">Pensionista</option>
                </select>
              </div>
              <div><input type="text" name="parentesco" required placeholder="Parentesco *" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div className="col-span-2"><input type="text" name="documentoReferencia" placeholder="Documento (CPF/RG) - Opcional" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-purple-500" /></div>
              <div className="col-span-2"><button type="submit" className="w-full bg-purple-600 text-white p-2 rounded-md text-sm font-bold hover:bg-purple-700">Adicionar Registro</button></div>
            </form>

            {listaDependentes.map((d) => (
              <div key={d.id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-purple-500 mb-2">
                <p className="text-sm font-bold text-gray-800">{d.nome}</p>
                <p className="text-xs text-gray-600 mt-1">{d.tipo} | Parentesco: {d.parentesco}</p>
                {d.documentoReferencia && <p className="text-xs text-gray-500 mt-1">Doc: {d.documentoReferencia}</p>}
              </div>
            ))}
          </section>

          {/* ENDEREÇO (Mantido do anterior) */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <MapPin className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Endereço Residencial</h2>
            </div>
            {endereco ? (
              <div className="text-sm text-gray-700 space-y-2">
                <p><span className="font-semibold">Logradouro:</span> {endereco.logradouro}, {endereco.numero}</p>
                <p><span className="font-semibold">Bairro:</span> {endereco.bairro}</p>
                <p><span className="font-semibold">Cidade/UF:</span> {endereco.cidade} - {endereco.estado}</p>
                <p><span className="font-semibold">CEP:</span> {endereco.cep}</p>
              </div>
            ) : (
              <form action={salvarEndereco} className="space-y-3">
                <input type="hidden" name="servidorId" value={servidorId} />
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><input type="text" name="logradouro" placeholder="Rua/Avenida" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                  <div><input type="text" name="numero" placeholder="Nº" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><input type="text" name="bairro" placeholder="Bairro" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                  <div><input type="text" name="cep" placeholder="CEP" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                </div>
                <div><input type="text" name="cidade" placeholder="Cidade" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded-md text-sm font-bold hover:bg-slate-800">Salvar Endereço</button>
              </form>
            )}
          </section>

        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-8">
          
          {/* DESLIGAMENTO INSTITUCIONAL */}
          <section className="bg-white p-6 rounded-xl border border-red-200 shadow-sm bg-red-50/30">
            <div className="flex items-center gap-2 border-b border-red-100 pb-4 mb-4">
              <FileWarning className="text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Desligamento Institucional</h2>
            </div>
            
            {servidorBase.status === 'DESLIGADO' ? (
              <div className="text-sm text-red-800 space-y-2 p-3 bg-red-100 rounded-lg">
                <p><span className="font-bold">Data do Desligamento:</span> {servidorBase.dataDesligamento}</p>
                <p><span className="font-bold">Motivo:</span> {servidorBase.motivoDesligamento}</p>
                {servidorBase.numeroProcessoDesligamento && <p><span className="font-bold">Nº Processo:</span> {servidorBase.numeroProcessoDesligamento}</p>}
              </div>
            ) : (
              <form action={registrarDesligamento} className="space-y-3">
                <input type="hidden" name="servidorId" value={servidorId} />
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Data do Desligamento *</label>
                  <input type="date" name="dataDesligamento" required className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Motivo *</label>
                  <textarea name="motivoDesligamento" required rows={2} placeholder="Ex: Fim do contrato, pedido de demissão, etc." className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-red-500"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Número do Processo (Opcional)</label>
                  <input type="text" name="numeroProcessoDesligamento" placeholder="Ex: 2026/00123" className="w-full border p-2 text-sm rounded-md outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md text-sm font-bold hover:bg-red-700 flex justify-center items-center gap-2">
                  <ShieldAlert size={16} /> Confirmar Desligamento
                </button>
              </form>
            )}
          </section>

          {/* DADOS BANCÁRIOS (Mantido do anterior) */}
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <Landmark className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Dados Bancários</h2>
            </div>
            {banco ? (
               <div className="text-sm text-gray-700 space-y-2">
                <p><span className="font-semibold">Titular:</span> {banco.nomeTitular}</p>
                <p><span className="font-semibold">Banco:</span> {banco.banco}</p>
                <p><span className="font-semibold">Agência/Conta:</span> {banco.agencia} / {banco.conta}</p>
              </div>
            ) : (
              <form action={salvarContaBancaria} className="space-y-3">
                <input type="hidden" name="servidorId" value={servidorId} />
                <div><input type="text" name="nomeTitular" placeholder="Nome Completo do Titular" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1"><input type="text" name="banco" placeholder="Banco" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                  <div className="col-span-1"><input type="text" name="agencia" placeholder="Agência" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                  <div className="col-span-1"><input type="text" name="conta" placeholder="Conta" required className="w-full border p-2 text-sm rounded-md outline-none" /></div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded-md text-sm font-bold hover:bg-slate-800">Salvar Dados Bancários</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}