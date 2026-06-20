import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Badge from '../ui/Badge'
import type { Entry } from '../../types'

export default function PostCard({ entry }: { entry: Entry }) {
  const date = entry.publishedAt?.toDate() ?? entry.createdAt?.toDate()
  return (
    <Link
      to={`/blog/${entry.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {entry.coverImage && (
        <img
          src={entry.coverImage}
          alt=""
          loading="lazy"
          className="h-48 w-full object-cover"
        />
      )}
      <div className="p-5">
        {entry.emotionLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {entry.emotionLabels.map((l) => <Badge key={l} label={l} />)}
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {entry.title}
        </h2>
        {entry.excerpt && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-3">{entry.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          {date && <span>{format(date, 'MMM d, yyyy')}</span>}
          <span>·</span>
          <span>{entry.readingTimeMin} min read</span>
        </div>
      </div>
    </Link>
  )
}
