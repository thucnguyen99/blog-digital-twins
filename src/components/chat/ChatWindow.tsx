import { useEffect, useRef } from 'react'
import { useChatStore } from '../../stores/chatStore'
import type { ResponseProvider } from '../../lib/chat/providers'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'

interface Props {
  onClose: () => void
  ownerName: string
  ownerInitial: string
  ownerAvatar?: string
  responseProvider: ResponseProvider
}

export default function ChatWindow({
  onClose,
  ownerName,
  ownerInitial,
  ownerAvatar,
  responseProvider,
}: Props) {
  const messages = useChatStore((s) => s.messages)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const isLoading = messages.some((m) => m.status === 'loading')
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div className="
      fixed inset-0 z-40 flex flex-col bg-white
      sm:inset-auto sm:bottom-24 sm:right-6 sm:z-40
      sm:w-80 md:w-96
      sm:max-h-[calc(100vh-6rem)]
      sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200
    ">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {ownerAvatar ? (
            <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-gray-600">{ownerInitial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{ownerName}</p>
          <p className="text-xs text-gray-400">Digital Twin</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Đóng chat"
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-10">
            Hỏi {ownerName} bất cứ điều gì...
          </p>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            ownerInitial={ownerInitial}
            ownerAvatar={ownerAvatar}
          />
        ))}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={(content) => sendMessage(content, responseProvider)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
