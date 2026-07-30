// Arquivo: app/folha/page.tsx
import { db } from "../../db/index";
import { servidores, dadosPessoais } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { Calculator, Calendar, Search, FileText, ChevronRight, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function formatarMoeda(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default async function FolhaPagamentoPage({ searchParams }: { searchParams: Promise<{ mesAno?: string, busca?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  // Define o mês atual como padrão se não for selecionado (ex: "08-2026")
  const dataAtual = new Date();
  const mesAtualPadrao = `${String(dataAtual.getMonth() + 1).padStart(2, '0')}-${dataAtual.getFullYear()}`;
  
  const mesAnoFiltro = resolvedSearchParams?.mesAno || mesAtualPadrao;
  const termoBusca = resolvedSearchParams?.busca || "";

  // Busca todos os servidores ativos
  const listaServidores = await db.select({
    id: servidores.id,
    matricula: servidores.matricula,
    cargo: servidores.cargo,
    lotacao: servidores.lotacao,
    remuneracaoBase: servidores.remuneracaoBase,
    nome: dadosPessoais.nome,
  })
  .from(servidores)
  .leftJoin(dadosPessoais, eq(servidores.id, dadosPessoais.servidorId))
  .where(eq(servidores.status, "ATIVO"));

  // Filtra pela busca de nome ou matrícula
  const servidoresFiltrados = listaServidores.filter(s => {
    if (!termoBusca) return true;
    const buscaLower = termoBusca.toLowerCase();
    return (s.nome?.toLowerCase().includes(buscaLower) || s.matricula?.toLowerCase().includes(buscaLower));
  });

  // Nomes dos meses para o seletor
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-200 pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h1>
            <p className="text-gray-500 mt-1">Gerencie proventos, descontos e contracheques dos servidores.</p>
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form className="flex-1 flex gap-4 w-full">
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              name="busca" 
              defaultValue={termoBusca}
              placeholder="Buscar por nome ou matrícula..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            />
          </div>

          <div className="w-64 relative flex items-center gap-2">
            <Calendar className="text-gray-400" size={20} />
            <select 
              name="mesAno" 
              defaultValue={mesAnoFiltro}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-gray-700"
            >
              {/* Gerando opções para os meses de 2024 até 2027 */}
              {[2024, 2025, 2026, 2027].map(ano => (
                nomesMeses.map((mes, index) => {
                  const valor = `${String(index + 1).padStart(2, '0')}-${ano}`;
                  return <option key={valor} value={valor}>{mes} / {ano}</option>
                })
              ))}
            </select>
          </div>

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
            Filtrar
          </button>
        </form>
      </div>

      {/* LISTA DE SERVIDORES PARA A FOLHA */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Selecione um servidor para lançar a folha</h2>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            Competência: {mesAnoFiltro}
          </span>
        </div>
        
        {servidoresFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <AlertCircle size={40} className="text-gray-300 mb-3" />
            <p>Nenhum servidor ativo encontrado para esta busca.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {servidoresFiltrados.map((srv) => (
              <div key={srv.id} className="p-4 hover:bg-emerald-50 transition-colors flex flex-col md:flex-row items-center justify-between gap-4 group">
                <div className="flex-1 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {srv.nome?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{srv.nome}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Matrícula: {srv.matricula || "S/N"} | {srv.cargo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Salário Base</p>
                    <p className="font-bold text-gray-800">{formatarMoeda(srv.remuneracaoBase)}</p>
                  </div>
                  
                  {/* BOTÃO PARA ABRIR O CONTRACHEQUE DO SERVIDOR */}
                  <Link 
                    href={`/folha/${srv.id}?mesAno=${mesAnoFiltro}`} 
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
                  >
                    <FileText size={16} /> Lançamentos <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}