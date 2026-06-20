import { create } from 'zustand'
import type { EntryFormData } from '../types'

interface EditorState {
  draft: Partial<EntryFormData> | null
  isDirty: boolean
  lastSavedAt: Date | null
  setDraft: (draft: Partial<EntryFormData>) => void
  clearDraft: () => void
  markSaved: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  draft: null,
  isDirty: false,
  lastSavedAt: null,

  setDraft: (draft) => set({ draft, isDirty: true }),

  clearDraft: () => set({ draft: null, isDirty: false, lastSavedAt: null }),

  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),
}))
