// Arquivo: app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PieChart, LogOut, Shield, Briefcase, MapPin, Calendar, Clock, Calculator } from "lucide-react";
import { sairDoSistema } from "../actions/logout";

export default function Sidebar() {
  const pathname = usePathname();

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
      
      {/* NAVEGAÇÃO COMPLETA */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        <ul className="space-y-1">
          <li>
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <LayoutDashboard size={18} />
              <span className="font-medium text-sm">Início</span>
            </Link>
          </li>
          <li>
            <Link href="/servidores" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Users size={18} />
              <span className="font-medium text-sm">Servidores</span>
            </Link>
          </li>
          {/* CARGOS E LOTAÇÕES */}
          <li>
            <Link href="/cargos-lotacoes" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <MapPin size={18} />
              <span className="font-medium text-sm">Cargos e Lotações</span>
            </Link>
          </li>
          {/* FÉRIAS */}
          <li>
            <Link href="/ferias" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Calendar size={18} />
              <span className="font-medium text-sm">Controle de Férias</span>
            </Link>
          </li>
          {/* AUSÊNCIAS / LICENÇAS */}
          <li>
            <Link href="/ausencias" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Clock size={18} />
              <span className="font-medium text-sm">Ausências e Licenças</span>
            </Link>
          </li>
          {/* FOLHA DE PAGAMENTO */}
          <li>
            <Link href="/folha" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors">
              <Calculator size={18} />
              <span className="font-medium text-sm">Folha de Pagamento</span>
            </Link>
          </li>
          {/* RELATÓRIOS */}
          <li>
            <Link href="/relatorios" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <PieChart size={18} />
              <span className="font-medium text-sm">Relatórios</span>
            </Link>
          </li>
          {/* GESTÃO DE ACESSOS */}
          <li>
            <Link href="/usuarios" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-purple-400 hover:bg-slate-800 hover:text-purple-300 transition-colors">
              <Shield size={18} />
              <span className="font-medium text-sm">Gestão de Acessos</span>
            </Link>
          </li>
          {/* RECRUTAMENTO */}
          <li>
            <Link href="/recrutamento" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Briefcase size={18} />
              <span className="font-medium text-sm">Recrutamento</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* RODAPÉ */}
      <div className="p-4 border-t border-slate-800">
        <form action={sairDoSistema}>
          <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left cursor-pointer">
            <LogOut size={18} />
            <span className="font-medium text-sm">Sair / Desconectar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}