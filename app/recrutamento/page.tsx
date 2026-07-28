// Arquivo: app/recrutamento/page.tsx
import { db } from "../../db/index";
import { candidatos } from "../../db/schema";
import { desc } from "drizzle-orm";
import { UserPlus, Users, SearchCheck } from "lucide-react";
import { registrarCandidato, atualizarStatusCandidato } from "../actions/recrutamento";

export const dynamic = "force-dynamic";

export default async function RecrutamentoPage() {
  // Buscando todos os candidatos cadastrados, do mais recente para o mais antigo
  const listaCandidatos = await db.select().from(candidatos).orderBy(desc(candidatos.criadoEm));

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recrutamento e Seleção</h1>
        <p className="text-gray-500 mt-1">Gerencie currículos e o Cadastro de Reserva para futuras convocações.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DE REGISTRO DE CANDIDATO */}
        <section className="xl:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <UserPlus className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Novo Candidato</h2>
          </div>

          <form action={registrarCandidato} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nome" required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input type="text" name="cpf" required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input type="text" name="telefone" required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="pt-2 border-t mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <SearchCheck size={16} className="text-gray-500" /> Qualificação e Currículo
              </label>
              <textarea 
                name="qualificacaoCurriculo" 
                rows={3} 
                placeholder="Resumo das qualificações acadêmicas e profissionais..." 
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área de Adaptação Sugerida</label>
              <input 
                type="text" 
                name="areaAdaptacaoSugerida" 
                placeholder="Ex: Administrativo, Segurança, Saúde..." 
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-sm mt-4">
              Salvar no Cadastro de Reserva
            </button>
          </form>
        </section>

        {/* COLUNA DIREITA: CADASTRO DE RESERVA (TABELA) */}
        <section className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
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
                  <th className="py-3 px-4 font-semibold text-slate-600 w-1/4 text-center">Status / Ação</th>
                </tr>
              </thead>
              <tbody>
                {listaCandidatos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Nenhum candidato registrado no banco de talentos.
                    </td>
                  </tr>
                ) : (
                  listaCandidatos.map((candidato) => (
                    <tr key={candidato.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                      {/* Dados Básicos */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{candidato.nome}</p>
                        <p className="text-xs text-gray-500">CPF: {candidato.cpf}</p>
                      </td>
                      
                      {/* Qualificação */}
                      <td className="py-3 px-4">
                        <p className="text-gray-800 font-medium truncate w-48" title={candidato.areaAdaptacaoSugerida || "Não informada"}>
                          {candidato.areaAdaptacaoSugerida || "Não definida"}
                        </p>
                        <p className="text-xs text-gray-500 truncate w-48" title={candidato.qualificacaoCurriculo || ""}>
                          {candidato.qualificacaoCurriculo || "Sem observações"}
                        </p>
                      </td>

                      {/* Contato */}
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <p>{candidato.telefone}</p>
                        <p>{candidato.email}</p>
                      </td>

                      {/* Ações de Status */}
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
                          
                          <button type="submit" className="text-[10px] text-blue-600 hover:underline">
                            Atualizar
                          </button>
                        </form>
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