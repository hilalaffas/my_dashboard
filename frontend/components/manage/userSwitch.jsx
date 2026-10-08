'use client'

/** Saklar aktif/nonaktif yang bisa dipakai keyboard dan dibaca screen reader (role="switch"). */
export function UserSwitch({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="mg-switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="mg-switch-thumb" />
    </button>
  )
}
