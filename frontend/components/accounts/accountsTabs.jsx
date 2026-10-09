'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Struktur', href: '/accounts' },
  { label: 'Kalender', href: '/accounts/calendar' },
]

/** Tab di dalam menu Accounts. Gaya tab sama dengan menu Manage. */
export function AccountsTabs() {
  const pathname = usePathname()
  return (
    <nav className="mg-tabs" aria-label="Menu Accounts">
      {tabs.map(({ label, href }) => (
        <Link key={href} href={href} className={pathname === href ? 'active' : ''} aria-current={pathname === href ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  )
}
