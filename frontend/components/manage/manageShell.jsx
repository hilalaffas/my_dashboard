'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSuperuserGuard } from '@/hooks/useSuperuserGuard'

const tabs = [
  { label: 'Edit profil', href: '/manage/profile' },
  { label: 'Manage akun', href: '/manage/users' },
  { label: 'Hari libur', href: '/manage/holidays' },
]

/** Kerangka menu Manage: judul + tab. Khusus superuser; selain itu diarahkan ke /overview oleh guard. */
export function ManageShell({ children }) {
  const isSuperuser = useSuperuserGuard()
  const pathname = usePathname()

  if (!isSuperuser) return null

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> Superuser
          </div>
          <h1>Manage</h1>
          <p>Kelola profil Anda, akun pengguna, dan hari libur.</p>
        </div>
      </div>

      <nav className="mg-tabs" aria-label="Menu Manage">
        {tabs.map(({ label, href }) => (
          <Link key={href} href={href} className={pathname === href ? 'active' : ''} aria-current={pathname === href ? 'page' : undefined}>
            {label}
          </Link>
        ))}
      </nav>

      {children}
    </>
  )
}
