// Arquivo: app/cargos-lotacoes/page.tsx
import { db } from "../../db/index";
import { cargos, lotacoes } from "../../db/schema";
import { Briefcase, MapPin, PlusCircle } from "lucide-react";
import BotoesAcao from "../components/BotoesAcao";
import { criarCargo, criarLotacao } from "../actions/cargos-lotacoes";

export default async function CargosLotacoesPage() {
  const listaCargos = await db.select().from(cargos);
  const listaLotacoes = await db.select().from(lotacoes);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Briefcase size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Cargos e Lotações</h1>
        </div>
        <p className="text-blue-100 mt-2 text-lg">
          Gerencie a estrutura organizacional. Todas as alterações são monitoradas via auditoria.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* ================================== */}
        {/* COLUNA 1: CARGOS */}
        {/* ================================== */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={22} /> 
              Cargos Registrados ({listaCargos.length})
            </h2>
            
            <form action={criarCargo as any} className="flex gap-2">
              <input name="nome" placeholder="Nome do novo cargo..." required className="flex-1 border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-colors cursor-pointer">
                <PlusCircle size={18} /> Adicionar
              </button>
            </form>
          </div>
          
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-100">
                {listaCargos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-medium text-slate-700">{c.nome}</td>
                    <td className="p-4 text-right w-40 opacity-50 group-hover:opacity-100 transition-opacity">
                      <BotoesAcao id={c.id} nomeAntigo={c.nome} tipo="CARGO" />
                    </td>
                  </tr>
                ))}
                {listaCargos.length === 0 && (
                  <tr><td colSpan={2} className="p-8 text-center text-slate-400">Nenhum cargo cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================== */}
        {/* COLUNA 2: LOTAÇÕES */}
        {/* ================================== */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-emerald-600" size={22} /> 
              Lotações Registradas ({listaLotacoes.length})
            </h2>
            
            <form action={criarLotacao as any} className="flex gap-2">
              <input name="sigla" placeholder="Sigla (Ex: RH)" required className="w-28 border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase" />
              <input name="nome" placeholder="Nome da lotação..." required className="flex-1 border border-slate-300 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-colors cursor-pointer">
                <PlusCircle size={18} /> Adicionar
              </button>
            </form>
          </div>
          
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-100">
                {listaLotacoes.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-xs">{l.sigla}</span>
                        <span className="font-medium text-slate-700">{l.nome}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right w-40 opacity-50 group-hover:opacity-100 transition-opacity">
                      <BotoesAcao id={l.id} nomeAntigo={l.nome} tipo="LOTACAO" />
                    </td>
                  </tr>
                ))}
                {listaLotacoes.length === 0 && (
                  <tr><td colSpan={2} className="p-8 text-center text-slate-400">Nenhuma lotação cadastrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}