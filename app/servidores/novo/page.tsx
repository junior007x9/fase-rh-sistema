// Arquivo: app/servidores/novo/page.tsx
import { cadastrarServidor } from "../../actions/servidores";
import { db } from "../../../db/index";
import { cargos, lotacoes, servidores } from "../../../db/schema";
import { isNull } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, User, FileText, Briefcase, Heart, Save, DollarSign, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NovoServidorPage() {
  // ============================================================================
  // SEGURANÇA: Busca listas oficiais. Se vazias, extrai os valores já cadastrados
  // ============================================================================
  let listaCargos = await db.select().from(cargos).where(isNull(cargos.excluidoEm));
  if (listaCargos.length === 0) {
    const todosCargos = await db.select({ cargo: servidores.cargo }).from(servidores);
    const cargosUnicos = Array.from(new Set(todosCargos.map(s => s.cargo).filter(Boolean))) as string[];
    // CORREÇÃO DO TYPESCRIPT AQUI 👇
    listaCargos = cargosUnicos.map((nome, index) => ({ id: String(index), nome, descricao: null, criadoEm: null, excluidoEm: null }));
  }

  let listaLotacoes = await db.select().from(lotacoes).where(isNull(lotacoes.excluidoEm));
  if (listaLotacoes.length === 0) {
    const todasLotacoes = await db.select({ lotacao: servidores.lotacao }).from(servidores);
    const lotacoesUnicas = Array.from(new Set(todasLotacoes.map(s => s.lotacao).filter(Boolean))) as string[];
    // CORREÇÃO DO TYPESCRIPT AQUI 👇
    listaLotacoes = lotacoesUnicas.map((nome, index) => ({ id: String(index), nome, sigla: "", criadoEm: null, excluidoEm: null }));
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/servidores" className="p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-700" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Novo Servidor</h1>
            <p className="text-slate-500 mt-1 text-sm">Preencha as informações para cadastrar um novo colaborador no sistema.</p>
          </div>
        </div>
      </header>

      {/* FORMULÁRIO */}
      <form action={cadastrarServidor} className="space-y-8">
        
        {/* SESSÃO 1: DADOS PESSOAIS */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Dados Pessoais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome Completo *</label>
              <input type="text" name="nome" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700 font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome Social (Opcional)</label>
              <input type="text" name="nomeSocial" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data de Nascimento *</label>
              <input type="date" name="dataNascimento" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Telefone *</label>
              <input type="text" name="telefone" required placeholder="(00) 00000-0000" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">E-mail Profissional ou Pessoal *</label>
              <input type="email" name="email" required placeholder="email@exemplo.com" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">CPF *</label>
              <input type="text" name="cpf" required placeholder="000.000.000-00" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">RG *</label>
              <input type="text" name="rg" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Título Eleitoral *</label>
              <input type="text" name="tituloEleitoral" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">PIS/PASEP (Opcional)</label>
              <input type="text" name="pisPasep" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Gênero *</label>
              <select name="genero" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Orientação Sexual *</label>
              <select name="orientacaoSexual" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
                <option value="HETEROSSEXUAL">Heterossexual</option>
                <option value="HOMOSSEXUAL">Homossexual</option>
                <option value="BISSEXUAL">Bissexual</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cor/Etnia *</label>
              <select name="grupoEtnico" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
                <option value="BRANCA">Branca</option>
                <option value="PRETA">Preta</option>
                <option value="PARDA">Parda</option>
                <option value="AMARELA">Amarela</option>
                <option value="INDIGENA">Indígena</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Estado Civil *</label>
              <select name="estadoCivil" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo Sanguíneo (Opcional)</label>
              <select name="tipoSanguineo" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
                <option value="">Não informado</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
          </div>
        </section>

        {/* SESSÃO 4: VÍNCULO INSTITUCIONAL (AGORA COM DADOS DE FOLHA) */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Vínculo Institucional e Base Salarial</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Linha 1 */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Matrícula *</label>
              <input type="text" name="matricula" required placeholder="Ex: 123456" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors font-semibold text-slate-800" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Vínculo *</label>
              <select name="vinculo" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
                <option value="EFETIVO">Efetivo</option>
                <option value="CONTRATADO">Contratado</option>
                <option value="COMISSIONADO">Comissionado</option>
                <option value="ESTAGIARIO">Estagiário</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data de Admissão *</label>
              <input type="date" name="dataAdmissao" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors font-semibold text-slate-700" />
            </div>

            {/* Linha 2 (Cargos e Lotação) */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cargo *</label>
              <select name="cargo" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors font-semibold text-slate-700">
                <option value="">Selecione um cargo...</option>
                {listaCargos.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Lotação (Setor/Secretaria) *</label>
              <select name="lotacao" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors font-semibold text-slate-700">
                <option value="">Selecione uma lotação...</option>
                {listaLotacoes.map((l) => (
                  <option key={l.id} value={l.nome}>{l.nome}</option>
                ))}
              </select>
            </div>

            {/* Linha 3 (Folha de Pagamento) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Função (Opcional)</label>
              <input type="text" name="funcao" placeholder="Ex: Diretor(a)" className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700" />
            </div>
            
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                <Clock size={14} className="text-blue-600" /> Jornada de Trabalho *
              </label>
              <select name="jornada" required className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white bg-slate-50 transition-colors text-slate-700">
                <option value="">Selecione...</option>
                <option value="20h Semanais">20h Semanais</option>
                <option value="30h Semanais">30h Semanais</option>
                <option value="40h Semanais">40h Semanais</option>
                <option value="12x36 (Plantão)">12x36 (Plantão)</option>
                <option value="24x72 (Plantão)">24x72 (Plantão)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                <DollarSign size={14} className="text-emerald-600" /> Remuneração Base (Bruto) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">R$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  name="remuneracaoBase" 
                  required 
                  placeholder="0.00" 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm pl-11 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50 transition-colors font-extrabold text-slate-800" 
                />
              </div>
            </div>

          </div>
        </section>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-2 pb-8">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-extrabold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save size={18} /> Cadastrar Servidor
          </button>
        </div>
        
      </form>
    </div>
  );
}