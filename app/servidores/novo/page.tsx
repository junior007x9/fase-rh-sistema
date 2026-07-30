// Arquivo: app/servidores/novo/page.tsx
"use client";

import { cadastrarServidor } from "../../actions/servidores";
import { User, FileText, Briefcase, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NovoServidorPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErro("");
    
    try {
      await cadastrarServidor(formData);
    } catch (error: any) {
      // O Next.js usa um erro interno para fazer o redirect. Não podemos bloqueá-lo!
      if (error?.message && error.message.includes("NEXT_REDIRECT")) {
        throw error; 
      }
      
      // Se for um erro real (ex: CPF já existe), exibe na tela
      setErro(error.message || "Ocorreu um erro ao salvar o servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Servidor</h1>
          <p className="text-gray-500 mt-1">Preencha os dados de admissão do colaborador.</p>
        </div>
        <Link href="/servidores" className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
          Voltar
        </Link>
      </header>

      {erro && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 font-medium">
          {erro}
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        
        {/* SESSÃO 1: DADOS PESSOAIS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <User className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Informações Básicas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nome" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Social (Opcional)</label>
              <input type="text" name="nomeSocial" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
              <input type="date" name="dataNascimento" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="text" name="telefone" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo/Pessoal *</label>
              <input type="email" name="email" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
        </section>

        {/* SESSÃO 2: PERFIL E DIVERSIDADE */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <Heart className="text-pink-600" />
            <h2 className="text-xl font-semibold text-gray-800">Perfil e Diversidade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero *</label>
              <select name="genero" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione...</option>
                <option value="FEMININO">Feminino</option>
                <option value="MASCULINO">Masculino</option>
                <option value="NAO_BINARIO">Não Binário</option>
                <option value="OUTRO">Outro / Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orientação Sexual *</label>
              <select name="orientacaoSexual" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione...</option>
                <option value="HETEROSSEXUAL">Heterossexual</option>
                <option value="HOMOSSEXUAL">Homossexual</option>
                <option value="BISSEXUAL">Bissexual</option>
                <option value="OUTRO">Outro / Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Étnico/Cor *</label>
              <select name="grupoEtnico" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione...</option>
                <option value="BRANCA">Branca</option>
                <option value="PRETA">Preta</option>
                <option value="PARDA">Parda</option>
                <option value="AMARELA">Amarela</option>
                <option value="INDIGENA">Indígena</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
              <select name="estadoCivil" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecione...</option>
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Sanguíneo</label>
              <select name="tipoSanguineo" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Opcional...</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
          </div>
        </section>

        {/* SESSÃO 3: DOCUMENTOS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <FileText className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Documentação</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <input type="text" name="cpf" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
              <input type="text" name="rg" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Eleitoral *</label>
              <input type="text" name="tituloEleitoral" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIS/PASEP (Opcional se estagiário)</label>
              <input type="text" name="pisPasep" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
        </section>

        {/* SESSÃO 4: VÍNCULO INSTITUCIONAL */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Vínculo Institucional</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vínculo *</label>
              <select name="vinculo" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="EFETIVO">Efetivo</option>
                <option value="CONTRATADO">Contratado</option>
                <option value="COMISSIONADO">Comissionado</option>
                <option value="ESTAGIARIO">Estagiário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão *</label>
              <input type="date" name="dataAdmissao" required className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            disabled={loading} 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Cadastrar Servidor"}
          </button>
        </div>
      </form>
    </div>
  );
}