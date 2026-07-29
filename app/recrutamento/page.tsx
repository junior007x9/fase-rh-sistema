// Arquivo: app/recrutamento/page.tsx
import { db } from "../../db/index";
import { candidatos } from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import { UserPlus, Users, SearchCheck, Pencil, X } from "lucide-react";
import BotaoExcluir from "../components/BotaoExcluir";
import Link from "next/link";
import { registrarCandidato, atualizarStatusCandidato, excluirCandidato, atualizarDadosCandidato } from "../actions/recrutamento";

export const dynamic = "force-dynamic";

export default async function RecrutamentoPage({ searchParams }: { searchParams: { editar?: string } }) {
  // 1. Busca a lista normal
  const listaCandidatos = await db.select().from(candidatos).orderBy(desc(candidatos.criadoEm));

  // 2. Verifica se o usuário clicou em editar algum registro
  const idEdicao = searchParams?.editar;
  let candidatoEditando = null;

  if (idEdicao) {
    const resultado = await db.select().from(candidatos).where(eq(candidatos.id, idEdicao));
    if (resultado.length > 0) {
      candidatoEditando = resultado[0];
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recrutamento e Seleção</h1>
        <p className="text-gray-500 mt-1">Gerencie currículos e o Cadastro de Reserva para futuras convocações.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO INTELIGENTE (CRIAR / EDITAR) */}
        <section className={`xl:col-span-1 p-6 rounded-xl border shadow-sm h-fit transition-colors duration-300 ${candidatoEditando ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-200">
            <div className="flex items-center gap-2">
              {candidatoEditando ? <Pencil className="text-amber-600" /> : <UserPlus className="text-blue-600" />}
              <h2 className={`text-xl font-semibold ${candidatoEditando ? 'text-amber-800' : 'text-gray-800'}`}>
                {candidatoEditando ? "Editando Candidato" : "Novo Candidato"}
              </h2>
            </div>
            {candidatoEditando && (
              <Link href="/recrutamento" className="text-gray-400 hover:text-red-500 transition-colors" title="Cancelar Edição">
                <X size={24} />
              </Link>
            )}
          </div>

          {/* O Formulario muda a Action e os valores padrão dependendo de quem está editando */}
          <form action={candidatoEditando ? atualizarDadosCandidato : registrarCandidato} className="space-y-4">
            
            {/* Campo oculto com o ID para a atualização */}
            {candidatoEditando && <input type="hidden" name="id" value={candidatoEditando.id} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nome" defaultValue={candidatoEditando?.nome || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input type="text" name="cpf" defaultValue={candidatoEditando?.cpf || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input type="text" name="telefone" defaultValue={candidatoEditando?.telefone || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input type="email" name="email" defaultValue={candidatoEditando?.email || ""} required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>

            <div className="pt-2 border-t border-gray-200 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <SearchCheck size={16} className="text-gray-500" /> Qualificação e Currículo
              </label>
              <textarea 
                name="qualificacaoCurriculo" 
                defaultValue={candidatoEditando?.qualificacaoCurriculo || ""}
                rows={3} 
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área de Adaptação Sugerida</label>
              <input 
                type="text" 
                name="areaAdaptacaoSugerida" 
                defaultValue={candidatoEditando?.areaAdaptacaoSugerida || ""}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button type="submit" className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-sm ${candidatoEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {candidatoEditando ? "Salvar Alterações" : "Salvar Cadastro"}
              </button>
            </div>
          </form>
        </section>

        {/* COLUNA DIREITA: CADASTRO DE RESERVA (TABELA) */}
        <section className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4 border-gray-200">
            <Users className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Banco de Talentos / Cadastro de Reserva</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600 w-1/4">Candidato</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 w-1/4">Qualificação / Área</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 w-1/4">Contato</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaCandidatos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum candidato registrado no banco de talentos.
                    </td>
                  </tr>
                ) : (
                  listaCandidatos.map((candidato) => (
                    <tr key={candidato.id} className={`border-b border-gray-100 hover:bg-slate-50 transition-colors group ${idEdicao === candidato.id ? 'bg-amber-50/50' : ''}`}>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{candidato.nome}</p>
                        <p className="text-xs text-gray-500">CPF: {candidato.cpf}</p>
                      </td>
                      
                      <td className="py-3 px-4">
                        <p className="text-gray-800 font-medium truncate w-48" title={candidato.areaAdaptacaoSugerida || "Não informada"}>
                          {candidato.areaAdaptacaoSugerida || "Não definida"}
                        </p>
                        <p className="text-xs text-gray-500 truncate w-48" title={candidato.qualificacaoCurriculo || ""}>
                          {candidato.qualificacaoCurriculo || "Sem observações"}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-600">
                        <p>{candidato.telefone}</p>
                        <p>{candidato.email}</p>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <form action={atualizarStatusCandidato} className="flex flex-col gap-1 items-center">
                          <input type="hidden" name="candidatoId" value={candidato.id} />
                          <select 
                            name="status" 
                            defaultValue={candidato.status}
                            className={`text-xs font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${
                              candidato.status === 'RESERVA' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              candidato.status === 'CONVOCADO' ? 'bg-green-100 text-green-800 border-green-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            <option value="RESERVA" className="bg-white text-gray-900">Na Reserva</option>
                            <option value="CONVOCADO" className="bg-white text-gray-900">Convocado</option>
                            <option value="REJEITADO" className="bg-white text-gray-900">Rejeitado</option>
                          </select>
                          <button type="submit" className="text-[10px] text-blue-600 hover:underline">Atualizar</button>
                        </form>
                      </td>

                      {/* BOTÕES DE AÇÃO: LÁPIS (EDITAR) E LIXEIRA (EXCLUIR) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          
                          {/* Botão de Editar (Sobe os dados pro form) */}
                          <Link 
                            href={`/recrutamento?editar=${candidato.id}`} 
                            scroll={false}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors shadow-sm"
                            title="Editar Dados"
                          >
                            <Pencil size={16} />
                          </Link>

                          {/* Botão de Excluir */}
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