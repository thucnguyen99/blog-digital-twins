import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from './config'
import type { Entry, EntryFormData, EntryType, EmotionLabel } from '../../types'

const ENTRIES_KEY = 'entries'

function computeExcerpt(content: string): string {
  const plain = content.replace(/[#*`_[\]()!]/g, '').trim()
  return plain.slice(0, 500)
}

function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

// ─── Public queries ────────────────────────────────────────────────────────

async function fetchPublicEntries(type?: EntryType, emotionLabel?: EmotionLabel): Promise<Entry[]> {
  const now = Timestamp.now()
  const constraints: Parameters<typeof query>[1][] = [
    where('visibility', 'in', ['public', 'future_release']),
    orderBy('createdAt', 'desc'),
  ]
  if (type) constraints.push(where('type', '==', type))
  if (emotionLabel) constraints.push(where('emotionLabels', 'array-contains', emotionLabel))

  const q = query(collection(db, 'entries'), ...constraints)
  const snap = await getDocs(q)
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry)

  // Filter out future_release entries whose publishAt is still in the future
  // and diary entries (hard gate — belt-and-suspenders alongside Security Rules)
  return all.filter((e) => {
    if (e.type === 'diary') return false
    if (e.visibility === 'future_release') {
      return e.publishAt != null && e.publishAt.toMillis() <= now.toMillis()
    }
    return true
  })
}

async function fetchEntry(id: string): Promise<Entry | null> {
  const snap = await getDoc(doc(db, 'entries', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Entry) : null
}

// ─── Owner queries ─────────────────────────────────────────────────────────

async function fetchOwnerEntries(type?: EntryType): Promise<Entry[]> {
  const constraints: Parameters<typeof query>[1][] = [orderBy('updatedAt', 'desc')]
  if (type) constraints.push(where('type', '==', type))
  const q = query(collection(db, 'entries'), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entry)
}

// ─── React Query hooks ─────────────────────────────────────────────────────

export function usePublicEntries(type?: EntryType, emotionLabel?: EmotionLabel) {
  return useQuery({
    queryKey: [ENTRIES_KEY, 'public', type, emotionLabel],
    queryFn: () => fetchPublicEntries(type, emotionLabel),
    staleTime: 300_000,
  })
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: [ENTRIES_KEY, id],
    queryFn: () => fetchEntry(id),
    staleTime: 300_000,
    enabled: Boolean(id),
  })
}

export function useOwnerEntries(type?: EntryType) {
  return useQuery({
    queryKey: [ENTRIES_KEY, 'owner', type],
    queryFn: () => fetchOwnerEntries(type),
    staleTime: 300_000,
  })
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: EntryFormData) => {
      const now = serverTimestamp()
      const payload = {
        ...data,
        excerpt: computeExcerpt(data.content),
        readingTimeMin: computeReadingTime(data.content),
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
        ...(data.visibility === 'public' ? { publishedAt: now } : {}),
      }
      return addDoc(collection(db, 'entries'), payload)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ENTRIES_KEY] }),
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EntryFormData> }) => {
      const payload: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
      }
      if (data.content) {
        payload.excerpt = computeExcerpt(data.content)
        payload.readingTimeMin = computeReadingTime(data.content)
      }
      return updateDoc(doc(db, 'entries', id), payload)
    },
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] })
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY, id] })
    },
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDoc(doc(db, 'entries', id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ENTRIES_KEY] }),
  })
}

export function useIncrementViewCount() {
  return useMutation({
    mutationFn: (id: string) =>
      updateDoc(doc(db, 'entries', id), { viewCount: increment(1) }),
  })
}
