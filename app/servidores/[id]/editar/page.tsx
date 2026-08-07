// Arquivo: app/servidores/[id]/editar/page.tsx
import { db } from "../../../../db/index";
import { servidores, dadosPessoais, documentos, cargos, lotacoes } from "../../../../db/schema";
import { eq, isNull } from "drizzle-orm";
import { User, Briefcase, FileText, ArrowLeft, Heart, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { atualizarServidor } from "../../../actions/servidores";

export const dynamic = "force-dynamic";

export default async function EditarServidorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Busca os dados atuais do servidor
  const [servidor] = await db.select().from(servidores).where(eq(servidores.id, id));
  const [pessoais] = await db.select().from(dadosPessoais).where(eq(dadosPessoais.servidorId, id));
  const [docs] = await db.select().from(documentos).where(eq(documentos.servidorId, id));

  if (!servidor || !pessoais || !docs) {
    return <div className="text-center p-12 text-slate-500 font-bold">Servidor não encontrado.</div>;
  }

  // ==========================================
  // BUSCA CARGOS E LOTAÇÕES DO BANCO DE DADOS
  // ==========================================
  let listaCargos = await db.select().from(cargos).where(isNull(cargos.excluidoEm));
  
  // Tratamento caso a tabela Cargos esteja vazia (pega do histórico)
  if (listaCargos.length === 0) {
    const todosCargos = await db.select({ cargo: servidores.cargo }).from(servidores);
    const cargosUnicos = Array.from(new Set(todosCargos.map(s => s.cargo).filter(Boolean))) as string[];
    // CORREÇÃO: Adicionamos o excluidoEm: null para satisfazer o TypeScript
    listaCargos = cargosUnicos.map((nome, index) => ({ id: String(index), nome, descricao: null, criadoEm: null, excluidoEm: null }));
  }

  let listaLotacoes = await db.select().from(lotacoes).where(isNull(lotacoes.excluidoEm));
  
  if (listaLotacoes.length === 0) {
    const todasLotacoes = await db.select({ lotacao: servidores.lotacao }).from(servidores);
    const lotacoesUnicas = Array.from(new Set(todasLotacoes.map(s => s.lotacao).filter(Boolean))) as string[];
    // CORREÇÃO: Adicionamos o excluidoEm: null para satisfazer o TypeScript
    listaLotacoes = lotacoesUnicas.map((nome, index) => ({ id: String(index), nome, sigla: "NA", criadoEm: null, excluidoEm: null }));
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <header className="mb-8 border-b border-slate-200 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/servidores/${id}`} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Editar Servidor</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Atualize as informações cadastrais e institucionais.</p>
          </div>
        </div>
      </header>

      <form action={atualizarServidor} className="space-y-6">
        <input type="hidden" name="id" value={id} />

        {/* 1. DADOS PESSOAIS */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={18} /></div>
            <h2 className="text-lg font-bold text-slate-800">Dados Pessoais</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome Completo *</label>
              <input type="text" name="nome" defaultValue={pessoais.nome} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">Nome Social <Heart size={10} className="text-pink-500" /></label>
              <input type="text" name="nomeSocial" defaultValue={pessoais.nomeSocial || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data de Nascimento *</label>
              <input type="date" name="dataNascimento" defaultValue={pessoais.dataNascimento} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Gênero *</label>
              <select name="genero" defaultValue={pessoais.genero} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="NAO_BINARIO">Não Binário</option>
                <option value="OUTRO">Outro / Prefere não dizer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Estado Civil *</label>
              <select name="estadoCivil" defaultValue={pessoais.estadoCivil} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Raça/Cor *</label>
              <select name="grupoEtnico" defaultValue={pessoais.grupoEtnico} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="BRANCA">Branca</option>
                <option value="PRETA">Preta</option>
                <option value="PARDA">Parda</option>
                <option value="AMARELA">Amarela</option>
                <option value="INDIGENA">Indígena</option>
                <option value="NAO_INFORMADO">Não Informado</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Orientação Sexual</label>
              <select name="orientacaoSexual" defaultValue={pessoais.orientacaoSexual} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="HETEROSSEXUAL">Heterossexual</option>
                <option value="HOMOSSEXUAL">Homossexual</option>
                <option value="BISSEXUAL">Bissexual</option>
                <option value="OUTRO">Outro / Prefere não dizer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo Sanguíneo</label>
              <select name="tipoSanguineo" defaultValue={pessoais.tipoSanguineo || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="">Desconhecido</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. CONTATOS E DOCUMENTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText size={18} /></div>
              <h2 className="text-lg font-bold text-slate-800">Documentação</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">CPF *</label>
                <input type="text" name="cpf" defaultValue={docs.cpf || ""} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">RG *</label>
                <input type="text" name="rg" defaultValue={docs.rg} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Título de Eleitor *</label>
                <input type="text" name="tituloEleitoral" defaultValue={docs.tituloEleitoral} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">PIS/PASEP</label>
                <input type="text" name="pisPasep" defaultValue={docs.pisPasep || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldAlert size={18} /></div>
              <h2 className="text-lg font-bold text-slate-800">Contato</h2>
            </div>
            <div className="p-6 grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">E-mail Institucional ou Pessoal</label>
                <input type="email" name="email" defaultValue={pessoais.email || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Telefone/WhatsApp *</label>
                <input type="text" name="telefone" defaultValue={pessoais.telefone} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </section>
        </div>

        {/* 3. DADOS INSTITUCIONAIS */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Briefcase size={18} /></div>
            <h2 className="text-lg font-bold text-slate-800">Dados Institucionais</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Matrícula</label>
              <input type="text" name="matricula" defaultValue={servidor.matricula || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vínculo *</label>
              <select name="vinculo" defaultValue={servidor.vinculo} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="EFETIVO">Efetivo (Concursado)</option>
                <option value="CONTRATADO">Contratado (Temporário)</option>
                <option value="COMISSIONADO">Cargo Comissionado</option>
                <option value="ESTAGIARIO">Estagiário</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data de Admissão *</label>
              <input type="date" name="dataAdmissao" defaultValue={servidor.dataAdmissao} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            
            {/* NOVO: CAMPO DE REMUNERAÇÃO E JORNADA */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Jornada de Trabalho</label>
              <select name="jornada" defaultValue={servidor.jornada || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors font-semibold text-slate-700">
                <option value="">Selecione...</option>
                <option value="20H">20 Horas Semanais</option>
                <option value="30H">30 Horas Semanais</option>
                <option value="40H">40 Horas Semanais</option>
                <option value="12X36">Plantonista (12x36)</option>
                <option value="24X72">Plantonista (24x72)</option>
              </select>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cargo / Emprego</label>
              <select name="cargo" defaultValue={servidor.cargo || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="">Selecione um cargo</option>
                {listaCargos.map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lotação Atual</label>
              <select name="lotacao" defaultValue={servidor.lotacao || ""} className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors">
                <option value="">Selecione uma lotação</option>
                {listaLotacoes.map(l => (
                  <option key={l.id} value={l.nome}>{l.sigla !== 'NA' ? `${l.sigla} - ` : ''}{l.nome}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Função Gratificada / Cargo de Chefia (Opcional)</label>
              <input type="text" name="funcao" defaultValue={servidor.funcao || ""} placeholder="Ex: Diretor(a), Coordenador(a), Chefe de Plantão..." className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors font-semibold text-slate-700" />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Remuneração Base (R$)</label>
              <input 
                type="text" 
                name="remuneracaoBase" 
                defaultValue={servidor.remuneracaoBase ? servidor.remuneracaoBase.toFixed(2).replace('.', ',') : ""}
                placeholder="Ex: 3500,00" 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors font-bold text-slate-700 placeholder:font-normal" 
              />
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Usado para cálculo automático de Folha, Férias e Rescisão.</p>
            </div>

          </div>
        </section>

        {/* BOTÕES */}
        <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
          <Link href={`/servidores/${id}`} className="px-6 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancelar Edição
          </Link>
          <button type="submit" className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-extrabold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-lg shadow-slate-800/20 transition-all hover:-translate-y-0.5">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}