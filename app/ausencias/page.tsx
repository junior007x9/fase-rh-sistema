// Arquivo: app/ausencias/page.tsx
import { db } from "../../db/index";
import { eventosAusencia, dadosPessoais } from "../../db/schema";
import { eq } from "drizzle-orm";
import { Clock, PlusCircle } from "lucide-react";

export default async function AusenciasPage() {
  let listaAusencias: any[] = [];
  let listaServidores: any[] = [];

  try {
    // Busca os dados pessoais dos servidores para listar no select
    listaServidores = await db.select().from(dadosPessoais);
    
    // Busca as ausências (eventosAusencia) conectadas ao nome do servidor (dadosPessoais)
    listaAusencias = await db
      .select({
        id: eventosAusencia.id,
        tipo: eventosAusencia.tipoAusencia,
        inicio: eventosAusencia.dataInicio,
        fim: eventosAusencia.dataFim,
        motivo: eventosAusencia.observacao,
        servidorNome: dadosPessoais.nome,
      })
      .from(eventosAusencia)
      .leftJoin(dadosPessoais, eq(eventosAusencia.servidorId, dadosPessoais.servidorId));
  } catch (error) {
    console.error("Erro ao carregar ausências:", error);
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> Ausências e Licenças
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gerenciamento de afastamentos, licenças médicas e premiações.</p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-600" /> Registrar Afastamento
          </h2>
          
          <form action="/api/ausencias" method="POST" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servidor</label>
              <select name="servidorId" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione o servidor...</option>
                {listaServidores.map((serv: any) => (
                  <option key={serv.servidorId} value={serv.servidorId}>{serv.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ausência</label>
              <select name="tipoAusencia" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="SAUDE">Licença Saúde / Médica</option>
                <option value="LICENCA_PREMIO">Licença Prêmio</option>
                <option value="LICENCA_MATERNIDADE">Licença Maternidade</option>
                <option value="FERIAS">Férias</option>
                <option value="AFASTAMENTO_SUPERIOR_15">Afastamento Superior a 15 Dias</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                <input type="date" name="dataInicio" required className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                <input type="date" name="dataFim" required className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Observações</label>
              <textarea name="observacao" rows={3} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Detalhes do afastamento..."></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm cursor-pointer">
              Salvar Registro
            </button>
          </form>
        </div>

        {/* TABELA DE REGISTROS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Histórico de Afastamentos</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Servidor</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Início</th>
                  <th className="pb-3 font-semibold">Fim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {listaAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Nenhum afastamento registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  listaAusencias.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-800">{item.servidorNome || "Servidor não encontrado"}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold border border-amber-100">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="py-3">{item.inicio}</td>
                      <td className="py-3">{item.fim}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}