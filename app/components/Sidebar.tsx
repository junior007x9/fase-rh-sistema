// Arquivo: app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PieChart, LogOut, Shield, Briefcase } from "lucide-react";
import { sairDoSistema } from "../actions/logout";

export default function Sidebar() {
  const pathname = usePathname();

  // Regra de Ouro: Se a URL for /login, não renderiza o menu
  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
      {/* TOPO DO MENU */}
      <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center">
        <div className="bg-white p-2 w-full flex justify-center rounded-xl mb-3 shadow-md">
          <img src="/logo.jpg" alt="FASE-MA" className="w-32 rounded-lg" />
        </div>
        <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">Recursos Humanos</p>
      </div>
      
      {/* NAVEGAÇÃO */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              <span className="font-medium">Início</span>
            </Link>
          </li>
          <li>
            <Link href="/servidores" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Users size={20} />
              <span className="font-medium">Servidores</span>
            </Link>
          </li>
          <li>
            <Link href="/relatorios" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <PieChart size={20} />
              <span className="font-medium">Relatórios</span>
            </Link>
          </li>
          <li>
            <Link href="/usuarios" className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-400 hover:bg-slate-800 hover:text-purple-300 transition-colors">
              <Shield size={20} />
              <span className="font-medium">Gestão de Acessos</span>
            </Link>
          </li>
          <li>
            <Link href="/recrutamento" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Briefcase size={20} />
              <span className="font-medium">Recrutamento</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* RODAPÉ COM BOTÃO DE LOGOUT REAL */}
      <div className="p-4 border-t border-slate-800">
        <form action={sairDoSistema}>
          <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left cursor-pointer">
            <LogOut size={20} />
            <span className="font-medium">Sair / Desconectar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}