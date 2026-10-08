/**
 * Baris halaman Cost = item Accounts (otomatis, Accounts adalah sumber kebenaran)
 * + estimasi manual (pemasukan atau biaya di luar Accounts).
 * Overview dan Cost memakai baris yang sama supaya angkanya selalu cocok.
 */
export function buildCostLines(tree, manualRows) {
  const fromAccounts = tree.flatMap((category) =>
    category.subs.flatMap((sub) =>
      sub.items.map((item) => ({
        id: `acc-${item.id}`,
        source: 'account',
        type: sub.name,
        detail: item.name,
        group: category.name,
        debit: item.amount,
        credit: 0,
      })),
    ),
  )
  const manual = manualRows.map((row) => ({ ...row, source: 'manual', group: 'Manual' }))
  return [...fromAccounts, ...manual]
}

export function totalsOf(lines) {
  const debit = lines.reduce((sum, l) => sum + l.debit, 0)
  const credit = lines.reduce((sum, l) => sum + l.credit, 0)
  return { debit, credit, balance: credit - debit }
}

/** Pengeluaran (debit) per type, terbesar dulu. Type yang debitnya 0 tidak ikut. */
export function debitByType(lines) {
  const totals = new Map()
  lines.forEach((l) => {
    if (l.debit > 0) totals.set(l.type, (totals.get(l.type) ?? 0) + l.debit)
  })
  return [...totals].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount)
}
