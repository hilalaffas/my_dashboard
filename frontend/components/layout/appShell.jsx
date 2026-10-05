import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
export function AppShell({ children }) {
  return (
    <main className="app-shell">
      <Sidebar />
      <section className="content">
        <Topbar />
        <div className="page-content">{children}</div>
      </section>
    </main>
  )
}
