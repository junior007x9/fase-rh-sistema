// Arquivo: app/utils/calculosFolha.ts

// 1. CÓDIGOS PARAMETRIZADOS DOS EVENTOS
export const EVENTOS_FOLHA = {
  // PROVENTOS
  DIFERENCA_SALARIO: { codigo: 'P001', nome: 'Diferença de Salário', tipo: 'PROVENTO' },
  
  // DESCONTOS
  FALTA: { codigo: 'D001', nome: 'Falta', tipo: 'DESCONTO' },
  DSR: { codigo: 'D002', nome: 'DSR', tipo: 'DESCONTO' }, // Calculado/Inserido Manualmente
  INSS: { codigo: 'D003', nome: 'INSS', tipo: 'DESCONTO' },
  IRRF: { codigo: 'D004', nome: 'IRRF', tipo: 'DESCONTO' },
  PENSAO: { codigo: 'D005', nome: 'Pensão Alimentícia', tipo: 'DESCONTO' },
};

// 2. FÓRMULA DE FALTAS (Como solicitado: Salário / 30 x Dias)
export function calcularDescontoFalta(salarioBase: number, diasFalta: number): number {
  if (!salarioBase || salarioBase <= 0) return 0;
  return (salarioBase / 30) * diasFalta;
}

// 3. CÁLCULO DE INSS (Tabela Progressiva Padrão 2024/2026)
export function calcularINSS(salarioBruto: number): number {
  let inss = 0;
  if (salarioBruto <= 1412.00) {
    inss = salarioBruto * 0.075;
  } else if (salarioBruto <= 2666.68) {
    inss = (1412.00 * 0.075) + ((salarioBruto - 1412.00) * 0.09);
  } else if (salarioBruto <= 4000.03) {
    inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((salarioBruto - 2666.68) * 0.12);
  } else if (salarioBruto <= 7786.02) {
    inss = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((salarioBruto - 4000.03) * 0.14);
  } else {
    // Teto do INSS
    inss = 908.85; 
  }
  return Number(inss.toFixed(2));
}

// 4. CÁLCULO DE IRRF (Simplificado com dedução padrão)
export function calcularIRRF(salarioBruto: number, descontoINSS: number, dependentes: number = 0): number {
  const deducaoDependente = dependentes * 189.59;
  const baseCalculo = salarioBruto - descontoINSS - deducaoDependente;
  let irrf = 0;

  if (baseCalculo <= 2259.20) {
    irrf = 0;
  } else if (baseCalculo <= 2826.65) {
    irrf = (baseCalculo * 0.075) - 169.44;
  } else if (baseCalculo <= 3751.05) {
    irrf = (baseCalculo * 0.15) - 381.44;
  } else if (baseCalculo <= 4664.68) {
    irrf = (baseCalculo * 0.225) - 662.77;
  } else {
    irrf = (baseCalculo * 0.275) - 896.00;
  }
  
  return irrf > 0 ? Number(irrf.toFixed(2)) : 0;
}