export const dynamic = 'force-dynamic'; // Fim do cache!

import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { Shield, PlusCircle } from "lucide-react";
import BotaoExcluir from "../components/BotaoExcluir";
import { excluirUsuario } from "../actions/usuarios";

export default async function GestaoAcessosPage() {
  const listaUsuarios = await db.select().from(usuarios);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Acessos</h1>
        </div>
        <p className="text-indigo-100 mt-2 text-lg">Controle de perfis e acessos administrativos ao sistema.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Usuários do Sistema ({listaUsuarios.length})</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-colors">
            <PlusCircle size={16} /> Novo Usuário
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Nível de Acesso (Role)</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaUsuarios.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum usuário cadastrado.</td></tr>
              ) : (
                listaUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{u.nome}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'DIRETORIA' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <BotaoExcluir id={u.id} nomeRegistro={u.email} acaoExcluir={excluirUsuario as any} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}