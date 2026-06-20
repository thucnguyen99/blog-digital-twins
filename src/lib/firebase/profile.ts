import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from './config'
import type { OwnerProfile, LifeStat, OwnerSettings } from '../../types'

const PROFILE_OWNER = 'profile/owner'
const PROFILE_SETTINGS = 'profile/settings'

async function fetchOwnerProfile(): Promise<OwnerProfile | null> {
  const snap = await getDoc(doc(db, 'profile', 'owner'))
  return snap.exists() ? (snap.data() as OwnerProfile) : null
}

async function fetchOwnerSettings(): Promise<OwnerSettings> {
  const snap = await getDoc(doc(db, 'profile', 'settings'))
  return snap.exists()
    ? (snap.data() as OwnerSettings)
    : { customEmotionLabels: [], aiChatEnabled: false }
}

export function useOwnerProfile() {
  return useQuery({
    queryKey: [PROFILE_OWNER],
    queryFn: fetchOwnerProfile,
    staleTime: Infinity,
  })
}

export function useOwnerSettings() {
  return useQuery({
    queryKey: [PROFILE_SETTINGS],
    queryFn: fetchOwnerSettings,
    staleTime: 300_000,
  })
}

export function useUpdateOwnerProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<OwnerProfile>) =>
      setDoc(doc(db, 'profile', 'owner'), data, { merge: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILE_OWNER] }),
  })
}

export function useUpdateLifeStats() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stats: LifeStat[]) =>
      updateDoc(doc(db, 'profile', 'owner'), { lifeStats: stats }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILE_OWNER] }),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<OwnerSettings>) =>
      setDoc(doc(db, 'profile', 'settings'), data, { merge: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILE_SETTINGS] }),
  })
}
