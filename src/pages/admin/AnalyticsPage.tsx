import { useOwnerEntries } from '../../lib/firebase/entries'
import type { Entry } from '../../types'

function topByViews(entries: Entry[], n = 10) {
  return [...entries]
    .filter((e) => e.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, n)
}

export default function AnalyticsPage() {
  const { data: entries = [], isLoading } = useOwnerEntries()

  const top = topByViews(entries)
  const byType = ['article', 'diary', 'note', 'timeline', 'project', 'gallery'].map((type) => ({
    type,
    count: entries.filter((e) => e.type === type).length,
  }))
  const aiTotal = entries.filter((e) => e.aiInclude).length
  const aiByType = byType.map((b) => ({
    ...b,
    ai: entries.filter((e) => e.type === b.type && e.aiInclude).length,
  }))

  if (isLoading) return <p className="text-sm text-gray-400">Loading…</p>

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900">Analytics</h1>

      {/* Top posts */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Top posts by views</h2>
        {top.length === 0 ? (
          <p className="text-sm text-gray-400">No views recorded yet.</p>
        ) : (
          <ol className="space-y-2">
            {top.map((e, i) => (
              <li key={e.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{e.title || 'Untitled'}</span>
                </div>
                <span className="text-sm text-gray-500">{e.viewCount} views</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Content by type */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Content overview</h2>
        <div className="grid grid-cols-3 gap-3">
          {byType.map((b) => (
            <div key={b.type} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{b.count}</div>
              <div className="text-xs text-gray-500 capitalize">{b.type}s</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI training */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">AI training dataset</h2>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5 mb-4">
          <div className="text-3xl font-bold text-indigo-700">{aiTotal}</div>
          <div className="text-sm text-indigo-600 mt-0.5">entries included in AI training</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {aiByType.filter((b) => b.ai > 0).map((b) => (
            <div key={b.type} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{b.ai}</div>
              <div className="text-xs text-gray-500 capitalize">{b.type}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          For traffic sources and page view trends, visit your <strong>Vercel Analytics</strong> dashboard.
        </p>
      </section>
    </div>
  )
}
