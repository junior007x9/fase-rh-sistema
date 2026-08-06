// Arquivo: app/gestao-acessos/novo/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { criarUsuario } from "../../actions/usuarios";
import { ArrowLeft, Save, Loader2, Shield } from "lucide-react";

export default function NovoUsuarioPage() {
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    const formData = new FormData(e.currentTarget);
    await criarUsuario(formData);
    // A ação no backend fará o redirect automaticamente
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4">
        <Link href="/gestao-acessos" className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            Novo Usuário Administrativo
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Crie um novo acesso ao sistema FASE-MA.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nome Completo</label>
          <input type="text" name="nome" required placeholder="Ex: João da Silva" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">E-mail de Acesso</label>
          <input type="email" name="email" required placeholder="joao@fase.ma.gov.br" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Senha Provisória</label>
          <input type="password" name="senha" required placeholder="Digite uma senha forte" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nível de Acesso</label>
          <select name="role" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-700">
            <option value="RH">Analista de RH (Padrão)</option>
            <option value="DIRETORIA">Diretoria (Acesso Total)</option>
            <option value="AUDITORIA">Auditoria (Apenas Visualização)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={carregando} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 min-w-[160px]">
            {carregando ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Salvar Usuário</>}
          </button>
        </div>

      </form>
    </div>
  );
}