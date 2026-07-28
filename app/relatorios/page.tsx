// Arquivo: app/relatorios/page.tsx
import { db } from "../../db/index";
import { 
  servidores, dadosPessoais, historicoFuncional, cargos, lotacoes 
} from "../../db/schema";
import { eq, isNull, and, sql, desc } from "drizzle-orm";
import { Briefcase, Building, Cake, PieChart, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  // 1. QUANTITATIVO GERAL
  const totalServidoresResult = await db.select({ count: sql<number>`count(*)` }).from(servidores);
  const totalAtivosResult = await db.select({ count: sql<number>`count(*)` }).from(servidores).where(eq(servidores.status, "ATIVO"));
  
  const totalServidores = totalServidoresResult[0]?.count || 0;
  const totalAtivos = totalAtivosResult[0]?.count || 0;

  // 2. RELATÓRIO: SERVIDORES POR CARGO (Apenas alocações ativas)
  const relatorioCargos = await db
    .select({
      cargo: cargos.nome,
      quantidade: sql<number>`count(${historicoFuncional.servidorId})`,
    })
    .from(historicoFuncional)
    .innerJoin(cargos, eq(historicoFuncional.cargoId, cargos.id))
    .where(isNull(historicoFuncional.dataFim)) // Garante que é o cargo atual da pessoa
    .groupBy(cargos.nome)
    // CORREÇÃO: Usando a instrução explícita de count() no Order By
    .orderBy(desc(sql`count(${historicoFuncional.servidorId})`)); 

  // 3. RELATÓRIO: SERVIDORES POR LOTAÇÃO (Apenas alocações ativas)
  const relatorioLotacoes = await db
    .select({
      lotacao: lotacoes.nome,
      sigla: lotacoes.sigla,
      quantidade: sql<number>`count(${historicoFuncional.servidorId})`,
    })
    .from(historicoFuncional)
    .innerJoin(lotacoes, eq(historicoFuncional.lotacaoId, lotacoes.id))
    .where(isNull(historicoFuncional.dataFim))
    .groupBy(lotacoes.nome, lotacoes.sigla)
    // CORREÇÃO: Usando a instrução explícita de count() no Order By
    .orderBy(desc(sql`count(${historicoFuncional.servidorId})`));

  // 4. RELATÓRIO: LISTA DE ANIVERSARIANTES (Ativos)
  const servidoresAniversario = await db
    .select({
      nome: dadosPessoais.nome,
      dataNascimento: dadosPessoais.dataNascimento, // Formato YYYY-MM-DD
      lotacao: lotacoes.nome,
    })
    .from(servidores)
    .innerJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
    .leftJoin(
      historicoFuncional, 
      and(eq(servidores.id, historicoFuncional.servidorId), isNull(historicoFuncional.dataFim))
    )
    .leftJoin(lotacoes, eq(historicoFuncional.lotacaoId, lotacoes.id))
    .where(eq(servidores.status, "ATIVO"));

  // Lógica para agrupar aniversariantes por mês (1 a 12)
  const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  // Mês atual para destacar (1 a 12)
  const mesAtual = new Date().getMonth() + 1;

  const aniversariantesPorMes = servidoresAniversario.reduce((acc, servidor) => {
    if (servidor.dataNascimento) {
      // Extrai o mês (ex: "1990-05-12" -> "05" -> 5)
      const mesNum = parseInt(servidor.dataNascimento.split("-")[1], 10);
      if (!acc[mesNum]) acc[mesNum] = [];
      
      // Extrai o dia
      const dia = servidor.dataNascimento.split("-")[2];
      acc[mesNum].push({ ...servidor, dia });
    }
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Central de Relatórios</h1>
        <p className="text-gray-500 mt-1">Consolidação de dados institucionais, lotações e aniversariantes.</p>
      </header>

      {/* CARDS DE RESUMO GERAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-600"><Users size={28} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Servidores Ativos</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalAtivos}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-slate-100 p-4 rounded-lg text-slate-600"><PieChart size={28} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Cadastros (Histórico)</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalServidores}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* RELATÓRIO: SERVIDORES POR CARGO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Servidores por Cargo</h2>
          </div>
          <div className="overflow-y-auto max-h-72">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="py-2 px-4 font-semibold text-gray-600 border-b">Cargo</th>
                  <th className="py-2 px-4 font-semibold text-gray-600 border-b text-right">Quantitativo</th>
                </tr>
              </thead>
              <tbody>
                {relatorioCargos.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-gray-500">Nenhum dado encontrado</td></tr>
                ) : (
                  relatorioCargos.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{item.cargo}</td>
                      <td className="py-3 px-4 text-gray-800 font-bold text-right text-blue-600">{item.quantidade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* RELATÓRIO: SERVIDORES POR LOTAÇÃO */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Building className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Servidores por Lotação</h2>
          </div>
          <div className="overflow-y-auto max-h-72">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="py-2 px-4 font-semibold text-gray-600 border-b">Lotação (Sigla)</th>
                  <th className="py-2 px-4 font-semibold text-gray-600 border-b text-right">Quantitativo</th>
                </tr>
              </thead>
              <tbody>
                {relatorioLotacoes.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-gray-500">Nenhum dado encontrado</td></tr>
                ) : (
                  relatorioLotacoes.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{item.lotacao} <span className="text-gray-400 text-xs">({item.sigla})</span></td>
                      <td className="py-3 px-4 text-gray-800 font-bold text-right text-blue-600">{item.quantidade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* RELATÓRIO: ANIVERSARIANTES DO MÊS */}
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Cake className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Aniversariantes (Por Mês e Lotação)</h2>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
            Mês Atual: {mesesNomes[mesAtual - 1]}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mesesNomes.map((nomeMes, index) => {
            const numMes = index + 1;
            const aniversariantesDesteMes = aniversariantesPorMes[numMes] || [];
            
            // Ordenar por dia de aniversário
            aniversariantesDesteMes.sort((a, b) => parseInt(a.dia) - parseInt(b.dia));

            return (
              <div key={numMes} className={`border rounded-lg p-4 ${numMes === mesAtual ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-slate-50 border-gray-200'}`}>
                <h3 className={`font-bold border-b pb-2 mb-3 flex justify-between items-center ${numMes === mesAtual ? 'text-blue-700' : 'text-gray-700'}`}>
                  {nomeMes}
                  <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded border">{aniversariantesDesteMes.length}</span>
                </h3>
                
                {aniversariantesDesteMes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sem aniversariantes</p>
                ) : (
                  <ul className="space-y-3">
                    {aniversariantesDesteMes.map((pessoa, i) => (
                      <li key={i} className="text-sm">
                        <p className="font-semibold text-gray-800">Dia {pessoa.dia} - {pessoa.nome}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building size={10} /> {pessoa.lotacao || "Sem lotação"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}