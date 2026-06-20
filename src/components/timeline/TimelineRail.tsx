import { useMemo, useState } from 'react'
import TimelineEventCard from './TimelineEventCard'
import type { Entry } from '../../types'

export default function TimelineRail({ entries }: { entries: Entry[] }) {
  const years = useMemo(() => {
    const ys = new Set(entries.map((e) => {
      const d = e.eventDate?.toDate() ?? e.createdAt?.toDate()
      return d?.getFullYear()
    }).filter(Boolean))
    return [...ys].sort((a, b) => (b ?? 0) - (a ?? 0))
  }, [entries])

  const [activeYear, setActiveYear] = useState<number | null>(null)
  const shown = activeYear ? entries.filter((e) => {
    const d = e.eventDate?.toDate() ?? e.createdAt?.toDate()
    return d?.getFullYear() === activeYear
  }) : entries

  return (
    <div className="flex gap-8">
      {/* Year nav */}
      <aside className="hidden md:flex flex-col gap-1 pt-1 shrink-0">
        <button
          onClick={() => setActiveYear(null)}
          className={`text-xs font-medium px-2 py-1 rounded ${!activeYear ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          All
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setActiveYear(y ?? null)}
            className={`text-xs font-medium px-2 py-1 rounded ${activeYear === y ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {y}
          </button>
        ))}
      </aside>

      {/* Events */}
      <div className="flex-1">
        {shown.length === 0 ? (
          <p className="text-sm text-gray-500">No events yet.</p>
        ) : (
          shown.map((e) => <TimelineEventCard key={e.id} entry={e} />)
        )}
      </div>
    </div>
  )
}
