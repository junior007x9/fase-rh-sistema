// Arquivo: app/utils/calculosFolha.ts

// 1. CÓDIGOS PARAMETRIZADOS DOS EVENTOS (ATUALIZADO)
export const EVENTOS_FOLHA = {
  // PROVENTOS
  DIFERENCA_SALARIO: { codigo: 'P001', nome: 'Diferença de Salário', tipo: 'PROVENTO' },
  DECIMO_TERCEIRO: { codigo: 'P002', nome: '13º Salário (Abono)', tipo: 'PROVENTO' },
  FERIAS: { codigo: 'P003', nome: 'Férias', tipo: 'PROVENTO' },
  FERIAS_TERCO: { codigo: 'P004', nome: '1/3 Constitucional de Férias', tipo: 'PROVENTO' },
  RESCISAO_SALDO: { codigo: 'P005', nome: 'Saldo de Salário (Rescisão)', tipo: 'PROVENTO' },
  RESCISAO_FERIAS_VENCIDAS: { codigo: 'P006', nome: 'Férias Vencidas (Rescisão)', tipo: 'PROVENTO' },
  RESCISAO_FERIAS_PROP: { codigo: 'P007', nome: 'Férias Proporcionais (Rescisão)', tipo: 'PROVENTO' },
  RESCISAO_TERCO: { codigo: 'P008', nome: '1/3 sobre Férias (Rescisão)', tipo: 'PROVENTO' },
  RESCISAO_13: { codigo: 'P009', nome: '13º Salário (Rescisão)', tipo: 'PROVENTO' },
  
  // DESCONTOS
  FALTA: { codigo: 'D001', nome: 'Falta', tipo: 'DESCONTO' },
  DSR: { codigo: 'D002', nome: 'DSR', tipo: 'DESCONTO' }, 
  INSS: { codigo: 'D003', nome: 'INSS', tipo: 'DESCONTO' },
  IRRF: { codigo: 'D004', nome: 'IRRF', tipo: 'DESCONTO' },
  PENSAO: { codigo: 'D005', nome: 'Pensão Alimentícia', tipo: 'DESCONTO' },
};

// 2. FÓRMULAS DE FALTAS E 13º (Mantidas)
export function calcularDescontoFalta(salarioBase: number, diasFalta: number): number {
  if (!salarioBase || salarioBase <= 0) return 0;
  return (salarioBase / 30) * diasFalta;
}

export function calcularDecimoTerceiro(salarioBase: number, dataAdmissao: string, anoReferencia: number) {
  if (!salarioBase || !dataAdmissao) return { avos: 0, valor: 0 };
  const [anoAdm, mesAdm, diaAdm] = dataAdmissao.split('-').map(Number);
  if (anoAdm < anoReferencia) return { avos: 12, valor: salarioBase };
  if (anoAdm > anoReferencia) return { avos: 0, valor: 0 };
  let avos = 12 - mesAdm + 1; 
  const diasNoMes = new Date(anoReferencia, mesAdm, 0).getDate();
  if ((diasNoMes - diaAdm + 1) < 15) avos -= 1;
  return { avos: Math.max(0, avos), valor: Number(((salarioBase / 12) * avos).toFixed(2)) };
}

// 3. FÓRMULAS DE INSS E IRRF (Mantidas)
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

// 4. NOVO: FÓRMULA DE FÉRIAS (Integral vs Proporcional)
export function calcularVerbasFerias(salarioBase: number, dataAdmissao: string, mesAnoGozo: string) {
  const [mesGozo, anoGozo] = mesAnoGozo.split('-').map(Number);
  const [anoAdm, mesAdm, diaAdm] = dataAdmissao.split('-').map(Number);

  let mesesTrabalhados = (anoGozo - anoAdm) * 12 + (mesGozo - mesAdm);
  if (mesesTrabalhados < 0) mesesTrabalhados = 0;

  const isIntegral = mesesTrabalhados >= 12; // Atingiu período aquisitivo
  let avos = isIntegral ? 12 : mesesTrabalhados;

  if (!isIntegral && mesesTrabalhados > 0) {
    const diasMesAdm = new Date(anoAdm, mesAdm, 0).getDate();
    if ((diasMesAdm - diaAdm + 1) < 15) avos -= 1; // Regra dos 15 dias
  }
  if (avos < 0) avos = 0;

  const valorFerias = isIntegral ? salarioBase : (salarioBase / 12) * avos;
  const valorTerco = valorFerias / 3;

  return {
    avos, isIntegral,
    valorFerias: Number(valorFerias.toFixed(2)),
    valorTerco: Number(valorTerco.toFixed(2))
  };
}

// 5. NOVO: FÓRMULA DE RESCISÃO E VERBAS
export function calcularVerbasRescisorias(salarioBase: number, dataAdmissao: string, dataDesligamento: string, temFeriasVencidas: boolean) {
  const [anoDes, mesDes, diaDes] = dataDesligamento.split('-').map(Number);
  const [anoAdm, mesAdm, diaAdm] = dataAdmissao.split('-').map(Number);

  // a) Saldo de Salário
  const saldoSalario = (salarioBase / 30) * diaDes;

  // b) 13º Proporcional (Meses trabalhados no ano da rescisão)
  const startMonth = (anoAdm === anoDes) ? mesAdm : 1;
  let avos13 = 0;
  for (let m = startMonth; m <= mesDes; m++) {
    if (m === mesAdm && anoAdm === anoDes) {
      if ((new Date(anoAdm, mesAdm, 0).getDate() - diaAdm + 1) >= 15) avos13++;
    } else if (m === mesDes) {
      if (diaDes >= 15) avos13++;
    } else {
      avos13++;
    }
  }
  if (avos13 > 12) avos13 = 12;
  const valor13 = (salarioBase / 12) * avos13;

  // c) Férias Proporcionais
  let diffMeses = (anoDes - anoAdm) * 12 + (mesDes - mesAdm);
  const diffDias = diaDes - diaAdm;
  if (diffDias < 0) diffMeses -= 1;
  if (diffDias >= 14) diffMeses += 1;
  
  const avosFeriasProp = diffMeses % 12;
  const valorFeriasProp = (salarioBase / 12) * avosFeriasProp;

  // d) Férias Vencidas e Terço
  const valorFeriasVencidas = temFeriasVencidas ? salarioBase : 0;
  const valorTerco = (valorFeriasProp + valorFeriasVencidas) / 3;

  // e) Impostos sobre Saldo e 13º
  const inss = calcularINSS(saldoSalario) + calcularINSS(valor13);
  const irrf = calcularIRRF(saldoSalario, calcularINSS(saldoSalario)) + calcularIRRF(valor13, calcularINSS(valor13));

  return {
    diasSaldo: diaDes, saldoSalario: Number(saldoSalario.toFixed(2)),
    avos13, valor13: Number(valor13.toFixed(2)),
    avosFeriasProp, valorFeriasProp: Number(valorFeriasProp.toFixed(2)),
    valorFeriasVencidas: Number(valorFeriasVencidas.toFixed(2)),
    valorTerco: Number(valorTerco.toFixed(2)),
    inss: Number(inss.toFixed(2)), irrf: Number(irrf.toFixed(2))
  };
}