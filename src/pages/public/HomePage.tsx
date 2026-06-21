import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useOwnerProfile } from '../../lib/firebase/profile'
import { usePublicEntries } from '../../lib/firebase/entries'
import { setMeta, setPageTitle } from '../../lib/meta'
import PostCard from '../../components/blog/PostCard'

export default function HomePage() {
  const { data: profile } = useOwnerProfile()
  const { data: entries = [], error: entriesError, isLoading: entriesLoading } = usePublicEntries()
  const recent = entries.slice(0, 6)
  const firebaseProject = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '(not set)'
  const siteName = profile?.displayName ?? 'Dấu Ấn'

  useEffect(() => {
    setPageTitle(siteName, siteName)
    setMeta('og:description', profile?.tagline ?? profile?.bio?.slice(0, 160) ?? '')
    setMeta('og:type', 'website')
  }, [siteName, profile])

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="flex flex-col sm:flex-row items-start gap-8 mb-16">
        {profile?.avatar && (
          <img
            src={profile.avatar}
            alt={profile.displayName}
            loading="lazy"
            className="h-24 w-24 rounded-full object-cover shrink-0"
          />
        )}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{profile?.displayName ?? 'Dấu Ấn'}</h1>
          {profile?.tagline && <p className="mt-1 text-lg text-indigo-600">{profile.tagline}</p>}
          {profile?.bio && <p className="mt-3 text-gray-600 max-w-prose">{profile.bio}</p>}
          <div className="mt-4 flex gap-4">
            <Link to="/blog" className="text-sm font-medium text-indigo-600 hover:underline">Blog</Link>
            <Link to="/timeline" className="text-sm font-medium text-indigo-600 hover:underline">Timeline</Link>
            <Link to="/search" className="text-sm font-medium text-indigo-600 hover:underline">Search</Link>
          </div>
        </div>
      </section>

      {/* Life stats */}
      {(profile?.lifeStats?.length ?? 0) > 0 && (
        <section className="mb-16">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Life stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(profile?.lifeStats ?? []).sort((a, b) => a.order - b.order).map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                {stat.icon && <div className="text-2xl mb-1">{stat.icon}</div>}
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Temp debug — remove after diagnosis */}
      <div style={{background:'#f0f0f0',padding:'8px',marginBottom:'16px',fontSize:'12px',fontFamily:'monospace'}}>
        FB project: {firebaseProject} | entries: {entriesLoading ? 'loading…' : entries.length} | error: {entriesError ? String(entriesError) : 'none'}
      </div>

      {/* Recent posts */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Recent posts</h2>
            <Link to="/blog" className="text-sm text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((e) => <PostCard key={e.id} entry={e} />)}
          </div>
        </section>
      )}
    </div>
  )
}
