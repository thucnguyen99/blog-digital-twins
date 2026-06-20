import { create } from 'zustand'
import type { ResponseProvider, ConversationTurn } from '../lib/chat/providers'

export interface ChatMessage {
  id: string
  sender: 'visitor' | 'owner'
  content: string
  timestamp: number
  status: 'sent' | 'loading' | 'delivered'
}

interface ChatStore {
  messages: ChatMessage[]
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  sendMessage: (content: string, provider: ResponseProvider) => Promise<void>
  clearSession: () => void
}

function uid() {
  return Math.random().toString(36).slice(2)
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isOpen: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  clearSession: () => set({ messages: [] }),

  sendMessage: async (content, provider) => {
    // Build history from delivered messages before this turn
    const history: ConversationTurn[] = get()
      .messages.filter((m) => m.status === 'delivered')
      .slice(-8)
      .map((m) => ({
        role: m.sender === 'visitor' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }))

    const visitorMsg: ChatMessage = {
      id: uid(),
      sender: 'visitor',
      content,
      timestamp: Date.now(),
      status: 'sent',
    }
    const loadingId = uid()
    const loadingMsg: ChatMessage = {
      id: loadingId,
      sender: 'owner',
      content: '',
      timestamp: Date.now(),
      status: 'loading',
    }
    set((s) => ({ messages: [...s.messages, visitorMsg, loadingMsg] }))

    try {
      const reply = await provider(content, history)
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === loadingId ? { ...m, content: reply, status: 'delivered' } : m
        ),
      }))
    } catch {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === loadingId
            ? { ...m, content: 'Có lỗi xảy ra. Vui lòng thử lại.', status: 'delivered' }
            : m
        ),
      }))
    }
  },
}))
