// Arquivo: app/utils/calculosFolha.ts

// 1. CÓDIGOS PARAMETRIZADOS DOS EVENTOS
export const EVENTOS_FOLHA = {
  // PROVENTOS
  DIFERENCA_SALARIO: { codigo: 'P001', nome: 'Diferença de Salário', tipo: 'PROVENTO' },
  DECIMO_TERCEIRO: { codigo: 'P002', nome: '13º Salário (Abono)', tipo: 'PROVENTO' }, // NOVO!
  
  // DESCONTOS
  FALTA: { codigo: 'D001', nome: 'Falta', tipo: 'DESCONTO' },
  DSR: { codigo: 'D002', nome: 'DSR', tipo: 'DESCONTO' }, 
  INSS: { codigo: 'D003', nome: 'INSS', tipo: 'DESCONTO' },
  IRRF: { codigo: 'D004', nome: 'IRRF', tipo: 'DESCONTO' },
  PENSAO: { codigo: 'D005', nome: 'Pensão Alimentícia', tipo: 'DESCONTO' },
};

// 2. FÓRMULA DE FALTAS
export function calcularDescontoFalta(salarioBase: number, diasFalta: number): number {
  if (!salarioBase || salarioBase <= 0) return 0;
  return (salarioBase / 30) * diasFalta;
}

// 3. FÓRMULA DE 13º SALÁRIO (Cálculo de Avos parametrizado)
export function calcularDecimoTerceiro(salarioBase: number, dataAdmissao: string, anoReferencia: number): { avos: number, valor: number } {
  if (!salarioBase || !dataAdmissao) return { avos: 0, valor: 0 };

  const [anoAdm, mesAdm, diaAdm] = dataAdmissao.split('-').map(Number);

  // Se entrou em anos anteriores, tem direito a 12/12 avos
  if (anoAdm < anoReferencia) {
    return { avos: 12, valor: salarioBase };
  }

  // Se entrou em um ano futuro ao cálculo (erro), 0 avos
  if (anoAdm > anoReferencia) {
    return { avos: 0, valor: 0 };
  }

  // Se entrou no mesmo ano, calcula os avos proporcionais
  let avos = 12 - mesAdm + 1; // Ex: entrou em Março (3). 12 - 3 + 1 = 10 meses.

  // Regra dos 15 dias: Se trabalhou menos de 15 dias no mês de admissão, perde 1 avo
  // Pega o último dia do mês da admissão
  const diasNoMes = new Date(anoReferencia, mesAdm, 0).getDate();
  const diasTrabalhadosNoMes = diasNoMes - diaAdm + 1;

  if (diasTrabalhadosNoMes < 15) {
    avos -= 1;
  }

  if (avos <= 0) return { avos: 0, valor: 0 };

  const valor = (salarioBase / 12) * avos;
  return { avos, valor: Number(valor.toFixed(2)) };
}

// 4. CÁLCULO DE INSS E IRRF (Mantidos)
export function calcularINSS(salarioBruto: number): number {
  let inss = 0;
  if (salarioBruto <= 1412.00) inss = salarioBruto * 0.075;
  else if (salarioBruto <= 2666.68) inss = (1412.00 * 0.075) + ((salarioBruto - 1412.00) * 0.09);
  else if (salarioBruto <= 4000.03) inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((salarioBruto - 2666.68) * 0.12);
  else if (salarioBruto <= 7786.02) inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salarioBruto - 4000.03) * 0.14);
  else inss = 908.85; 
  return Number(inss.toFixed(2));
}

export function calcularIRRF(salarioBruto: number, descontoINSS: number, dependentes: number = 0): number {
  const deducao = dependentes * 189.59;
  const base = salarioBruto - descontoINSS - deducao;
  let irrf = 0;
  if (base <= 2259.20) irrf = 0;
  else if (base <= 2826.65) irrf = (base * 0.075) - 169.44;
  else if (base <= 3751.05) irrf = (base * 0.15) - 381.44;
  else if (base <= 4664.68) irrf = (base * 0.225) - 662.77;
  else irrf = (base * 0.275) - 896.00;
  return irrf > 0 ? Number(irrf.toFixed(2)) : 0;
}