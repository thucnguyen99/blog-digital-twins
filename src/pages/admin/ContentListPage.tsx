import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useOwnerEntries, useDeleteEntry } from '../../lib/firebase/entries'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { Entry, EntryType } from '../../types'

const ALL_TYPES: { value: EntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'diary', label: 'Diary' },
  { value: 'note', label: 'Notes' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'project', label: 'Projects' },
  { value: 'gallery', label: 'Gallery' },
]

const PRIVATE_TYPES: EntryType[] = ['diary', 'note']

export default function ContentListPage() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState<EntryType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'public' | 'private'>('public')
  const [toDelete, setToDelete] = useState<Entry | null>(null)

  const { data: entries = [], isLoading } = useOwnerEntries()
  const { mutate: deleteEntry } = useDeleteEntry()

  const filtered = entries.filter((e) => {
    const isPrivate = PRIVATE_TYPES.includes(e.type) || e.visibility === 'private'
    if (tab === 'private' && !isPrivate) return false
    if (tab === 'public' && isPrivate) return false
    if (typeFilter !== 'all' && e.type !== typeFilter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const visibilityBadge = (e: Entry) => {
    if (e.visibility === 'public') return <span className="text-xs text-green-600 font-medium">Public</span>
    if (e.visibility === 'future_release') return <span className="text-xs text-blue-600 font-medium">Scheduled</span>
    return <span className="text-xs text-gray-400 font-medium">Private</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Content</h1>
        <Button onClick={() => navigate('/admin/editor')}>+ New entry</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {(['public', 'private'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'private' ? 'Private content' : 'Public content'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-1">
          {ALL_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === t.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No entries found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Updated</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Views</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">AI</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{e.title || <span className="text-gray-400">Untitled</span>}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{e.type}</td>
                  <td className="px-4 py-3">{visibilityBadge(e)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {e.updatedAt ? format(e.updatedAt.toDate(), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.viewCount ?? 0}</td>
                  <td className="px-4 py-3">
                    {e.aiInclude ? <span className="text-green-600 text-xs">✓</span> : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => navigate(`/admin/editor/${e.id}`)}>Edit</Button>
                      <Button variant="danger" onClick={() => setToDelete(e)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete entry"
      >
        <p className="text-sm text-gray-600 mb-4">
          Delete <strong>"{toDelete?.title || 'Untitled'}"</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (toDelete) { deleteEntry(toDelete.id); setToDelete(null) } }}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
