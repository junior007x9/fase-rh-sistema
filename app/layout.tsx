// Arquivo: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Users, LayoutDashboard, CalendarDays, UserPlus, Briefcase, FileText } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema RH - FASE MA",
  description: "Sistema de Recursos Humanos da Fundação do Sistema Socioeducativo do Maranhão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex h-screen overflow-hidden`}>
        
        {/* Menu Lateral (Sidebar) */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-blue-400">FASE - MA</h1>
            <p className="text-xs text-slate-400 mt-1">Sistema de RH Seguro</p>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-4">
              <li>
                <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/servidores" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <Users size={20} /> Servidores
                </Link>
              </li>
              <li>
                <Link href="/cargos-lotacoes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <Briefcase size={20} /> Cargos e Lotações
                </Link>
              </li>
              <li>
                <Link href="/ferias" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <CalendarDays size={20} /> Férias e Ausências
                </Link>
              </li>
              <li>
                <Link href="/recrutamento" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <UserPlus size={20} /> Recrutamento
                </Link>
              </li>
              <li>
                <Link href="/relatorios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <FileText size={20} /> Relatórios
                </Link>
              </li>
              <li>
                <Link href="/usuarios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-purple-400">
                  <Shield size={20} /> Gestão de Acessos
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Conteúdo Principal das Páginas */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </body>
    </html>
  );
}