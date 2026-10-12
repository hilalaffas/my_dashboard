'use client'

const MODES = [
  { value: 'AUTO', label: 'Auto' },
  { value: 'MANUAL', label: 'Manual' },
]

/** Saklar dua pilihan Auto / Manual dengan penanda yang meluncur. */
export function ModeToggle({ mode, disabled, onChange, label }) {
  return (
    <div className="dt-mode" role="radiogroup" aria-label={label} data-mode={mode}>
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={mode === m.value}
          disabled={disabled}
          onClick={() => mode !== m.value && onChange(m.value)}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
