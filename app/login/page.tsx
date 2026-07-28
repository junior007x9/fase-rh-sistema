// Arquivo: app/login/page.tsx
"use client";

import { login } from "../../actions/auth";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setErro("");
    try {
      await login(formData);
      router.push("/");
    } catch (error: any) {
      setErro(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FASE - MA</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Recursos Humanos</p>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">{erro}</div>}

        <form action={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
            <input type="email" name="email" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@fase.ma.gov.br" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" name="senha" required className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors shadow-md disabled:opacity-50">
            {loading ? "Entrando..." : "Acessar Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}