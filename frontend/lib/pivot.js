/** Logika murni tabel pivot Cost: penyusunan grup, baris dengan rentang sel, jumlah, dan penguraian angka. */

export const MANUAL_ID = 'manual'

export const COLUMN_TYPES = [
  { value: 'TEXT', label: 'Teks', hint: 'Catatan, nama, apa saja' },
  { value: 'NUMBER', label: 'Angka', hint: 'Angka biasa, ikut dijumlahkan' },
  { value: 'CURRENCY', label: 'Rupiah', hint: 'Nominal uang, ikut dijumlahkan' },
  { value: 'DATE', label: 'Tanggal', hint: 'Jatuh tempo, tanggal bayar' },
  { value: 'SELECT', label: 'Pilihan', hint: 'Pilih dari daftar Anda' },
  { value: 'CHECKBOX', label: 'Centang', hint: 'Sudah atau belum' },
]

export const isNumericType = (type) => type === 'NUMBER' || type === 'CURRENCY'

/**
 * Grup tingkat atas = kategori Accounts; estimasi manual dikumpulkan di grup "Manual"
 * (sub = type, item = detail) agar pemasukan dan biaya di luar Accounts tetap punya tempat.
 * budgetOf(itemId, nominal) memberi anggaran bulan berjalan menurut aturan hitung item (hint = penjelasan perhitungan).
 * Item: { rowType: 'ITEM' | 'ESTIMATE', id, name, debit, credit, hint?, raw? }
 */
export function buildGroups(tree, manualRows, budgetOf = (_id, amount) => ({ amount, hint: '' })) {
  const groups = tree.map((cat) => ({
    id: cat.id,
    name: cat.name,
    manual: false,
    subs: cat.subs.map((sub) => ({
      id: sub.id,
      name: sub.name,
      items: sub.items.map((i) => {
        const b = budgetOf(i.id, i.amount)
        return { rowType: 'ITEM', id: i.id, name: i.name, debit: b.amount, credit: 0, hint: b.hint }
      }),
    })),
  }))

  if (manualRows.length > 0) {
    const byType = new Map()
    manualRows.forEach((r) => {
      if (!byType.has(r.type)) byType.set(r.type, [])
      byType.get(r.type).push({ rowType: 'ESTIMATE', id: r.id, name: r.detail, debit: r.debit, credit: r.credit, raw: r })
    })
    groups.push({
      id: MANUAL_ID,
      name: 'Manual',
      manual: true,
      subs: [...byType].map(([type, items]) => ({ id: `${MANUAL_ID}:${type}`, name: type, items })),
    })
  }
  return groups
}

export const itemsOf = (group) => group.subs.flatMap((s) => s.items)

export function sumItems(items) {
  const debit = items.reduce((n, i) => n + i.debit, 0)
  const credit = items.reduce((n, i) => n + i.credit, 0)
  return { debit, credit, balance: credit - debit }
}

/**
 * Menyusun baris tabel dari grup dan himpunan id yang sedang diciutkan (kategori atau sub).
 * Tiap baris punya `kind`; baris pertama blok membawa catSpan / subSpan (rowSpan sel gabungan kategori / sub).
 * Aturan subtotal: baris "Subtotal" hanya bila sub punya lebih dari satu item, baris "Total" kategori hanya bila
 * kategori punya lebih dari satu sub; selain itu angkanya sama dengan baris di atasnya dan hanya menambah noise.
 */
export function buildPivotRows(groups, collapsed) {
  const rows = []
  for (const cat of groups) {
    if (collapsed.has(cat.id)) {
      rows.push({ key: `c:${cat.id}`, kind: 'cat-collapsed', cat, items: itemsOf(cat), catSpan: 1 })
      continue
    }
    if (cat.subs.length === 0) {
      rows.push({ key: `c:${cat.id}:empty`, kind: 'cat-empty', cat, items: [], catSpan: 1 })
      continue
    }

    const body = []
    for (const sub of cat.subs) {
      if (collapsed.has(sub.id)) {
        body.push({ key: `s:${sub.id}`, kind: 'sub-collapsed', cat, sub, items: sub.items })
      } else if (sub.items.length === 0) {
        body.push({ key: `s:${sub.id}:empty`, kind: 'sub-empty', cat, sub, items: [] })
      } else {
        sub.items.forEach((item) =>
          body.push({ key: `i:${item.rowType}:${item.id}`, kind: 'item', cat, sub, item, items: [item] }),
        )
        if (sub.items.length > 1) body.push({ key: `st:${sub.id}`, kind: 'sub-total', cat, sub, items: sub.items })
      }
    }

    body[0].catSpan = body.length
    const perSub = new Map()
    body.forEach((r) => perSub.set(r.sub.id, (perSub.get(r.sub.id) ?? 0) + 1))
    const seen = new Set()
    body.forEach((r) => {
      if (seen.has(r.sub.id)) return
      seen.add(r.sub.id)
      r.subSpan = perSub.get(r.sub.id)
    })

    rows.push(...body)
    if (cat.subs.length > 1) rows.push({ key: `ct:${cat.id}`, kind: 'cat-total', cat, items: itemsOf(cat) })
  }
  return rows
}

/** Id kategori yang punya isi, untuk tombol "Ciutkan semua". */
export const collapsibleCategoryIds = (groups) => groups.filter((g) => g.subs.length > 0).map((g) => g.id)

/**
 * Mengurai angka yang diketik pengguna Indonesia: "150.000" = 150000, "12,5" = 12.5, "1.250,75" = 1250.75.
 * Mengembalikan null untuk input kosong dan NaN untuk input yang bukan angka.
 */
export function parseNumberInput(input) {
  const text = String(input ?? '')
    .trim()
    .replace(/^rp\s*/i, '')
    .replace(/\s+/g, '')
  if (text === '') return null
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) return Number(text.replace(/\./g, '').replace(',', '.'))
  if (/^-?\d+(,\d+)?$/.test(text)) return Number(text.replace(',', '.'))
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text)
  return NaN
}

/** Kunci sel untuk peta nilai di hook. */
export const cellKey = (columnId, rowType, rowId) => `${columnId}|${rowType}|${rowId}`
