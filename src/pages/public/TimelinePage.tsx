import { usePublicEntries } from '../../lib/firebase/entries'
import TimelineRail from '../../components/timeline/TimelineRail'

export default function TimelinePage() {
  const { data: entries = [], isLoading } = usePublicEntries('timeline')

  const sorted = [...entries].sort((a, b) => {
    const aMs = (a.eventDate ?? a.createdAt)?.toMillis() ?? 0
    const bMs = (b.eventDate ?? b.createdAt)?.toMillis() ?? 0
    return aMs - bMs
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Timeline</h1>
      <p className="text-gray-500 mb-10">Key moments, in chronological order.</p>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <TimelineRail entries={sorted} />
      )}
    </div>
  )
}
