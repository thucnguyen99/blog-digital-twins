import { useState, useRef, type KeyboardEvent } from 'react'

interface Props {
  onSend: (content: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const autoResize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }

  return (
    <div className="flex items-end gap-2 border-t border-gray-100 px-3 py-3">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => { setValue(e.target.value); autoResize() }}
        onKeyDown={handleKey}
        placeholder="Nhắn gì đó..."
        disabled={isLoading}
        className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 min-h-[36px] max-h-24"
      />
      <button
        onClick={submit}
        disabled={!value.trim() || isLoading}
        aria-label="Gửi"
        className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
