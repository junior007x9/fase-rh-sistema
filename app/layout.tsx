// Arquivo: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

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
        
        {/* MENU LATERAL INTELIGENTE */}
        <Sidebar />

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
        
      </body>
    </html>
  );
}