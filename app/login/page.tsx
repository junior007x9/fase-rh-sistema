// Arquivo: app/login/page.tsx
"use client";

import { useState } from "react";
import { fazerLogin } from "../actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErro("");

    // Recebe a resposta suave do servidor
    const response = await fazerLogin(formData);

    // Se veio um erro, mostra na tela vermelha sem estourar o sistema
    if (response?.erro) {
      setErro(response.erro);
      setLoading(false);
    } 
    // Se foi sucesso, redireciona para o painel
    else if (response?.sucesso) {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.jpg" alt="FASE-MA" className="w-32 mb-4 rounded-lg shadow-sm" />
          <h1 className="text-2xl font-bold text-slate-800">Portal do Servidor</h1>
          <p className="text-slate-500 text-sm mt-1">Sistema de Recursos Humanos</p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100 text-center font-medium shadow-sm">
            {erro}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
            <input type="email" name="email" required className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="admin@fase.ma.gov.br" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input type="password" name="senha" required className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="••••••••" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-70">
            {loading ? "Verificando Credenciais..." : "Acessar Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}