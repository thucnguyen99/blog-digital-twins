import { useSearchParams } from 'react-router-dom'
import { usePublicEntries } from '../../lib/firebase/entries'
import PostCard from '../../components/blog/PostCard'
import EmotionFilter from '../../components/blog/EmotionFilter'

export default function BlogPage() {
  const [params, setParams] = useSearchParams()
  const emotion = params.get('emotion')

  const { data: entries = [], isLoading } = usePublicEntries(undefined, emotion ?? undefined)

  const setEmotion = (label: string | null) => {
    if (label) setParams({ emotion: label })
    else setParams({})
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-8">Articles, stories, and thoughts.</p>

      <div className="mb-8">
        <EmotionFilter selected={emotion} onChange={setEmotion} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((e) => <PostCard key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  )
}
