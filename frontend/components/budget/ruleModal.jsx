'use client'
import { useState } from 'react'
import { Modal } from '@/components/common/modal'
import { budgetFor, UNIT_OPTIONS, unitLabel, WEEKDAYS } from '@/lib/budgetCalendar'
import { formatRp } from '@/lib/formatters'
import { parseNumberInput } from '@/lib/pivot'

const BASIS_OPTIONS = [
  { value: 'RATE', label: 'Tarif per satuan', hint: 'Anda tentukan tarifnya, mis. Rp25.000 per hari' },
  { value: 'FORECAST', label: 'Bagi dari nominal bulanan', hint: 'Nominal item dibagi rata ke satuan bulan itu' },
]

/** Penjelasan hasil hitung bulan ini berdasarkan isian saat ini, sebelum disimpan. */
function previewText(draft, amount, days, monthLabel) {
  if (days.length === 0) return 'Kalender bulan ini belum dimuat.'
  if (draft.basis === 'RATE' && (draft.rate === null || Number.isNaN(draft.rate))) return 'Isi tarif untuk melihat hasil hitung.'
  const budget = budgetFor(amount, draft, days)
  const label = unitLabel(draft)
  if (draft.basis === 'RATE') {
    return `${monthLabel}: ${budget.units} ${label} × ${formatRp(budget.perUnit)} = ${formatRp(budget.total)}`
  }
  if (budget.units === 0) return `${monthLabel}: tidak ada ${label} pada bulan ini.`
  return `${monthLabel}: ${formatRp(budget.total)} ÷ ${budget.units} ${label} = ${formatRp(budget.perUnit)} per satuan`
}

/** Mengatur cara sebuah item dihitung: per hari kalender, hari kerja, atau mingguan, dengan tarif atau dibagi dari nominal bulanan. */
export function RuleModal({ item, rule, days, monthLabel, onClose, onSave, onRemove }) {
  const [unit, setUnit] = useState(rule?.unit ?? 'WORKDAY')
  const [basis, setBasis] = useState(rule?.basis ?? 'RATE')
  const [rate, setRate] = useState(rule?.rate != null ? String(rule.rate) : '')
  const [weekDay, setWeekDay] = useState(rule?.weekDay ?? 1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const draft = { unit, basis, rate: basis === 'RATE' ? parseNumberInput(rate) : null, weekDay: unit === 'WEEK' ? weekDay : 1 }

  async function handleSubmit(e) {
    e.preventDefault()
    if (basis === 'RATE' && (draft.rate === null || Number.isNaN(draft.rate) || draft.rate < 0)) {
      return setError('Tarif harus berupa angka nol atau lebih.')
    }
    setSaving(true)
    setError('')
    const ok = await onSave({ unit, basis, rate: basis === 'RATE' ? draft.rate : null, weekDay: draft.weekDay })
    if (!ok) setSaving(false)
  }

  async function handleRemove() {
    setSaving(true)
    const ok = await onRemove()
    if (!ok) setSaving(false)
  }

  return (
    <Modal title={`Aturan hitung: ${item.label}`} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="pv-field">
          <span className="pv-field-label">Dihitung per</span>
          <div className="pv-types bc-three" role="radiogroup" aria-label="Satuan hitung">
            {UNIT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={unit === option.value}
                className="pv-type"
                onClick={() => setUnit(option.value)}
              >
                <b>{option.label}</b>
                <small>{option.hint}</small>
              </button>
            ))}
          </div>
        </div>

        {unit === 'WEEK' && (
          <label>
            Ditarik setiap hari
            <select value={weekDay} onChange={(e) => setWeekDay(Number(e.target.value))}>
              {WEEKDAYS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="pv-field">
          <span className="pv-field-label">Cara menentukan besarnya</span>
          <div className="pv-types" role="radiogroup" aria-label="Dasar tarif">
            {BASIS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={basis === option.value}
                className="pv-type"
                onClick={() => setBasis(option.value)}
              >
                <b>{option.label}</b>
                <small>{option.hint}</small>
              </button>
            ))}
          </div>
        </div>

        {basis === 'RATE' && (
          <label>
            Tarif per {unit === 'DAY' ? 'hari' : unit === 'WORKDAY' ? 'hari kerja' : 'minggu'} (Rp)
            <input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="mis. 25.000"
              autoFocus
            />
          </label>
        )}

        <p className="bc-preview" aria-live="polite">
          {previewText(draft, item.rawAmount, days, monthLabel)}
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions bc-actions">
          {rule && (
            <button type="button" className="outline-button pv-danger bc-remove" onClick={handleRemove} disabled={saving}>
              Hapus aturan
            </button>
          )}
          <button type="button" className="outline-button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
