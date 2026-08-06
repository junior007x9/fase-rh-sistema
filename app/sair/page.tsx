// Arquivo: app/sair/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SairPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpa eventuais dados locais se necessário
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Redireciona para a página inicial após 1 segundo
    const timer = setTimeout(() => {
      router.push("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <Loader2 size={48} className="text-blue-600 animate-spin" />
      <h2 className="text-2xl font-bold text-slate-800">Encerrando sessão...</h2>
      <p className="text-slate-500 text-sm">Você está sendo desconectado com segurança do sistema da FASE-MA.</p>
    </div>
  );
}