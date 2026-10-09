/**
 * Kalender anggaran: hari kerja, hari libur, cuti, dan anggaran bulanan per item. Semua fungsi murni.
 * Hari kerja = Senin sampai Jumat, bukan hari libur nasional/cuti bersama, dan bukan hari cuti pengguna.
 */
import { formatRp } from './formatters'

export const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] // indeks = hari ISO - 1
export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const UNIT_OPTIONS = [
  { value: 'DAY', label: 'Hari kalender', hint: 'Setiap hari, termasuk akhir pekan' },
  { value: 'WORKDAY', label: 'Hari kerja', hint: 'Senin–Jumat, tanpa tanggal merah dan cuti' },
  { value: 'WEEK', label: 'Mingguan', hint: 'Sekali seminggu pada hari pilihan' },
]

const pad = (n) => String(n).padStart(2, '0')
const round2 = (n) => Math.round(n * 100) / 100

export const toISO = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`
export const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate()

/** Hari ISO: 1 = Senin ... 7 = Minggu. Memakai UTC agar tidak terpengaruh zona waktu perangkat. */
export function isoWeekday(year, month, day) {
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return js === 0 ? 7 : js
}

/**
 * Hari-hari dalam satu bulan beserta statusnya.
 * holidays: Map iso -> { name, kind }; leaves: Set iso.
 */
export function monthDays(year, month, holidays = new Map(), leaves = new Set()) {
  return Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const day = i + 1
    const iso = toISO(year, month, day)
    const dow = isoWeekday(year, month, day)
    const weekend = dow >= 6
    const holiday = holidays.get(iso) ?? null
    const leave = leaves.has(iso)
    return { iso, day, dow, weekend, holiday, leave, workday: !weekend && !holiday && !leave }
  })
}

/** Ringkasan bulan: yang benar-benar mengurangi hari kerja adalah libur dan cuti pada hari Senin–Jumat. */
export function summarize(days) {
  const weekdays = days.filter((d) => !d.weekend)
  return {
    calendar: days.length,
    workdays: days.filter((d) => d.workday).length,
    weekendDays: days.length - weekdays.length,
    holidayWeekdays: weekdays.filter((d) => d.holiday).length,
    leaveWorkdays: weekdays.filter((d) => d.leave && !d.holiday).length,
  }
}

/** Jumlah satuan hitung pada bulan itu: hari kalender, hari kerja, atau berapa kali hari penarikan mingguan muncul. */
export function countUnits(rule, days) {
  if (rule.unit === 'DAY') return days.length
  if (rule.unit === 'WORKDAY') return days.filter((d) => d.workday).length
  return days.filter((d) => d.dow === rule.weekDay).length
}

/**
 * Anggaran sebuah item pada bulan itu.
 * Tanpa aturan: nominal bulanan tetap. RATE: tarif x jumlah satuan. FORECAST: nominal bulanan dibagi rata ke satuan.
 */
export function budgetFor(amount, rule, days) {
  if (!rule) return { total: amount, units: 0, perUnit: 0 }
  const units = countUnits(rule, days)
  if (rule.basis === 'RATE') {
    const perUnit = Number(rule.rate)
    return { total: round2(perUnit * units), units, perUnit }
  }
  return { total: amount, units, perUnit: units > 0 ? round2(amount / units) : 0 }
}

export function unitLabel(rule) {
  if (rule.unit === 'DAY') return 'hari'
  if (rule.unit === 'WORKDAY') return 'hari kerja'
  return `minggu (${WEEKDAYS[rule.weekDay - 1]})`
}

/** Penjelasan singkat perhitungan, mis. "Rp 25.000 × 22 hari kerja". */
export function describeBudget(rule, budget) {
  if (rule.basis === 'RATE') return `${formatRp(budget.perUnit)} × ${budget.units} ${unitLabel(rule)}`
  return `${formatRp(budget.total)} ÷ ${budget.units} ${unitLabel(rule)} = ${formatRp(budget.perUnit)}`
}

/**
 * Pembuat fungsi budgetOf(itemId, amount) -> { amount, hint, rule } untuk satu bulan.
 * Dipakai Accounts, Cost, dan Overview agar angkanya selalu sama. rules: Map itemId -> aturan.
 */
export function makeBudgetOf(rules, days) {
  return (itemId, amount) => {
    const rule = rules.get(itemId)
    if (!rule || days.length === 0) return { amount, hint: '', rule: null }
    const budget = budgetFor(amount, rule, days)
    return { amount: budget.total, hint: describeBudget(rule, budget), rule }
  }
}

/** Salinan pohon Accounts dengan nominal item diganti anggaran bulan itu (rawAmount = nominal asli). */
export function applyBudget(tree, budgetOf) {
  return tree.map((category) => ({
    ...category,
    subs: category.subs.map((sub) => ({
      ...sub,
      items: sub.items.map((item) => {
        const b = budgetOf(item.id, item.amount)
        return { ...item, amount: b.amount, rawAmount: item.amount, hint: b.hint, rule: b.rule }
      }),
    })),
  }))
}

/** Semua tanggal ISO dari fromIso sampai toIso (inklusif). null bila tidak valid atau lebih dari max hari. */
export function expandRange(fromIso, toIso, max = 62) {
  const from = new Date(`${fromIso}T00:00:00Z`)
  const to = new Date(`${toIso}T00:00:00Z`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return null
  const out = []
  for (let t = from.getTime(); t <= to.getTime(); t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10))
    if (out.length > max) return null
  }
  return out
}

/** Hari ISO (1 = Senin) dari teks tanggal ISO. */
export function weekdayOfIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return isoWeekday(y, m, d)
}
