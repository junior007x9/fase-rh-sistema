// Arquivo: app/recrutamento/page.tsx
import { db } from "../../db/index";
import { candidatos } from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import { UserPlus, Users, SearchCheck, Pencil, X, Mail, Phone, Briefcase } from "lucide-react";
import BotaoExcluir from "../components/BotaoExcluir";
import Link from "next/link";
import { registrarCandidato, atualizarStatusCandidato, excluirCandidato, atualizarDadosCandidato } from "../actions/recrutamento";

export const dynamic = "force-dynamic";

export default async function RecrutamentoPage({ searchParams }: { searchParams: Promise<{ editar?: string }> }) {
  const params = await searchParams;
  // 1. Busca a lista normal
  const listaCandidatos = await db.select().from(candidatos).orderBy(desc(candidatos.criadoEm));

  // 2. Verifica se o usuário clicou em editar algum registro
  const idEdicao = params?.editar;
  let candidatoEditando = null;

  if (idEdicao) {
    const resultado = await db.select().from(candidatos).where(eq(candidatos.id, idEdicao));
    if (resultado.length > 0) {
      candidatoEditando = resultado[0];
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      <header className="mb-8 border-b border-slate-200 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Recrutamento e Seleção</h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie currículos e o Cadastro de Reserva para futuras convocações.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO INTELIGENTE (CRIAR / EDITAR) */}
        <section className={`xl:col-span-1 p-6 sm:p-8 rounded-2xl border shadow-sm h-fit transition-all duration-300 ${candidatoEditando ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${candidatoEditando ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                {candidatoEditando ? <Pencil size={20} /> : <UserPlus size={20} />}
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {candidatoEditando ? "Editando Candidato" : "Novo Candidato"}
              </h2>
            </div>
            {candidatoEditando && (
              <Link href="/recrutamento" scroll={false} className="text-slate-400 hover:text-red-500 bg-white p-2 rounded-lg border border-slate-200 shadow-sm transition-colors" title="Cancelar Edição">
                <X size={18} />
              </Link>
            )}
          </div>

          <form action={candidatoEditando ? atualizarDadosCandidato : registrarCandidato} className="space-y-5">
            
            {candidatoEditando && <input type="hidden" name="id" value={candidatoEditando.id} />}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome Completo *</label>
              <input type="text" name="nome" defaultValue={candidatoEditando?.nome || ""} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-700 font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">CPF *</label>
                <input type="text" name="cpf" defaultValue={candidatoEditando?.cpf || ""} required placeholder="000.000.000-00" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-700" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Telefone *</label>
                <input type="text" name="telefone" defaultValue={candidatoEditando?.telefone || ""} required placeholder="(00) 00000-0000" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-700" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">E-mail *</label>
              <input type="email" name="email" defaultValue={candidatoEditando?.email || ""} required placeholder="email@exemplo.com" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-700" />
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <SearchCheck size={14} className="text-blue-500" /> Qualificação e Currículo
              </label>
              <textarea 
                name="qualificacaoCurriculo" 
                defaultValue={candidatoEditando?.qualificacaoCurriculo || ""}
                rows={3} 
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-700 resize-none"
                placeholder="Resumo das habilidades..."
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Área de Adaptação Sugerida</label>
              <input 
                type="text" 
                name="areaAdaptacaoSugerida" 
                defaultValue={candidatoEditando?.areaAdaptacaoSugerida || ""}
                placeholder="Ex: Administrativo, RH, TI..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white transition-colors text-slate-700" 
              />
            </div>

            <div className="pt-2">
              <button type="submit" className={`w-full text-white p-3.5 rounded-xl text-sm font-extrabold transition-all shadow-lg flex justify-center items-center gap-2 ${candidatoEditando ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20'}`}>
                {candidatoEditando ? "Salvar Alterações" : "Salvar Cadastro"}
              </button>
            </div>
          </form>
        </section>

        {/* COLUNA DIREITA: CADASTRO DE RESERVA (TABELA) */}
        <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 border border-slate-700"><Users size={20} /></div>
            <div>
              <h2 className="text-lg font-bold">Banco de Talentos</h2>
              <p className="text-xs text-slate-400">Total de {listaCandidatos.length} currículo(s) registrado(s)</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest w-1/4">Candidato</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest w-1/4">Qualificação / Área</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest w-1/4">Contato</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listaCandidatos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Users size={32} className="mb-3 opacity-50" />
                        <p className="font-medium">Nenhum candidato registrado no banco de talentos.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  listaCandidatos.map((candidato) => (
                    <tr key={candidato.id} className={`hover:bg-slate-50 transition-colors group ${idEdicao === candidato.id ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{candidato.nome}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">CPF: {candidato.cpf}</p>
                      </td>
                      
                      <td className="py-4 px-6">
                        <p className="text-slate-800 font-bold truncate max-w-[150px] flex items-center gap-1.5" title={candidato.areaAdaptacaoSugerida || "Não informada"}>
                          <Briefcase size={12} className="text-slate-400 shrink-0"/> {candidato.areaAdaptacaoSugerida || "Não definida"}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px] mt-1 italic" title={candidato.qualificacaoCurriculo || ""}>
                          {candidato.qualificacaoCurriculo || "Sem observações"}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600 space-y-1.5">
                        <p className="flex items-center gap-1.5 font-medium"><Phone size={12} className="text-slate-400"/> {candidato.telefone}</p>
                        {/* AQUI FOI APLICADA A CORREÇÃO (|| "") */}
                        <p className="flex items-center gap-1.5 truncate max-w-[150px]" title={candidato.email || ""}><Mail size={12} className="text-slate-400"/> {candidato.email}</p>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <form action={atualizarStatusCandidato} className="flex flex-col gap-1.5 items-center">
                          <input type="hidden" name="candidatoId" value={candidato.id} />
                          <select 
                            name="status" 
                            defaultValue={candidato.status}
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer shadow-sm ${
                              candidato.status === 'RESERVA' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                              candidato.status === 'CONVOCADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                              'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <option value="RESERVA" className="bg-white text-slate-700 font-bold">Reserva</option>
                            <option value="CONVOCADO" className="bg-white text-slate-700 font-bold">Convocado</option>
                            <option value="REJEITADO" className="bg-white text-slate-700 font-bold">Rejeitado</option>
                          </select>
                          <button type="submit" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Salvar</button>
                        </form>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/recrutamento?editar=${candidato.id}`} 
                            scroll={false}
                            className="p-2 bg-white text-amber-600 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 rounded-lg transition-colors shadow-sm"
                            title="Editar Dados"
                          >
                            <Pencil size={16} />
                          </Link>
                          <BotaoExcluir 
                            id={candidato.id} 
                            nomeRegistro={candidato.nome} 
                            acaoExcluir={excluirCandidato as any} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}