// Arquivo: app/utils/formatters.ts

/**
 * Converte datas bagunçadas da planilha (DD/MM/YYYY) 
 * para o formato rigoroso do HTML/Banco (YYYY-MM-DD)
 */
export const formatarDataInput = (dataStr: string | null | undefined): string => {
  if (!dataStr) return "";
  
  // Se veio com barra (padrão Brasil/Excel), inverte para o padrão HTML
  if (dataStr.includes("/")) {
    const [d, m, y] = dataStr.split("/");
    return `${y}-${m}-${d}`;
  }
  
  // Se já estiver no padrão YYYY-MM-DD, só retorna
  return dataStr;
};

/**
 * Converte salários com "R$", letras ou vírgulas da planilha 
 * para números puros aceitos pelo <input type="number">
 */
export const formatarNumeroInput = (valor: any): string | number => {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === 'number') return valor;
  
  // Remove tudo que não for número, vírgula ou sinal de negativo
  const limpo = String(valor).replace(/[^0-9,-]/g, '').replace(',', '.');
  return Number(limpo) || "";
};

/**
 * Formata um número puro do banco de dados para R$ (Tela de Visualização)
 */
export const formatarMoedaExibicao = (valor: number | null | undefined): string => {
  if (valor === null || valor === undefined) return "Não informada";
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

/**
 * Formata a data do banco (YYYY-MM-DD) para Tela de Visualização (DD/MM/YYYY)
 * Evita bugs de fuso horário que diminuem 1 dia da data original
 */
export const formatarDataExibicao = (dataBase: string | null | undefined): string => {
  if (!dataBase) return "";
  return dataBase.split('-').reverse().join('/');
};

/**
 * Calcula o tempo de casa do servidor
 */
export const calcularTempoDeCasa = (admissao: string | null | undefined, desligamento: string | null): string => {
  if (!admissao) return "Data não informada";
  
  const dataInicio = new Date(admissao);
  const dataFim = desligamento ? new Date(desligamento) : new Date();
  
  let anos = dataFim.getFullYear() - dataInicio.getFullYear();
  let meses = dataFim.getMonth() - dataInicio.getMonth();
  
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  
  if (anos === 0 && meses === 0) return "Menos de 1 mês";
  return `${anos > 0 ? `${anos} ano(s)` : ''} ${meses > 0 ? `e ${meses} mês(es)` : ''}`.trim();
};