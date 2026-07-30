// Arquivo: app/servidores/[id]/editar/page.tsx
import { db } from "../../../../db/index";
import { servidores, dadosPessoais, documentos, cargos, lotacoes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { atualizarServidor } from "../../../actions/servidores";
import Link from "next/link";
import { ArrowLeft, User, FileText, Briefcase, Heart, Save, Clock, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarServidorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;

  // Busca os dados atuais do servidor
  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, servidorId));

  // Busca as opções de cargos e lotações do banco
  const listaCargos = await db.select().from(cargos);
  const listaLotacoes = await db.select().from(lotacoes);

  if (!servidorBase || !pessoal || !docs) {
    redirect("/servidores");
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/servidores" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Servidor</h1>
            <p className="text-gray-500 mt-1">Alterando os dados de <span className="font-semibold text-blue-700">{pessoal.nome}</span></p>
          </div>
        </div>
      </header>

      {/* FORMULÁRIO */}
      <form action={atualizarServidor} className="space-y-8">
        
        <input type="hidden" name="id" value={servidorId} />

        {/* SESSÃO 1: DADOS PESSOAIS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <User className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Dados Pessoais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nome" defaultValue={pessoal.nome || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Social (Opcional)</label>
              <input type="text" name="nomeSocial" defaultValue={pessoal.nomeSocial || ""} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
              <input type="date" name="dataNascimento" defaultValue={pessoal.dataNascimento || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="text" name="telefone" defaultValue={pessoal.telefone || ""} required placeholder="(00) 00000-0000" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Profissional ou Pessoal *</label>
              <input type="email" name="email" defaultValue={pessoal.email || ""} required placeholder="email@exemplo.com" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
        </section>

        {/* SESSÃO 2: DOCUMENTAÇÃO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <FileText className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Documentação</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <input type="text" name="cpf" defaultValue={docs.cpf || ""} required placeholder="000.000.000-00" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
              <input type="text" name="rg" defaultValue={docs.rg || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Eleitoral *</label>
              <input type="text" name="tituloEleitoral" defaultValue={docs.tituloEleitoral || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIS/PASEP (Opcional)</label>
              <input type="text" name="pisPasep" defaultValue={docs.pisPasep || ""} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
        </section>

        {/* SESSÃO 3: DIVERSIDADE E PERFIL */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <Heart className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Perfil e Diversidade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero *</label>
              <select name="genero" defaultValue={pessoal.genero || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="MASCULINO_CISGENERO">Masculino Cisgênero</option>
                <option value="FEMININO_CISGENERO">Feminino Cisgênero</option>
                <option value="MASCULINO_TRANSGENERO">Masculino Transgênero</option>
                <option value="FEMININO_TRANSGENERO">Feminino Transgênero</option>
                <option value="NAO_BINARIO">Não Binário</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orientação Sexual *</label>
              <select name="orientacaoSexual" defaultValue={pessoal.orientacaoSexual || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="HETEROSSEXUAL">Heterossexual</option>
                <option value="HOMOSSEXUAL">Homossexual</option>
                <option value="BISSEXUAL">Bissexual</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor/Etnia *</label>
              <select name="grupoEtnico" defaultValue={pessoal.grupoEtnico || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="BRANCA">Branca</option>
                <option value="PRETA">Preta</option>
                <option value="PARDA">Parda</option>
                <option value="AMARELA">Amarela</option>
                <option value="INDIGENA">Indígena</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
              <select name="estadoCivil" defaultValue={pessoal.estadoCivil || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Sanguíneo (Opcional)</label>
              <select name="tipoSanguineo" defaultValue={pessoal.tipoSanguineo || ""} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Não informado</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
          </div>
        </section>

        {/* SESSÃO 4: VÍNCULO INSTITUCIONAL E BASE SALARIAL (DADOS DA FOLHA) */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Vínculo Institucional e Base Salarial</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Linha 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
              <input type="text" name="matricula" defaultValue={servidorBase.matricula || ""} required placeholder="Ex: 123456" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vínculo *</label>
              <select name="vinculo" defaultValue={servidorBase.vinculo || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="EFETIVO">Efetivo</option>
                <option value="CONTRATADO">Contratado</option>
                <option value="COMISSIONADO">Comissionado</option>
                <option value="ESTAGIARIO">Estagiário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão *</label>
              <input type="date" name="dataAdmissao" defaultValue={servidorBase.dataAdmissao || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            
            {/* Linha 2 (Cargos e Lotação) */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
              <select name="cargo" defaultValue={servidorBase.cargo || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione um cargo...</option>
                {listaCargos.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lotação (Setor/Secretaria) *</label>
              <select name="lotacao" defaultValue={servidorBase.lotacao || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione uma lotação...</option>
                {listaLotacoes.map((l) => (
                  <option key={l.id} value={l.nome}>{l.nome}</option>
                ))}
              </select>
            </div>

            {/* Linha 3 (Folha de Pagamento) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função (Opcional)</label>
              <input type="text" name="funcao" defaultValue={servidorBase.funcao || ""} placeholder="Ex: Diretor(a), Coordenador(a)" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock size={14} className="text-gray-500" /> Jornada de Trabalho *
              </label>
              <select name="jornada" defaultValue={servidorBase.jornada || ""} required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione...</option>
                <option value="20h Semanais">20h Semanais</option>
                <option value="30h Semanais">30h Semanais</option>
                <option value="40h Semanais">40h Semanais</option>
                <option value="12x36 (Plantão)">12x36 (Plantão)</option>
                <option value="24x72 (Plantão)">24x72 (Plantão)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <DollarSign size={14} className="text-gray-500" /> Remuneração Base (Bruto) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">R$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  name="remuneracaoBase" 
                  defaultValue={servidorBase.remuneracaoBase ?? ""} 
                  required 
                  placeholder="0.00" 
                  className="w-full border rounded-lg p-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                />
              </div>
            </div>

          </div>
        </section>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 text-lg"
          >
            <Save size={20} /> Salvar Alterações
          </button>
        </div>
        
      </form>
    </div>
  );
}