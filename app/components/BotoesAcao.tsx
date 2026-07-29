// Arquivo: app/components/BotoesAcao.tsx
"use client";

import { Pencil, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { atualizarCargo, excluirCargo, excluirLotacao, atualizarLotacao } from "../actions/cargos-lotacoes";

export default function BotoesAcao({ id, nomeAntigo, tipo }: { id: string, nomeAntigo: string, tipo: 'CARGO' | 'LOTACAO' }) {
  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState(nomeAntigo);

  const handleSalvar = async () => {
    if (tipo === 'CARGO') await atualizarCargo(id, novoNome);
    if (tipo === 'LOTACAO') await atualizarLotacao(id, novoNome);
    setEditando(false);
  };

  const handleExcluir = async () => {
    if (window.confirm(`Tem certeza que deseja excluir [ ${nomeAntigo} ] definitivamente? Esta ação será registrada na auditoria.`)) {
      if (tipo === 'CARGO') await excluirCargo(id, nomeAntigo);
      if (tipo === 'LOTACAO') await excluirLotacao(id, nomeAntigo);
    }
  };

  if (editando) {
    return (
      <div className="flex items-center gap-2">
        <input 
          value={novoNome} 
          onChange={(e) => setNovoNome(e.target.value)} 
          className="border border-blue-400 p-1.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-inner flex-1"
          autoFocus
        />
        <button onClick={handleSalvar} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm transition-colors" title="Salvar">
          <Check size={16} />
        </button>
        <button onClick={() => { setEditando(false); setNovoNome(nomeAntigo); }} className="p-1.5 bg-slate-400 hover:bg-slate-500 text-white rounded-md shadow-sm transition-colors" title="Cancelar">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <button onClick={() => setEditando(true)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors shadow-sm" title="Editar Nome">
        <Pencil size={16} />
      </button>
      <button onClick={handleExcluir} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors shadow-sm" title="Excluir Definitivamente">
        <Trash2 size={16} />
      </button>
    </div>
  );
}