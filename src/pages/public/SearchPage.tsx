import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePublicEntries } from '../../lib/firebase/entries'
import { buildSearchIndex, search } from '../../lib/search'
import { setPageTitle } from '../../lib/meta'
import SearchBar from '../../components/search/SearchBar'
import SearchResults from '../../components/search/SearchResults'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  useEffect(() => { setPageTitle('Search') }, [])

  const { data: entries = [] } = usePublicEntries()

  const index = useMemo(() => buildSearchIndex(entries), [entries])
  const results = useMemo(() => search(index, query), [index, query])

  const handleQuery = (q: string) => {
    setQuery(q)
    if (q) setParams({ q })
    else setParams({})
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>
      <SearchBar value={query} onChange={handleQuery} />
      <div className="mt-6">
        <SearchResults results={results} query={query} />
      </div>
    </div>
  )
}
