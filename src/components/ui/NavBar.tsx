import { Link, NavLink } from 'react-router-dom'
import { useOwnerProfile } from '../../lib/firebase/profile'

const LINKS = [
  { to: '/blog', label: 'Blog' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/search', label: 'Search' },
]

export default function NavBar() {
  const { data: profile } = useOwnerProfile()

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-gray-900 hover:text-indigo-600 transition-colors">
          {profile?.displayName ?? 'Dấu Ấn'}
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
