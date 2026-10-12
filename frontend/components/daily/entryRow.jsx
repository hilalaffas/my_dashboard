'use client'
import { useEffect, useRef, useState } from 'react'
import { formatRp } from '@/lib/formatters'
import { parseNumberInput } from '@/lib/pivot'

/**
 * Satu item pada satu tanggal.
 * MANUAL: kolom isian pengeluaran nyata (kosong = belum diisi, 0 = tidak ada pengeluaran).
 * AUTO: terpotong otomatis sesuai jadwal; bisa dikoreksi, dan koreksi bisa dikembalikan ke jadwal.
 */
export function EntryRow({ item, iso, day, future, onSave, onInvalid }) {
  const manual = item.mode === 'MANUAL'
  // Nilai awal langsung dari data agar isian tidak kosong sesaat sebelum terisi
  const [text, setText] = useState(() => (day.actual !== null ? String(day.actual) : ''))
  const [correcting, setCorrecting] = useState(false)
  const cancelled = useRef(false) // Esc membatalkan: blur yang menyusul tidak boleh menyimpan

  useEffect(() => {
    setText(day.actual !== null ? String(day.actual) : '')
    setCorrecting(false)
  }, [day.actual, iso])

  async function commit() {
    if (cancelled.current) {
      cancelled.current = false
      return
    }
    const value = parseNumberInput(text)
    if (Number.isNaN(value) || (value !== null && value < 0)) {
      onInvalid('Jumlah harus berupa angka nol atau lebih.')
      setText(day.actual !== null ? String(day.actual) : '')
      return
    }
    if (value === day.actual) {
      setCorrecting(false)
      return
    }
    // Pada AUTO, mengosongkan isian berarti kembali ke jadwal
    await onSave(item.itemId, iso, value)
    setCorrecting(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      cancelled.current = true
      setText(day.actual !== null ? String(day.actual) : '')
      setCorrecting(false)
      e.currentTarget.blur()
    }
  }

  const input = (
    <input
      className="dt-input"
      inputMode="decimal"
      value={text}
      placeholder={day.planned > 0 ? String(day.planned) : '0'}
      aria-label={`Pengeluaran ${item.name}`}
      autoFocus={correcting}
      disabled={future}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  )

  let control
  if (future) {
    control = <span className="dt-muted">{day.planned > 0 ? `Dijadwalkan ${formatRp(day.planned)}` : 'Belum waktunya'}</span>
  } else if (manual) {
    control = (
      <>
        {input}
        {day.actual === null && day.planned > 0 && (
          <>
            <button type="button" className="text-button" onClick={() => onSave(item.itemId, iso, day.planned)}>
              Sesuai rencana
            </button>
            <button type="button" className="text-button" onClick={() => onSave(item.itemId, iso, 0)}>
              Tidak ada
            </button>
          </>
        )}
      </>
    )
  } else if (correcting) {
    control = input
  } else if (day.state === 'override') {
    control = (
      <>
        <b className="dt-amount">{formatRp(day.actual)}</b>
        <span className="dt-badge">Dikoreksi</span>
        <button type="button" className="text-button" onClick={() => onSave(item.itemId, iso, null)}>
          Kembalikan
        </button>
      </>
    )
  } else {
    control = (
      <>
        <b className="dt-amount">{formatRp(day.actual ?? 0)}</b>
        <span className="dt-badge is-auto">Terpotong otomatis</span>
        <button type="button" className="text-button" onClick={() => setCorrecting(true)}>
          Koreksi
        </button>
      </>
    )
  }

  const stateClass = day.state === 'pending' ? ' is-pending' : ''
  return (
    <li className={`dt-row${stateClass}`}>
      <div className="dt-row-info">
        <b>{item.name}</b>
        <small>
          {item.path}
          {day.planned > 0 && ` · Rencana ${formatRp(day.planned)}`}
          {day.planned === 0 && !future && ' · Tidak dijadwalkan hari ini'}
        </small>
      </div>
      <div className="dt-row-control">{control}</div>
    </li>
  )
}
