// Arquivo: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Users, BarChart3, LogOut, Home } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FASE-MA | Sistema RH",
  description: "Sistema de Gestão de Recursos Humanos da FASE-MA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex`}>
        
        {/* MENU LATERAL */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
          
          {/* TOPO DO MENU COM A LOGO OFICIAL */}
          <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center">
            <div className="bg-white p-2 rounded-xl mb-3 shadow-md">
              <img src="/logo.jpg" alt="FASE-MA" className="w-32 rounded-lg" />
            </div>
            <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">Recursos Humanos</p>
          </div>
          
          {/* NAVEGAÇÃO */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Home size={20} />
              <span className="font-medium">Início</span>
            </Link>
            <Link href="/servidores" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Users size={20} />
              <span className="font-medium">Servidores</span>
            </Link>
            <Link href="/relatorios" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <BarChart3 size={20} />
              <span className="font-medium">Relatórios</span>
            </Link>
          </nav>

          {/* RODAPÉ DO MENU LATERAL */}
          <div className="p-4 border-t border-slate-800">
            <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Sair / Desconectar</span>
            </Link>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL DAS PÁGINAS */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
        
      </body>
    </html>
  );
}