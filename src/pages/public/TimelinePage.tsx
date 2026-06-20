import { useEffect } from 'react'
import { usePublicEntries } from '../../lib/firebase/entries'
import { setPageTitle } from '../../lib/meta'
import TimelineRail from '../../components/timeline/TimelineRail'

export default function TimelinePage() {
  const { data: entries = [], isLoading } = usePublicEntries('timeline')

  useEffect(() => { setPageTitle('Timeline') }, [])

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
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-gray-200 mt-1" />
                <div className="flex-1 w-px bg-gray-100 mt-1" />
              </div>
              <div className="pb-8 flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TimelineRail entries={sorted} />
      )}
    </div>
  )
}
