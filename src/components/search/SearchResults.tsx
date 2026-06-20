import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Badge from '../ui/Badge'
import type { Entry } from '../../types'

interface Props {
  results: Entry[]
  query: string
}

export default function SearchResults({ results, query }: Props) {
  if (!query) return null
  if (results.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No results for <strong>"{query}"</strong>. Try broader terms or check the spelling.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {results.map((e) => {
        const date = e.publishedAt?.toDate() ?? e.createdAt?.toDate()
        return (
          <li key={e.id}>
            <Link
              to={`/blog/${e.id}`}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-wrap gap-1 mb-1">
                {e.emotionLabels.slice(0, 3).map((l) => <Badge key={l} label={l} />)}
              </div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {e.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{e.excerpt}</p>
              <div className="mt-2 text-xs text-gray-400 flex gap-2">
                {date && <span>{format(date, 'MMM d, yyyy')}</span>}
                <span>·</span>
                <span>{e.readingTimeMin} min read</span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
