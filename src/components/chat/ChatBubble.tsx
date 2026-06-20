import type { ChatMessage } from '../../stores/chatStore'

interface Props {
  message: ChatMessage
  ownerInitial: string
  ownerAvatar?: string
}

export default function ChatBubble({ message, ownerInitial, ownerAvatar }: Props) {
  if (message.sender === 'visitor') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[78%] bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
        {ownerAvatar ? (
          <img src={ownerAvatar} alt="owner" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-gray-500">{ownerInitial}</span>
        )}
      </div>

      <div className="max-w-[78%] bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 text-sm leading-relaxed">
        {message.status === 'loading' ? (
          <span className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  )
}
