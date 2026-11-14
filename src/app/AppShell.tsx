import type { AppRoute } from './navigation'
import { Sidebar } from '../components/layout/Sidebar'

interface AppShellProps {
  activeRoute: AppRoute
  onNavigate: (route: AppRoute) => void
  children: React.ReactNode
}

export function AppShell({
  activeRoute,
  onNavigate,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />
      <main className="main-content">
        <div className="content-container">{children}</div>
      </main>
    </div>
  )
}
