import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEntry, usePublicEntries, useIncrementViewCount } from '../../lib/firebase/entries'
import { setPageTitle, setMeta } from '../../lib/meta'
import Badge from '../../components/ui/Badge'
import PostCard from '../../components/blog/PostCard'
import { markdownComponents } from '../../lib/markdown/directives'

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const { data: entry, isLoading } = useEntry(id ?? '')
  const { mutate: incrementViewCount } = useIncrementViewCount()

  useEffect(() => {
    if (!entry) return
    setPageTitle(entry.title)
    setMeta('og:description', entry.excerpt)
    if (entry.coverImage) setMeta('og:image', entry.coverImage)
    setMeta('og:type', 'article')
  }, [entry])

  // Increment view count once per session per entry
  useEffect(() => {
    if (!id || !entry) return
    const key = `viewed_${id}`
    if (!sessionStorage.getItem(key)) {
      incrementViewCount(id)
      sessionStorage.setItem(key, '1')
    }
  }, [id, entry, incrementViewCount])

  const { data: allEntries = [] } = usePublicEntries()
  const related = allEntries
    .filter(
      (e) =>
        e.id !== id &&
        e.emotionLabels.some((l) => entry?.emotionLabels.includes(l)),
    )
    .slice(0, 3)

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-400">Loading…</div>
  if (!entry) return <div className="max-w-3xl mx-auto px-4 py-12 text-gray-500">Post not found.</div>

  const date = entry.publishedAt?.toDate() ?? entry.createdAt?.toDate()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/blog" className="text-sm text-indigo-600 hover:underline mb-6 block">← Back to blog</Link>

      {/* Header */}
      <div className="mb-8">
        {entry.emotionLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {entry.emotionLabels.map((l) => <Badge key={l} label={l} />)}
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">{entry.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
          {date && <span>{format(date, 'MMMM d, yyyy')}</span>}
          <span>·</span>
          <span>{entry.readingTimeMin} min read</span>
          <span>·</span>
          <span>{entry.viewCount} views</span>
        </div>
      </div>

      {/* Cover */}
      {entry.coverImage && (
        <img src={entry.coverImage} alt="" loading="lazy" className="w-full rounded-xl mb-8 object-cover max-h-96" />
      )}

      {/* Content */}
      <article className="prose prose-gray max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {entry.content}
        </ReactMarkdown>
      </article>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {entry.tags.map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">#{t}</span>
          ))}
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((e) => <PostCard key={e.id} entry={e} />)}
          </div>
        </div>
      )}
    </div>
  )
}
