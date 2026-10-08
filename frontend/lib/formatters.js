export function formatRp(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Nominal ringkas untuk ruang sempit: Rp 6,75 jt, Rp 375 rb. */
export function formatCompactRp(value) {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const fmt = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n)
  if (abs >= 1e9) return `${sign}Rp ${fmt(abs / 1e9)} M`
  if (abs >= 1e6) return `${sign}Rp ${fmt(abs / 1e6)} jt`
  if (abs >= 1e3) return `${sign}Rp ${fmt(abs / 1e3)} rb`
  return `${sign}Rp ${fmt(abs)}`
}
