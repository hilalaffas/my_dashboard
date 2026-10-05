/** Pesan di bawah form. type: 'error' | 'info'. */
export function FormMessage({ type, children }) {
  if (!children) return null
  return (
    <p className={`lg-message lg-message-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
