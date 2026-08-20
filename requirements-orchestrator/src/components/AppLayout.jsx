import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  IconOrchestrate,
  IconDashboard,
  IconHistory,
} from './icons.jsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/orchestrate', label: 'Orchestrate', Icon: IconOrchestrate },
  { to: '/history', label: 'Run History', Icon: IconHistory },
]

const TITLES = {
  '/dashboard': 'Dashboard',
  '/orchestrate': 'Orchestrate Requirements',
  '/history': 'Run History',
}

/**
 * AppLayout
 * Persistent sidebar + top bar shell rendered around every route via <Outlet />.
 */
export default function AppLayout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Requirements Orchestrator'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <IconOrchestrate width={20} height={20} />
          </span>
          Requirements Orchestrator
        </div>

        <nav style={{ display: 'grid', gap: 4 }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
            >
              <Icon width={18} height={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          v1.0 · Multi-agent delivery planning
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="topbar__title">{title}</span>
          <span className="badge badge--muted">Multi-Agent AI</span>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
