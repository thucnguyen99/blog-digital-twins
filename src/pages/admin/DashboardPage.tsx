import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useOwnerEntries } from '../../lib/firebase/entries'
import Button from '../../components/ui/Button'
import type { EntryType } from '../../types'

const TYPES: EntryType[] = ['article', 'diary', 'note', 'timeline', 'project', 'gallery']

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: entries = [], isLoading } = useOwnerEntries()

  const countByType = (type: EntryType) => entries.filter((e) => e.type === type).length
  const aiCount = entries.filter((e) => e.aiInclude).length
  const recent = [...entries].slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <Button onClick={() => navigate('/admin/editor')}>+ New entry</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TYPES.map((type) => (
          <div key={type} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-2xl font-bold text-gray-900">{isLoading ? '…' : countByType(type)}</div>
            <div className="text-sm text-gray-500 capitalize">{type}s</div>
          </div>
        ))}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="text-2xl font-bold text-indigo-700">{isLoading ? '…' : aiCount}</div>
          <div className="text-sm text-indigo-600">AI-included</div>
        </div>
      </div>

      {/* Quick create */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick create</h2>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <Button
              key={type}
              variant="secondary"
              onClick={() => navigate('/admin/editor', { state: { type } })}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent entries</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/admin/editor/${e.id}`)}
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{e.title || 'Untitled'}</div>
                  <div className="text-xs text-gray-500 capitalize">{e.type} · {e.visibility}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {e.updatedAt ? format(e.updatedAt.toDate(), 'MMM d') : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
