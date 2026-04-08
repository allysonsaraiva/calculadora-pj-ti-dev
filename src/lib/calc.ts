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
