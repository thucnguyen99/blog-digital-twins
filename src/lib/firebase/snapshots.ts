import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from './config'
import type { Snapshot } from '../../types'

const SNAPSHOTS_KEY = 'snapshots'

async function fetchSnapshots(): Promise<Snapshot[]> {
  const q = query(collection(db, 'snapshots'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Snapshot)
}

export function useSnapshots() {
  return useQuery({
    queryKey: [SNAPSHOTS_KEY],
    queryFn: fetchSnapshots,
    staleTime: 300_000,
  })
}

export function useCreateSnapshot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Snapshot, 'id' | 'createdAt'>) =>
      addDoc(collection(db, 'snapshots'), {
        ...data,
        createdAt: serverTimestamp(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SNAPSHOTS_KEY] }),
  })
}

export function useDeleteSnapshot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDoc(doc(db, 'snapshots', id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SNAPSHOTS_KEY] }),
  })
}
