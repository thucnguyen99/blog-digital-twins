import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePublicEntries } from '../../lib/firebase/entries'
import { setPageTitle } from '../../lib/meta'
import PostCard from '../../components/blog/PostCard'
import EmotionFilter from '../../components/blog/EmotionFilter'

export default function BlogPage() {
  const [params, setParams] = useSearchParams()
  const emotion = params.get('emotion')

  const { data: entries = [], isLoading } = usePublicEntries(undefined, emotion ?? undefined)

  useEffect(() => { setPageTitle('Blog') }, [])

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
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-xl" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
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
