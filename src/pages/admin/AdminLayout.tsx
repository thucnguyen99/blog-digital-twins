import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Button from '../../components/ui/Button'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/editor', label: '+ New Entry' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/snapshots', label: 'AI Snapshots' },
]

export default function AdminLayout() {
  const { user, signOut } = useAuthStore()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-900 truncate">{user?.displayName ?? user?.email}</div>
          <div className="text-xs text-gray-500">Owner</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <Button variant="ghost" className="w-full text-left" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
