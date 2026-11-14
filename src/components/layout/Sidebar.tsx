import type { NavigationItem, AppRoute } from '../../app/navigation'
import { navigationItems } from '../../app/navigation'

interface SidebarProps {
  activeRoute: AppRoute
  onNavigate: (route: AppRoute) => void
}

function NavigationIcon({ icon }: Pick<NavigationItem, 'icon'>) {
  if (icon === 'plus') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    )
  }

  if (icon === 'book') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4.75A2.75 2.75 0 0 1 7.75 2H19v17H7.75A2.75 2.75 0 0 0 5 21.75v-17Z" />
        <path d="M5 19.25A2.75 2.75 0 0 1 7.75 22H19" />
      </svg>
    )
  }

  if (icon === 'study') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 8 8-4 8 4-8 4-8-4Z" />
        <path d="M7 10.25v4.5c2.8 2.2 7.2 2.2 10 0v-4.5M20 8v7" />
      </svg>
    )
  }

  if (icon === 'progress') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19V5M4 19h16" />
        <path d="m7 15 3-3 3 2 5-6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}

export function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </span>
        <span>Project Language</span>
      </div>

      <nav className="main-navigation" aria-label="Main navigation">
        <p className="navigation-label">Workspace</p>
        <div className="navigation-list">
          {navigationItems.map((item) => {
            const isActive = item.route === activeRoute

            return (
              <button
                className={`navigation-item${isActive ? ' is-active' : ''}`}
                key={item.route}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.route)}
              >
                <span className="navigation-icon">
                  <NavigationIcon icon={item.icon} />
                </span>
                <span className="navigation-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="profile-mark" aria-hidden="true">
          PL
        </div>
        <div>
          <strong>Personal workspace</strong>
          <span>Learn at your pace</span>
        </div>
      </div>
    </aside>
  )
}
