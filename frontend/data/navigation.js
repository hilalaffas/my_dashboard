import { BarChart3, FileSpreadsheet, LayoutDashboard, UserCog, WalletCards } from 'lucide-react'

export const navItems = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Cost estimates', href: '/cost-estimates', icon: FileSpreadsheet },
  { label: 'Accounts', href: '/accounts', icon: WalletCards },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

/** Hanya ditampilkan untuk superuser (role ADMIN). */
export const adminNavItems = [
  { label: 'Manage', href: '/manage', icon: UserCog },
]
