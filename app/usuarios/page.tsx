// Arquivo: app/usuarios/page.tsx
import { db } from "../../db/index";
import { usuarios } from "../../db/schema";
import { getSessaoUsuario } from "../actions/auth";
import { cadastrarUsuario } from "../actions/usuarios";
import { redirect } from "next/navigation";
import { Shield, ShieldAlert, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GestaoUsuariosPage() {
  // PROTEÇÃO DE ROTA: Apenas Diretoria entra aqui
  const sessao = await getSessaoUsuario();
  if (!sessao || sessao.role !== "DIRETORIA") {
    redirect("/"); // Expulsa de volta pro Dashboard
  }

  // Busca a lista de usuários cadastrados
  const listaUsuarios = await db.select({
    id: usuarios.id,
    nome: usuarios.nome,
    email: usuarios.email,
    role: usuarios.role,
    criadoEm: usuarios.criadoEm,
  }).from(usuarios);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Controle de Acessos</h1>
        <p className="text-gray-500 mt-1">Gerencie quem pode acessar o sistema e seus níveis de permissão.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULÁRIO DE NOVO USUÁRIO */}
        <div className="lg:col-span-1">
          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <UserPlus className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Novo Acesso</h2>
            </div>
            
            <form action={cadastrarUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" name="nome" required className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
                <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                <input type="password" name="senha" required className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
                <select name="role" required className="w-full border border-gray-300 rounded-md p-2 bg-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="RH">Recursos Humanos (RH)</option>
                  <option value="DIRETORIA">Diretoria (Admin Total)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">O RH não pode acessar configurações do sistema.</p>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg font-bold transition-colors mt-2">
                Criar Usuário
              </button>
            </form>
          </section>
        </div>

        {/* LISTA DE USUÁRIOS */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-600">Usuário</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">E-mail</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Nível</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{u.nome}</td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4">
                      {u.role === "DIRETORIA" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          <Shield size={12} /> Diretoria
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          <ShieldAlert size={12} /> RH
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        
      </div>
    </div>
  );
}