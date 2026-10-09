'use client'
import { useRef, useState } from 'react'
import { formatRp } from '@/lib/formatters'
import { isNumericType, parseNumberInput } from '@/lib/pivot'

const numberFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Teks tampilan sebuah nilai sel sesuai jenis kolomnya. Nilai kosong menghasilkan string kosong. */
export function formatCell(column, value) {
  if (value === undefined || value === null || value === '') return ''
  if (column.type === 'CURRENCY') return formatRp(Number(value))
  if (column.type === 'NUMBER') return numberFormat.format(Number(value))
  if (column.type === 'DATE') return formatDate(value)
  return value
}

/**
 * Sel kolom kustom yang bisa diedit di tempat: klik (atau Enter) untuk mengubah, Enter/klik di luar untuk menyimpan,
 * Esc untuk membatalkan. Centang langsung tersimpan; pilihan tersimpan saat dipilih.
 */
export function PivotCell({ column, value, onCommit, onInvalid }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const cancelled = useRef(false)

  if (column.type === 'CHECKBOX') {
    const checked = value === 'true'
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={column.name}
        className={`pv-check${checked ? ' is-on' : ''}`}
        onClick={() => onCommit(checked ? null : true)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </button>
    )
  }

  function open() {
    cancelled.current = false
    setDraft(value ?? '')
    setEditing(true)
  }

  function commit(raw) {
    setEditing(false)
    if (cancelled.current) return
    let next
    if (isNumericType(column.type)) {
      const number = parseNumberInput(raw)
      if (Number.isNaN(number)) {
        onInvalid?.('Angka tidak valid.')
        return
      }
      next = number === null ? null : String(number)
    } else {
      next = raw.trim() === '' ? null : raw.trim()
    }
    if ((next ?? '') === (value ?? '')) return
    onCommit(next)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      cancelled.current = true
      e.currentTarget.blur()
    }
  }

  if (editing && column.type === 'SELECT') {
    return (
      <select
        className="pv-input"
        autoFocus
        value={draft}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
      >
        <option value="">—</option>
        {column.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  if (editing) {
    return (
      <input
        className="pv-input"
        autoFocus
        type={column.type === 'DATE' ? 'date' : 'text'}
        inputMode={isNumericType(column.type) ? 'decimal' : undefined}
        value={draft}
        maxLength={column.type === 'TEXT' ? 500 : undefined}
        aria-label={column.name}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select?.()}
      />
    )
  }

  const text = formatCell(column, value)
  return (
    <button type="button" className="pv-cell" onClick={open} aria-label={`${column.name}: ${text || 'kosong'}. Ubah`}>
      {text === '' ? (
        <span className="pv-placeholder">—</span>
      ) : column.type === 'SELECT' ? (
        <span className="pv-pill">{text}</span>
      ) : (
        text
      )}
    </button>
  )
}
