export const fmt = (v: number): string =>
  'R$ ' +
  v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const pct = (v: number): string => (v * 100).toFixed(1) + '%'
