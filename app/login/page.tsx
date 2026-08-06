// Arquivo: app/login/page.tsx
"use client";

import { useState } from "react";
import { fazerLogin } from "../actions/auth";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    const formData = new FormData(e.currentTarget);
    const res = await fazerLogin(formData);
    
    if (res?.erro) {
      setErro(res.erro);
      setCarregando(false);
    } else if (res?.sucesso) {
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-100">
        
        <div className="flex flex-col items-center text-center space-y-3">
          <img 
            src="/logo.jpg" 
            alt="Logo FASE" 
            className="w-16 h-16 object-contain rounded-2xl bg-slate-50 p-1.5 border border-slate-200 shadow-sm" 
          />
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">RECURSOS HUMANOS</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">FUNDAÇÃO FASE-MA</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CAMPO DE E-MAIL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="seu.email@fase.ma.gov.br" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* CAMPO DE SENHA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                name="senha" 
                required 
                placeholder="Digite sua senha..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Primeiro acesso? Digite qualquer e-mail e a senha: <strong className="text-slate-600">fase2026</strong></p>
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center">
              {erro}
            </div>
          )}

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-2"
          >
            {carregando ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Entrar no Sistema <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">Acesso restrito a colaboradores autorizados da FASE-MA.</p>
        </div>

      </div>
    </div>
  );
}