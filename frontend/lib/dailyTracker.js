/**
 * Pelacakan pengeluaran harian dan rekonsiliasi budget lawan aktual. Semua fungsi murni.
 *
 * Mode AUTO   : hari yang berlaku terpotong otomatis sebesar jadwal; catatan harian hanya koreksi (override).
 * Mode MANUAL : aktual hanya yang dicatat pengguna; hari berlaku yang sudah lewat tanpa catatan = "pending".
 */
import { budgetFor } from './budgetCalendar'

const round2 = (n) => Math.round(n * 100) / 100

/** Apakah hari ini termasuk jadwal sebuah aturan (hari kalender, hari kerja, atau hari mingguan yang dipilih). */
export function isDue(rule, day) {
  if (rule.unit === 'DAY') return true
  if (rule.unit === 'WORKDAY') return day.workday
  return day.dow === rule.weekDay
}

/**
 * Jadwal sebuah item pada satu bulan: Map iso -> jumlah terjadwal (hanya hari yang berlaku).
 * Pada basis FORECAST selisih pembulatan ditanggung hari terakhir, sehingga jumlah jadwal tepat sama dengan nominal bulanan.
 */
export function scheduleFor(rule, monthlyAmount, days) {
  const schedule = new Map()
  const due = days.filter((d) => isDue(rule, d))
  if (due.length === 0) return schedule
  const { total, perUnit } = budgetFor(monthlyAmount, rule, days)
  due.forEach((d) => schedule.set(d.iso, perUnit))
  if (rule.basis === 'FORECAST') {
    const diff = round2(total - round2(perUnit * due.length))
    if (diff !== 0) {
      const last = due[due.length - 1].iso
      schedule.set(last, round2(schedule.get(last) + diff))
    }
  }
  return schedule
}

export const entryKey = (itemId, iso) => `${itemId}|${iso}`

/**
 * Rekonsiliasi satu item untuk satu bulan.
 * perDay: Map iso -> { planned, actual (angka atau null), state }
 * state: 'auto' (terpotong otomatis), 'override' (koreksi pada AUTO), 'entered' (diisi pada MANUAL),
 *        'pending' (MANUAL, berlaku, sudah lewat, belum diisi), 'upcoming' (terjadwal, belum tiba), 'none'.
 * plannedToDate hanya menghitung hari yang bisa dibandingkan (hari pending tidak ikut, agar tidak terlihat hemat palsu).
 */
export function reconcileItem(tracked, days, entries, todayIso) {
  const { rule, itemId, amount } = tracked
  const schedule = scheduleFor(rule, amount, days)
  const perDay = new Map()
  let plannedToDate = 0
  let actualToDate = 0
  let projection = 0
  let pending = 0
  let firstPending = null

  for (const d of days) {
    const planned = schedule.get(d.iso) ?? 0
    const entry = entries.get(entryKey(itemId, d.iso))
    const past = d.iso <= todayIso
    let actual = null
    let state = 'none'

    if (entry !== undefined) {
      actual = entry
      state = rule.mode === 'MANUAL' ? 'entered' : 'override'
    } else if (planned > 0 && past) {
      if (rule.mode === 'AUTO') {
        actual = planned
        state = 'auto'
      } else {
        state = 'pending'
        pending += 1
        if (firstPending === null) firstPending = d.iso
      }
    } else if (planned > 0) {
      state = 'upcoming'
    }

    perDay.set(d.iso, { planned, actual, state })
    if (past) {
      if (state !== 'pending') plannedToDate += planned
      actualToDate += actual ?? 0
      projection += actual ?? (state === 'pending' ? planned : 0)
    } else {
      projection += entry ?? planned
    }
  }

  const budget = round2([...schedule.values()].reduce((n, v) => n + v, 0))
  return {
    itemId,
    name: tracked.name,
    category: tracked.category,
    sub: tracked.sub,
    path: tracked.path,
    mode: rule.mode,
    budget,
    plannedToDate: round2(plannedToDate),
    actualToDate: round2(actualToDate),
    variance: round2(plannedToDate - actualToDate), // positif = hemat, negatif = melebihi rencana
    projection: round2(projection),
    pending,
    firstPending,
    progress: budget > 0 ? actualToDate / budget : 0,
    perDay,
  }
}

/** Total semua item: anggaran, rencana, aktual, selisih, proyeksi, dan jumlah hari belum diisi. */
export function totalsOfItems(items) {
  const sum = (key) => round2(items.reduce((n, i) => n + i[key], 0))
  const pendingDates = items.map((i) => i.firstPending).filter(Boolean).sort()
  return {
    budget: sum('budget'),
    plannedToDate: sum('plannedToDate'),
    actualToDate: sum('actualToDate'),
    variance: sum('variance'),
    projection: sum('projection'),
    pending: items.reduce((n, i) => n + i.pending, 0),
    firstPending: pendingDates[0] ?? null,
  }
}

/** Rekonsiliasi semua item beserta totalnya. */
export function reconcile(trackedItems, days, entries, todayIso) {
  const items = trackedItems.map((t) => reconcileItem(t, days, entries, todayIso))
  return { items, totals: totalsOfItems(items) }
}

/** Item Accounts yang punya aturan hitung (hanya yang punya aturan yang dilacak). */
export function buildTracked(tree, rules) {
  return tree.flatMap((cat) =>
    cat.subs.flatMap((sub) =>
      sub.items.flatMap((item) => {
        const rule = rules.get(item.id)
        return rule
          ? [{ itemId: item.id, name: item.name, category: cat.name, sub: sub.name, path: `${cat.name} › ${sub.name}`, amount: item.amount, rule }]
          : []
      }),
    ),
  )
}

/** Anggaran lawan realisasi per kategori, kategori terbesar dulu. */
export function categoryProgress(items) {
  const groups = new Map()
  for (const item of items) {
    const row = groups.get(item.category) ?? { name: item.category, budget: 0, plannedToDate: 0, actualToDate: 0, projection: 0 }
    row.budget += item.budget
    row.plannedToDate += item.plannedToDate
    row.actualToDate += item.actualToDate
    row.projection += item.projection
    groups.set(item.category, row)
  }
  return [...groups.values()]
    .map((r) => ({
      name: r.name,
      budget: round2(r.budget),
      plannedToDate: round2(r.plannedToDate),
      actualToDate: round2(r.actualToDate),
      projection: round2(r.projection),
      progress: r.budget > 0 ? r.actualToDate / r.budget : 0,
    }))
    .sort((a, b) => b.budget - a.budget)
}

/** Catatan "sesuai rencana" untuk semua hari pending pada mode Manual (untuk isi massal). */
export function pendingFill(items) {
  const out = []
  for (const item of items) {
    for (const [iso, day] of item.perDay) {
      if (day.state === 'pending') out.push({ itemId: item.itemId, date: iso, amount: day.planned })
    }
  }
  return out
}

/** Isi permintaan penutupan bulan dari hasil rekonsiliasi (semua hari bulan itu sudah lewat). */
export function closingPayload(month, items) {
  const cut = (text) => String(text).slice(0, 120)
  return {
    month,
    items: items.map((i) => ({
      itemId: i.itemId,
      itemName: cut(i.name),
      categoryName: cut(i.category),
      subName: cut(i.sub),
      mode: i.mode,
      budget: i.budget,
      plannedToDate: i.plannedToDate,
      actual: i.actualToDate,
    })),
  }
}

/** Mengubah item beku dari penutupan bulan ke bentuk yang sama dengan hasil rekonsiliasi, agar tabelnya bisa dipakai ulang. */
export function closingToItem(c) {
  const budget = Number(c.budget)
  const plannedToDate = Number(c.plannedToDate)
  const actual = Number(c.actual)
  return {
    itemId: c.itemId,
    name: c.itemName,
    category: c.categoryName,
    sub: c.subName,
    path: `${c.categoryName} › ${c.subName}`,
    mode: c.mode,
    budget,
    plannedToDate,
    actualToDate: actual,
    variance: round2(plannedToDate - actual),
    projection: actual,
    pending: 0,
    firstPending: null,
    progress: budget > 0 ? actual / budget : 0,
    perDay: new Map(),
  }
}

/** Ringkasan satu hari dari hasil rekonsiliasi: total rencana, total aktual, dan statusnya untuk penanda di deretan hari. */
export function dayTotals(items, iso) {
  let planned = 0
  let actual = 0
  let hasActual = false
  let pending = false
  for (const item of items) {
    const day = item.perDay.get(iso)
    if (!day) continue
    planned += day.planned
    if (day.actual !== null) {
      actual += day.actual
      hasActual = true
    }
    if (day.state === 'pending') pending = true
  }
  planned = round2(planned)
  actual = round2(actual)
  let status = ''
  if (pending) status = 'pending'
  else if (actual > planned + 0.005) status = 'over'
  else if (hasActual) status = 'ok'
  return { planned, actual, status }
}
