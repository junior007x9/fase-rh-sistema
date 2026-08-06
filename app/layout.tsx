// Arquivo: app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { getSessaoUsuario } from "./actions/auth";
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  Clock, FileText, BarChart3, Shield, UserPlus, LogOut,
  Banknote
} from "lucide-react";
import LoginPage from "./login/page";

export const metadata = {
  title: 'FASE-MA RH Sistema',
  description: 'Sistema de Gestão de Recursos Humanos',
};

// ARRAY DE LINKS ORGANIZADO PARA COMPUTADOR E CELULAR
const MENU_LINKS = [
  { href: "/", icon: LayoutDashboard, labelFull: "Início", labelMobile: "Início" },
  { href: "/servidores", icon: Users, labelFull: "Servidores", labelMobile: "Servidores" },
  { href: "/cargos-lotacoes", icon: Briefcase, labelFull: "Cargos e Lotações", labelMobile: "Lotações" },
  { href: "/ferias", icon: Calendar, labelFull: "Controle de Férias", labelMobile: "Férias" },
  { href: "/ausencias", icon: Clock, labelFull: "Ausências e Licenças", labelMobile: "Ausências" },
  { href: "/folha", icon: Banknote, labelFull: "Folha de Pagamento", labelMobile: "Folha" },
  { href: "/importacao", icon: FileText, labelFull: "Importar Planilha", labelMobile: "Planilha" },
  { href: "/relatorios", icon: BarChart3, labelFull: "Relatórios", labelMobile: "Relatórios" },
  { href: "/gestao-acessos", icon: Shield, labelFull: "Gestão de Acessos", labelMobile: "Acessos" },
  { href: "/recrutamento", icon: UserPlus, labelFull: "Recrutamento", labelMobile: "Recrutar" },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // VERIFICA SE O USUÁRIO ESTÁ LOGADO
  const sessao = await getSessaoUsuario();
  const logado = sessao !== null;

  // SE NÃO ESTIVER LOGADO, EXIBE APENAS A TELA DE LOGIN
  if (!logado) {
    return (
      <html lang="pt-BR">
        <body className="bg-slate-900 text-slate-900 antialiased m-0 p-0">
          <LoginPage />
        </body>
      </html>
    );
  }

  // SE ESTIVER LOGADO, EXIBE O SISTEMA
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* ==================================================== */}
          {/* CABEÇALHO SUPERIOR (APARECE APENAS NO CELULAR) */}
          {/* ==================================================== */}
          <header className="md:hidden bg-white border-b border-slate-200 p-3 flex justify-between items-center z-20 shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Logo FASE" className="w-8 h-8 object-contain rounded-lg bg-slate-50 p-0.5 border border-slate-200" />
              <h1 className="font-extrabold text-slate-800 text-sm tracking-tight">RH FASE-MA</h1>
            </div>
            {/* Usando tag <a> para limpar o cache ao sair */}
            <a href="/sair" className="text-red-600 p-2 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center">
              <LogOut size={18} />
            </a>
          </header>

          {/* ==================================================== */}
          {/* MENU LATERAL (APARECE APENAS NO COMPUTADOR / TABLET) */}
          {/* ==================================================== */}
          <aside className="hidden md:flex w-64 bg-white text-slate-700 flex-col justify-between shrink-0 border-r border-slate-200 shadow-sm z-20 h-full">
            <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
              {/* Topo do Menu Lateral */}
              <div className="p-5 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white z-10">
                <img src="/logo.jpg" alt="Logo FASE" className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200" />
                <div>
                  <h1 className="font-bold text-slate-800 text-sm">RECURSOS HUMANOS</h1>
                  <p className="text-xs text-slate-400">FASE-MA</p>
                </div>
              </div>

              {/* Links do Menu Lateral */}
              <nav className="p-3 space-y-1 text-sm font-medium">
                {MENU_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Icon size={18} /> {link.labelFull}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Rodapé do Menu Lateral (Sair) */}
            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
              {/* Usando tag <a> em vez de Link para forçar o recarregamento total sem cache */}
              <a href="/sair" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
                <LogOut size={18} /> Sair / Desconectar
              </a>
            </div>
          </aside>

          {/* ==================================================== */}
          {/* CONTEÚDO PRINCIPAL (ONDE FICAM AS PÁGINAS) */}
          {/* ==================================================== */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {children}
          </main>

          {/* ==================================================== */}
          {/* NAVEGAÇÃO INFERIOR ESTILO APP (APARECE SÓ NO CELULAR) */}
          {/* ==================================================== */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex overflow-x-auto items-center px-2 py-1 gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {MENU_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center p-2 min-w-[76px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Icon size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">{link.labelMobile}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

        </div>
      </body>
    </html>
  );
}