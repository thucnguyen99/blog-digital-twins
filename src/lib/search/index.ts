import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Entry } from '../../types'

const FUSE_OPTIONS: IFuseOptions<Entry> = {
  threshold: 0.3,
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'excerpt', weight: 0.3 },
    { name: 'tags', weight: 0.1 },
    { name: 'peopleTags', weight: 0.1 },
    { name: 'placeTags', weight: 0.05 },
    { name: 'emotionLabels', weight: 0.05 },
  ],
}

export function buildSearchIndex(entries: Entry[]): Fuse<Entry> {
  return new Fuse(entries, FUSE_OPTIONS)
}

export function search(index: Fuse<Entry>, query: string): Entry[] {
  if (!query.trim()) return []
  return index.search(query).map((r) => r.item)
}
