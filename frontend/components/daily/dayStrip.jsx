'use client'
import { useEffect, useRef } from 'react'

const SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

/** Deretan hari satu bulan untuk memilih tanggal. Titik di bawah angka: oranye = ada yang belum diisi, merah = melebihi rencana, hijau = beres. */
export function DayStrip({ days, selectedIso, todayIso, statusOf, onSelect }) {
  const refs = useRef(new Map())

  useEffect(() => {
    const el = refs.current.get(selectedIso)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [selectedIso])

  return (
    <div className="dt-strip" role="group" aria-label="Pilih tanggal">
      {days.map((d) => {
        const status = statusOf(d.iso)
        const classes = ['dt-chip']
        if (d.weekend || d.holiday) classes.push('is-off')
        if (d.iso === todayIso) classes.push('is-today')
        return (
          <button
            key={d.iso}
            type="button"
            ref={(el) => {
              if (el) refs.current.set(d.iso, el)
              else refs.current.delete(d.iso)
            }}
            className={classes.join(' ')}
            aria-pressed={d.iso === selectedIso}
            aria-current={d.iso === todayIso ? 'date' : undefined}
            aria-label={`Tanggal ${d.day}${status === 'pending' ? ', ada yang belum diisi' : status === 'over' ? ', melebihi rencana' : ''}`}
            onClick={() => onSelect(d.iso)}
          >
            <small>{SHORT[d.dow - 1]}</small>
            <b>{d.day}</b>
            <i className={`dt-dot ${status}`} />
          </button>
        )
      })}
    </div>
  )
}
