// Arquivo: app/servidores/[id]/editar/page.tsx
import { db } from "../../../../db/index";
import { servidores, dadosPessoais, documentos, cargos, lotacoes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { atualizarServidor } from "../../../actions/servidores";
import Link from "next/link";
import { ArrowLeft, User, FileText, Briefcase, Heart, Save, Clock, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";

// IMPORT DA NOSSA CENTRAL DE FORMATAÇÃO 🚀
import { formatarDataInput, formatarNumeroInput } from "../../../utils/formatters";

export const dynamic = "force-dynamic";

export default async function EditarServidorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const servidorId = resolvedParams.id;

  // Busca os dados atuais do servidor
  const [servidorBase] = await db.select().from(servidores).where(eq(servidores.id, servidorId));
  const [pessoal] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, servidorId));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, servidorId));

  if (!servidorBase || !pessoal || !docs) {
    redirect("/servidores");
  }

  // Busca as tabelas oficiais ou injeta os dados reais para evitar telas em branco
  let listaCargos = await db.select().from(cargos);
  if (listaCargos.length === 0) {
    const todosCargos = await db.select({ cargo: servidores.cargo }).from(servidores);
    const cargosUnicos = Array.from(new Set(todosCargos.map(s => s.cargo).filter(Boolean))) as string[];
    listaCargos = cargosUnicos.map((nome, index) => ({ id: String(index), nome, descricao: null, criadoEm: null }));
  }

  let listaLotacoes = await db.select().from(lotacoes);
  if (listaLotacoes.length === 0) {
    const todasLotacoes = await db.select({ lotacao: servidores.lotacao }).from(servidores);
    const lotacoesUnicas = Array.from(new Set(todasLotacoes.map(s => s.lotacao).filter(Boolean))) as string[];
    listaLotacoes = lotacoesUnicas.map((nome, index) => ({ id: String(index), nome, sigla: "", criadoEm: null }));
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/servidores/${servidorId}`} className="p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Editar Servidor</h1>
            <p className="text-slate-500 mt-1 text-sm">Alterando os dados de <span className="font-bold text-amber-600">{pessoal.nome}</span></p>
          </div>
        </div>
      </header>

      {/* FORMULÁRIO */}
      <form action={atualizarServidor} className="space-y-8">
        <input type="hidden" name="id" value={servidorId} />

        {/* SESSÃO 1: DADOS PESSOAIS */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Dados Pessoais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nome Completo *</label>
              <input type="text" name="nome" defaultValue={pessoal.nome || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nome Social (Opcional)</label>
              <input type="text" name="nomeSocial" defaultValue={pessoal.nomeSocial || ""} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Data de Nascimento *</label>
              <input type="date" name="dataNascimento" defaultValue={formatarDataInput(pessoal.dataNascimento)} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Telefone *</label>
              <input type="text" name="telefone" defaultValue={pessoal.telefone || ""} required placeholder="(00) 00000-0000" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">E-mail Profissional ou Pessoal *</label>
              <input type="email" name="email" defaultValue={pessoal.email || ""} required placeholder="email@exemplo.com" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
          </div>
        </section>

        {/* SESSÃO 2: DOCUMENTAÇÃO */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Documentação</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">CPF *</label>
              <input type="text" name="cpf" defaultValue={docs.cpf || ""} required placeholder="000.000.000-00" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">RG *</label>
              <input type="text" name="rg" defaultValue={docs.rg || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Título Eleitoral *</label>
              <input type="text" name="tituloEleitoral" defaultValue={docs.tituloEleitoral || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">PIS/PASEP (Opcional)</label>
              <input type="text" name="pisPasep" defaultValue={docs.pisPasep || ""} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
          </div>
        </section>

        {/* SESSÃO 3: DIVERSIDADE E PERFIL */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Heart size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Perfil e Diversidade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gênero *</label>
              <select name="genero" defaultValue={pessoal.genero || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="MASCULINO_CISGENERO">Masculino Cisgênero</option>
                <option value="FEMININO_CISGENERO">Feminino Cisgênero</option>
                <option value="MASCULINO_TRANSGENERO">Masculino Transgênero</option>
                <option value="FEMININO_TRANSGENERO">Feminino Transgênero</option>
                <option value="NAO_BINARIO">Não Binário</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                {/* Fallback de Segurança */}
                {pessoal.genero && !["MASCULINO_CISGENERO", "FEMININO_CISGENERO", "MASCULINO_TRANSGENERO", "FEMININO_TRANSGENERO", "NAO_BINARIO", "OUTRO", "PREFIRO_NAO_INFORMAR"].includes(pessoal.genero) && (
                  <option value={pessoal.genero}>{pessoal.genero}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Orientação Sexual *</label>
              <select name="orientacaoSexual" defaultValue={pessoal.orientacaoSexual || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="HETEROSSEXUAL">Heterossexual</option>
                <option value="HOMOSSEXUAL">Homossexual</option>
                <option value="BISSEXUAL">Bissexual</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                {pessoal.orientacaoSexual && !["HETEROSSEXUAL", "HOMOSSEXUAL", "BISSEXUAL", "OUTRO", "PREFIRO_NAO_INFORMAR"].includes(pessoal.orientacaoSexual) && (
                  <option value={pessoal.orientacaoSexual}>{pessoal.orientacaoSexual}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Cor/Etnia *</label>
              <select name="grupoEtnico" defaultValue={pessoal.grupoEtnico || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="BRANCA">Branca</option>
                <option value="PRETA">Preta</option>
                <option value="PARDA">Parda</option>
                <option value="AMARELA">Amarela</option>
                <option value="INDIGENA">Indígena</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                {pessoal.grupoEtnico && !["BRANCA", "PRETA", "PARDA", "AMARELA", "INDIGENA", "PREFIRO_NAO_INFORMAR"].includes(pessoal.grupoEtnico) && (
                  <option value={pessoal.grupoEtnico}>{pessoal.grupoEtnico}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Estado Civil *</label>
              <select name="estadoCivil" defaultValue={pessoal.estadoCivil || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
                {pessoal.estadoCivil && !["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL"].includes(pessoal.estadoCivil) && (
                  <option value={pessoal.estadoCivil}>{pessoal.estadoCivil}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tipo Sanguíneo (Opcional)</label>
              <select name="tipoSanguineo" defaultValue={pessoal.tipoSanguineo || ""} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="">Não informado</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                {pessoal.tipoSanguineo && !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(pessoal.tipoSanguineo) && (
                  <option value={pessoal.tipoSanguineo}>{pessoal.tipoSanguineo}</option>
                )}
              </select>
            </div>
          </div>
        </section>

        {/* SESSÃO 4: VÍNCULO INSTITUCIONAL E BASE SALARIAL */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Vínculo Institucional e Base Salarial</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Matrícula */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Matrícula *</label>
              <input type="text" name="matricula" defaultValue={servidorBase.matricula || ""} required placeholder="Ex: C1679" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-semibold" />
            </div>

            {/* Vínculo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tipo de Vínculo *</label>
              <select name="vinculo" defaultValue={servidorBase.vinculo || "EFETIVO"} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="EFETIVO">Efetivo</option>
                <option value="CONTRATADO">Contratado</option>
                <option value="COMISSIONADO">Comissionado</option>
                <option value="ESTAGIARIO">Estagiário</option>
                {servidorBase.vinculo && !["EFETIVO", "CONTRATADO", "COMISSIONADO", "ESTAGIARIO"].includes(servidorBase.vinculo.toUpperCase()) && (
                  <option value={servidorBase.vinculo}>{servidorBase.vinculo}</option>
                )}
              </select>
            </div>

            {/* Data de Admissão */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Data de Admissão *</label>
              <input type="date" name="dataAdmissao" defaultValue={formatarDataInput(servidorBase.dataAdmissao)} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-semibold" />
            </div>
            
            {/* Cargo */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Cargo *</label>
              <select name="cargo" defaultValue={servidorBase.cargo || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-semibold">
                <option value="">Selecione um cargo...</option>
                {servidorBase.cargo && !listaCargos.some(c => c.nome === servidorBase.cargo) && (
                  <option value={servidorBase.cargo}>{servidorBase.cargo}</option>
                )}
                {listaCargos.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Lotação */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Lotação (Setor/Secretaria) *</label>
              <select name="lotacao" defaultValue={servidorBase.lotacao || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-semibold">
                <option value="">Selecione uma lotação...</option>
                {servidorBase.lotacao && !listaLotacoes.some(l => l.nome === servidorBase.lotacao) && (
                  <option value={servidorBase.lotacao}>{servidorBase.lotacao}</option>
                )}
                {listaLotacoes.map((l) => (
                  <option key={l.id} value={l.nome}>{l.nome}</option>
                ))}
              </select>
            </div>

            {/* Função */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Função (Opcional)</label>
              <input type="text" name="funcao" defaultValue={servidorBase.funcao || ""} placeholder="Ex: Diretor(a)" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" />
            </div>
            
            {/* Jornada */}
            <div>
              <label className="flex items-center gap-1.5 block text-xs font-bold text-slate-700 uppercase mb-2">
                <Clock size={14} className="text-blue-600" /> Jornada de Trabalho *
              </label>
              <select name="jornada" defaultValue={servidorBase.jornada || ""} required className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700">
                <option value="">Selecione...</option>
                <option value="20h Semanais">20h Semanais</option>
                <option value="30h Semanais">30h Semanais</option>
                <option value="40h Semanais">40h Semanais</option>
                <option value="12x36 (Plantão)">12x36 (Plantão)</option>
                <option value="24x72 (Plantão)">24x72 (Plantão)</option>
                {servidorBase.jornada && !["20h Semanais", "30h Semanais", "40h Semanais", "12x36 (Plantão)", "24x72 (Plantão)"].includes(servidorBase.jornada) && (
                  <option value={servidorBase.jornada}>{servidorBase.jornada}</option>
                )}
              </select>
            </div>

            {/* Remuneração Base */}
            <div>
              <label className="flex items-center gap-1.5 block text-xs font-bold text-slate-700 uppercase mb-2">
                <DollarSign size={14} className="text-emerald-600" /> Remuneração Base (Bruto) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">R$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  name="remuneracaoBase" 
                  defaultValue={formatarNumeroInput(servidorBase.remuneracaoBase)} 
                  required 
                  placeholder="0.00" 
                  className="w-full border border-slate-200 rounded-xl p-3 pl-11 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-800 font-bold" 
                />
              </div>
            </div>

          </div>
        </section>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-2 pb-8">
          <button 
            type="submit" 
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-extrabold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
        
      </form>
    </div>
  );
}