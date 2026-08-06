// Arquivo: app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { getSessaoUsuario } from "./actions/auth";
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  Clock, FileText, BarChart3, Shield, UserPlus, LogOut 
} from "lucide-react";
import LoginPage from "./login/page";

export const metadata = {
  title: 'FASE-MA RH Sistema',
  description: 'Sistema de Gestão de Recursos Humanos',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessaoUsuario();
  const logado = sessao !== null;

  // Se não estiver logado, exibe APENAS a página de login, sem menu lateral nem estrutura do sistema
  if (!logado) {
    return (
      <html lang="pt-BR">
        <body className="bg-slate-900 text-slate-900 antialiased m-0 p-0">
          <LoginPage />
        </body>
      </html>
    );
  }

  // Se estiver logado, exibe o sistema completo com o menu lateral claro
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <div className="min-h-screen flex flex-col md:flex-row">
          
          {/* MENU LATERAL EM MODO CLARO */}
          <aside className="w-full md:w-64 bg-white text-slate-700 flex flex-col justify-between shrink-0 border-r border-slate-200 shadow-sm">
            <div>
              {/* Logo / Topo */}
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <img 
                  src="/logo.jpg" 
                  alt="Logo FASE" 
                  className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200" 
                />
                <div>
                  <h1 className="font-bold text-slate-800 text-sm">RECURSOS HUMANOS</h1>
                  <p className="text-xs text-slate-400">FASE-MA</p>
                </div>
              </div>

              {/* Links de Navegação */}
              <nav className="p-3 space-y-1 text-sm font-medium">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <LayoutDashboard size={18} /> Início
                </Link>
                <Link href="/servidores" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Users size={18} /> Servidores
                </Link>
                <Link href="/cargos-lotacoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Briefcase size={18} /> Cargos e Lotações
                </Link>
                <Link href="/ferias" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Calendar size={18} /> Controle de Férias
                </Link>
                <Link href="/ausencias" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Clock size={18} /> Ausências e Licenças
                </Link>
                <Link href="/folha" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <FileText size={18} /> Folha de Pagamento
                </Link>
                <Link href="/relatorios" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <BarChart3 size={18} /> Relatórios
                </Link>
                <Link href="/gestao-acessos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Shield size={18} /> Gestão de Acessos
                </Link>
                <Link href="/recrutamento" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <UserPlus size={18} /> Recrutamento
                </Link>
              </nav>
            </div>

            {/* Rodapé do Menu */}
            {/* Rodapé do Menu */}
            <div className="p-3 border-t border-slate-100">
              {/* Mudamos de Link para tag <a> para forçar recarregamento limpo */}
              <a href="/sair" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
                <LogOut size={18} /> Sair / Desconectar
              </a>
            </div>
          </aside>

          {/* CONTEÚDO PRINCIPAL */}
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}