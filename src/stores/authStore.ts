import { create } from 'zustand'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase/config'

interface AuthState {
  user: User | null
  isOwner: boolean
  setUser: (user: User | null) => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isOwner: false,

  setUser: (user) => {
    const ownerUid = (import.meta.env.VITE_OWNER_UID ?? '').replace(/^﻿/, '').trim()
    set({ user, isOwner: !!user && user.uid === ownerUid })
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  },

  signInWithEmail: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  },

  signOut: async () => {
    await firebaseSignOut(auth)
    set({ user: null, isOwner: false })
  },
}))
