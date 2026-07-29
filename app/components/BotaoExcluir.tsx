"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface BotaoExcluirProps {
  id: string;
  nomeRegistro: string;
  acaoExcluir: (id: string, nome: string) => Promise<{ sucesso?: boolean; erro?: string }>;
}

export default function BotaoExcluir({ id, nomeRegistro, acaoExcluir }: BotaoExcluirProps) {
  const [carregando, setCarregando] = useState(false);

  const handleExcluir = async () => {
    if (window.confirm(`ATENÇÃO: Deseja realmente excluir [ ${nomeRegistro} ]? Esta ação não pode ser desfeita e será registrada na auditoria.`)) {
      setCarregando(true);
      const resultado = await acaoExcluir(id, nomeRegistro);
      
      if (resultado?.erro) {
        alert(resultado.erro);
      }
      setCarregando(false);
    }
  };

  return (
    <button 
      onClick={handleExcluir} 
      disabled={carregando}
      className={`p-2 rounded-lg transition-colors shadow-sm ${
        carregando ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
      }`}
      title="Excluir Registro"
    >
      <Trash2 size={16} className={carregando ? 'animate-pulse' : ''} />
    </button>
  );
}