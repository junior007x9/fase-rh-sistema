// Arquivo: app/components/LiveSearch.tsx
"use client"; // Isso avisa ao Next.js que esse componente roda no navegador (para capturar digitação)

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LiveSearch({ 
  paramName = "q", 
  placeholder = "Buscar...", 
  defaultValue = "",
  cor = "blue"
}: {
  paramName?: string;
  placeholder?: string;
  defaultValue?: string;
  cor?: "blue" | "purple";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza caso a URL mude
  useEffect(() => {
    setSearchTerm(searchParams.get(paramName) || "");
  }, [searchParams, paramName]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchTerm(text);

    // DEBOUNCE: Espera o usuário parar de digitar por 400 milissegundos antes de ir no banco
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (text) {
        params.set(paramName, text);
      } else {
        params.delete(paramName);
      }
      
      // Se for a busca principal e houver paginação, reseta para a página 1
      if (paramName === 'q' && params.has('pagina')) {
        params.set('pagina', '1');
      }

      // Atualiza a URL de forma silenciosa, fazendo os dados piscarem na tela
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400); 
  };

  const corClasse = cor === "purple" 
    ? "focus:ring-purple-500 focus:border-purple-500" 
    : "focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 outline-none transition-all text-sm shadow-sm ${corClasse}`}
      />
    </div>
  );
}