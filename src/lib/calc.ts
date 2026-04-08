// Tabela IRRF 2026 — vigente desde mai/2025 (MP 1.294/2025) + Reforma da Renda (Lei 15.270/2025)
// Fonte: Receita Federal — gov.br/receitafederal/tabelas/2026

export interface AnexoResult {
  das: number
  prolabore: number
  inss: number
  irrf: number
  total: number
  liquido: number
  aliq: number
}

export function calcIRRF(base: number): number {
  let irrf = 0

  // Passo 1: tabela progressiva base (faixas atualizadas 2026)
  if (base <= 2428.8) irrf = 0
  else if (base <= 2826.65) irrf = base * 0.075 - 182.16
  else if (base <= 3751.05) irrf = base * 0.15 - 394.16
  else if (base <= 4664.68) irrf = base * 0.225 - 675.49
  else irrf = base * 0.275 - 908.73

  // Passo 2: redutor adicional — Lei 15.270/2025 (vigor jan/2026)
  // ≤ R$ 5.000 → isenção total
  // R$ 5.000,01 a R$ 7.350 → redutor = 978,62 − (0,133145 × renda)
  // Acima de R$ 7.350 → sem redutor
  if (base <= 5000) {
    irrf = 0
  } else if (base <= 7350) {
    const redutor = 978.62 - 0.133145 * base
    irrf = Math.max(0, irrf - redutor)
  }

  return irrf
}

export function calcAnexoIII(fat: number): AnexoResult {
  const aliq = 0.06
  const das = fat * aliq
  const prolabore = fat * 0.28
  const inss = prolabore * 0.11
  const irrf = calcIRRF(prolabore)
  const total = das + inss + irrf
  const liquido = fat - total
  return { das, prolabore, inss, irrf, total, liquido, aliq }
}

export function calcAnexoV(fat: number): AnexoResult {
  const aliq = 0.155
  const das = fat * aliq
  const prolabore = fat * 0.05
  const inss = prolabore * 0.11
  const irrf = calcIRRF(prolabore)
  const total = das + inss + irrf
  const liquido = fat - total
  return { das, prolabore, inss, irrf, total, liquido, aliq }
}

export interface CLTResult {
  bruto: number
  liquido: number
  inss: number
  irrf: number
  fgts: number
  provisaoDecimo: number
  provisaoFerias: number
  totalMensal: number
  custoEmpresa: number // Novo
}

export function calcINSSCLT(bruto: number): number {
  // Tabela INSS CLT 2026 (Baseada em projeções/2025)
  // Faixas Progressivas
  const teto = 8157.41
  const base = Math.min(bruto, teto)
  let inss = 0

  if (base <= 1518) {
    inss = base * 0.075
  } else if (base <= 2793.88) {
    inss = (1518 * 0.075) + (base - 1518) * 0.09
  } else if (base <= 4190.83) {
    inss = (1518 * 0.075) + (2793.88 - 1518) * 0.09 + (base - 2793.88) * 0.12
  } else {
    inss = (1518 * 0.075) + (2793.88 - 1518) * 0.09 + (4190.83 - 2793.88) * 0.12 + (base - 4190.83) * 0.14
  }

  return inss
}

export function calcCustoEmpresa(bruto: number, beneficiosEmpresa: number = 0): number {
  const inssPatronal = bruto * 0.20
  const rat = bruto * 0.02
  const terceiros = bruto * 0.058
  const fgts = bruto * 0.08

  // Provisões mensais (1/12 de 13º e Férias + 1/3)
  // Nota: Sobre as provisões também incidem FGTS e encargos patronais
  const baseEncargos = bruto + inssPatronal + rat + terceiros
  const provisaoDecimo = baseEncargos / 12
  const provisaoFerias = (baseEncargos * 1.3333) / 12
  const provisaoFGTS = (bruto / 12 + (bruto * 1.3333) / 12) * 0.08

  return bruto + inssPatronal + rat + terceiros + fgts + provisaoDecimo + provisaoFerias + provisaoFGTS + beneficiosEmpresa
}

export function calcCLT(bruto: number, beneficios: number = 0, outrosDescontos: number = 0): CLTResult {
  const inss = calcINSSCLT(bruto)
  const baseIRRF = bruto - inss
  const irrf = calcIRRF(baseIRRF)
  
  const liquido = bruto - inss - irrf - outrosDescontos
  const fgts = bruto * 0.08
  const provisaoDecimo = bruto / 12
  const provisaoFerias = (bruto / 3) / 12
  
  const totalMensal = liquido + beneficios + fgts + provisaoDecimo + provisaoFerias
  const custoEmpresa = calcCustoEmpresa(bruto, beneficios)

  return {
    bruto,
    liquido,
    inss,
    irrf,
    fgts,
    provisaoDecimo,
    provisaoFerias,
    totalMensal,
    custoEmpresa
  }
}

/**
 * Calcula quanto o PJ precisa faturar para empatar com o ganho líquido real da CLT.
 * Considera impostos do Anexo III (6%) e custo do contador.
 */
export function calcFaturamentoEquivalente(cltTotalMensal: number, contador: number): number {
  const impostoPJ = 0.06 // 6% Anexo III
  const inssPJRate = 0.11 * 0.28 // 11% sobre 28% do faturamento (estimativa Simples)
  
  // Equação: F * (1 - impostoPJ - inssPJRate) - contador = cltTotalMensal
  // F = (cltTotalMensal + contador) / (1 - impostoPJ - inssPJRate)
  
  const fat = (cltTotalMensal + contador) / (1 - impostoPJ - inssPJRate)
  return fat
}

