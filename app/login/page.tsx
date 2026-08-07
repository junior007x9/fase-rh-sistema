// Arquivo: app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <-- Importamos o roteador nativo do Next.js
import { fazerLogin } from "../actions/auth";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter(); // <-- Inicializamos o roteador

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
      // Navegação suave e instantânea. A tela de loading vai continuar girando
      // até que a página principal (/) seja renderizada e assuma o controle.
      router.replace("/"); 
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden animate-in fade-in duration-700">
      
      {/* ELEMENTOS DECORATIVOS DE FUNDO (Bolinhas desfocadas) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* LADO ESQUERDO: BRANDING / IMAGEM */}
        <div className="w-full md:w-5/12 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Efeito de fundo no lado escuro */}
          <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <img 
                src="/logo.jpg" 
                alt="Logo FASE" 
                className="w-14 h-14 object-contain rounded-xl bg-white p-1" 
              />
              <span className="text-2xl font-black tracking-widest text-white">FASE<span className="text-blue-400">MA</span></span>
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Gestão <br />Inteligente de <br /><span className="text-blue-400">Recursos Humanos</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Acesse a plataforma centralizada para gerenciamento de servidores, folhas de pagamento, férias e lotações com total segurança.
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} Sistema RH FASE-MA. Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DE LOGIN */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header Mobile (Aparece só em telas pequenas) */}
            <div className="md:hidden flex flex-col items-center gap-3 mb-10 justify-center text-center">
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

            <div className="mb-10 text-center md:text-left hidden md:block">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Bem-vindo de volta!</h2>
              <p className="text-slate-500 text-sm font-medium">Por favor, insira suas credenciais para continuar.</p>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail Profissional</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="seu.email@fase.ma.gov.br" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-bold placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Senha</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    name="senha"
                    required
                    placeholder="••••••••" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-bold placeholder:text-slate-400 tracking-widest"
                  />
                </div>
              </div>

              {erro && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center animate-in zoom-in-95 duration-200">
                  {erro}
                </div>
              )}

              <button 
                type="submit" 
                disabled={carregando}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 mt-2"
              >
                {carregando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>Entrar no Sistema <ArrowRight size={18} /></>
                )}
              </button>

            </form>

            {/* Aviso / Footer do Formulário */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                Acesso restrito a colaboradores autorizados da FASE-MA. O uso indevido está sujeito a penalidades.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}