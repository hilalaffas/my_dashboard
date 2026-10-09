'use client'

const SHORT_WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function dayLabel(d) {
  const parts = [`Tanggal ${d.day}`]
  if (d.holiday) parts.push(d.holiday.name)
  else if (d.weekend) parts.push('akhir pekan')
  else if (d.leave) parts.push('cuti')
  else parts.push('hari kerja')
  return parts.join(', ')
}

/**
 * Kalender satu bulan (Senin di kolom pertama). Tampilan murni: status tiap hari datang dari props.
 * Hanya hari kerja yang bisa diklik untuk menandai atau menghapus cuti; akhir pekan dan tanggal merah ditolak oleh onToggle.
 */
export function MonthCalendar({ days, todayIso, onToggle }) {
  const blanks = days.length > 0 ? days[0].dow - 1 : 0
  return (
    <div className="bc-calendar">
      <div className="bc-weekdays" aria-hidden="true">
        {SHORT_WEEKDAYS.map((name, i) => (
          <span key={name} className={i >= 5 ? 'is-weekend' : ''}>
            {name}
          </span>
        ))}
      </div>
      <div className="bc-grid">
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} className="bc-blank" aria-hidden="true" />
        ))}
        {days.map((d) => {
          const effectiveLeave = d.leave && !d.weekend && !d.holiday
          const classes = ['bc-day']
          if (d.weekend) classes.push('is-weekend')
          if (d.holiday) classes.push(d.holiday.kind === 'COLLECTIVE' ? 'is-collective' : 'is-holiday')
          if (effectiveLeave) classes.push('is-leave')
          if (d.iso === todayIso) classes.push('is-today')
          return (
            <button
              key={d.iso}
              type="button"
              className={classes.join(' ')}
              aria-pressed={effectiveLeave}
              aria-label={dayLabel(d)}
              title={d.holiday ? d.holiday.name : effectiveLeave ? 'Cuti' : undefined}
              onClick={() => onToggle(d)}
            >
              <span className="bc-num">{d.day}</span>
              {d.holiday && <span className="bc-tag">{d.holiday.kind === 'COLLECTIVE' ? 'Cuti bersama' : 'Libur'}</span>}
              {effectiveLeave && <span className="bc-tag is-leave">Cuti</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
