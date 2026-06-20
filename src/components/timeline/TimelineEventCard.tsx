import { format } from 'date-fns'
import Badge from '../ui/Badge'
import type { Entry } from '../../types'

export default function TimelineEventCard({ entry }: { entry: Entry }) {
  const date = entry.eventDate?.toDate() ?? entry.createdAt?.toDate()
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 rounded-full bg-indigo-500 mt-1 shrink-0" />
        <div className="flex-1 w-px bg-gray-200 mt-1" />
      </div>
      <div className="pb-8">
        {date && (
          <time className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {format(date, 'MMMM yyyy')}
          </time>
        )}
        <h3 className="mt-1 text-base font-semibold text-gray-900">{entry.title}</h3>
        {entry.excerpt && <p className="mt-1 text-sm text-gray-600">{entry.excerpt}</p>}
        {entry.emotionLabels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.emotionLabels.map((l) => <Badge key={l} label={l} />)}
          </div>
        )}
      </div>
    </div>
  )
}
