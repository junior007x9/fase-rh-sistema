// Arquivo: app/servidores/novo/page.tsx
"use client";

import { cadastrarServidor } from "../../actions/servidor";
import { User, FileText, Briefcase } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

// Componente de botão para mostrar "Salvando..." durante o processo
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
    >
      {pending ? "Salvando..." : "Cadastrar Servidor"}
    </button>
  );
}

export default function NovoServidorPage() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Servidor</h1>
          <p className="text-gray-500 mt-1">Preencha os dados obrigatórios para admissão.</p>
        </div>
        <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
          Voltar
        </Link>
      </header>

      <form action={cadastrarServidor} className="space-y-8">
        
        {/* SESSÃO 1: DADOS PESSOAIS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <User className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Dados Pessoais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nome" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Social</label>
              <input type="text" name="nomeSocial" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
              <input type="date" name="dataNascimento" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="text" name="telefone" required placeholder="(00) 00000-0000" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          {/* DADOS DE DIVERSIDADE E IDENTIFICAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Étnico *</label>
              <select name="grupoEtnico" required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="BRANCO">Branco</option>
                <option value="NEGRO">Negro</option>
                <option value="PARDO">Pardo</option>
                <option value="AMARELO">Amarelo</option>
                <option value="INDIGENA">Indígena</option>
                <option value="NAO_DECLARADO">Não Declarado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil *</label>
              <select name="estadoCivil" required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="SOLTEIRO">Solteiro(a)</option>
                <option value="CASADO">Casado(a)</option>
                <option value="DIVORCIADO">Divorciado(a)</option>
                <option value="VIUVO">Viúvo(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero *</label>
              <select name="genero" required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro / Não Binário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orientação Sexual *</label>
              <select name="orientacaoSexual" required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="HETEROSSEXUAL">Heterossexual</option>
                <option value="HOMOSSEXUAL">Homossexual</option>
                <option value="BISSEXUAL">Bissexual</option>
                <option value="OUTRO">Outro / Prefiro não dizer</option>
              </select>
            </div>
          </div>
        </section>

        {/* SESSÃO 2: DOCUMENTOS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <FileText className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Documentação</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <input type="text" name="cpf" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RG *</label>
              <input type="text" name="rg" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Eleitoral *</label>
              <input type="text" name="tituloEleitoral" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIS/PASEP (Opcional)</label>
              <input type="text" name="pisPasep" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Sanguíneo</label>
              <select name="tipoSanguineo" className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </section>

        {/* SESSÃO 3: DADOS INSTITUCIONAIS */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Dados Institucionais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vínculo com a Instituição *</label>
              <select name="vinculo" required className="w-full border border-gray-300 rounded-md p-2 bg-white">
                <option value="">Selecione...</option>
                <option value="EFETIVO">Efetivo</option>
                <option value="CONTRATADO">Contratado</option>
                <option value="COMISSIONADO">Comissionado</option>
                <option value="ESTAGIARIO">Estagiário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão *</label>
              <input type="date" name="dataAdmissao" required className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}