import { NavLink } from 'react-router-dom'

// Route map lives here so App.jsx and Navigation stay in sync.
// Later layers can restyle this freely without touching routing.
export const ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/character', label: 'Character Profile' },
  { path: '/movies', label: 'Movie Archive' },
  { path: '/batman', label: 'Batman Protocol' },
  { path: '/nioh', label: 'Nioh Profile' },
  { path: '/inventory', label: 'Inventory' },
  { path: '/story', label: 'Story Map' },
  { path: '/candle', label: 'Candle Scene' },
  { path: '/final', label: 'Final Message' },
  { path: '/audio', label: 'Audio Message' },
]

export default function Navigation() {
  return (
    <nav className="border-b border-line px-4 py-3 overflow-x-auto">
      <ul className="flex gap-4 whitespace-nowrap font-mono text-xs uppercase tracking-widest2">
        {ROUTES.map((route) => (
          <li key={route.path}>
            <NavLink
              to={route.path}
              end={route.path === '/'}
              className={({ isActive }) =>
                isActive ? 'text-gold' : 'text-ash hover:text-bone'
              }
            >
              {route.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
