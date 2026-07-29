// Arquivo: app/auditoria/page.tsx
import { db } from "../../db/index";
import { auditoriaLogs } from "../../db/schema";
import { desc } from "drizzle-orm";
import { getSessaoUsuario } from "../actions/auth";
import { ShieldAlert, History, UserX } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AuditoriaPage() {
  // 1. Barreira de Segurança: Só DIRETORIA entra
  const sessao = await getSessaoUsuario();
  if (!sessao || sessao.role !== "DIRETORIA") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <UserX size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Acesso Negado</h1>
        <p className="text-slate-500 mt-2">Apenas usuários com perfil de DIRETORIA podem ver os logs de auditoria.</p>
      </div>
    );
  }

  // 2. Busca os últimos 100 eventos, do mais recente pro mais antigo
  const logs = await db.select().from(auditoriaLogs).orderBy(desc(auditoriaLogs.criadoEm)).limit(100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-red-500/20 p-3 rounded-xl backdrop-blur-sm border border-red-500/30">
            <ShieldAlert size={28} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Auditoria do Sistema</h1>
        </div>
        <p className="text-slate-300 mt-2 text-lg">
          Rastreamento em tempo real de todas as modificações e exclusões feitas no sistema.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <History className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Últimas Atividades</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Data e Hora</th>
                <th className="p-4 font-semibold">Usuário Responsável</th>
                <th className="p-4 font-semibold">Ação</th>
                <th className="p-4 font-semibold">Módulo (Tabela)</th>
                <th className="p-4 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado ainda.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap">{new Date(log.criadoEm!).toLocaleString('pt-BR')}</td>
                    <td className="p-4 font-medium text-slate-900">{log.usuarioEmail}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.acao === 'CRIAR' ? 'bg-green-100 text-green-700' :
                        log.acao === 'EDITAR' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-4">{log.tabelaAfetada}</td>
                    <td className="p-4 max-w-xs truncate text-slate-500" title={log.detalhes || ""}>
                      {log.detalhes || "Sem detalhes adicionais"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}