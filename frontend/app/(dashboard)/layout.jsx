import { AuthGate } from '@/components/auth/authGate'
import { ToastProvider } from '@/components/common/toastProvider'
import { AppShell } from '@/components/layout/appShell'
export default function DashboardLayout({ children }) {
  return (
    <AuthGate>
      <ToastProvider>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </AuthGate>
  )
}
