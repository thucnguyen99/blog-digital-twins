import { useChatStore } from '../../stores/chatStore'
import { useOwnerProfile } from '../../lib/firebase/profile'
import { aiProvider } from '../../lib/chat/providers'
import ChatWindow from './ChatWindow'

export default function ChatWidget() {
  const { data: profile } = useOwnerProfile()
  const isOpen = useChatStore((s) => s.isOpen)
  const toggle = useChatStore((s) => s.toggle)
  const close = useChatStore((s) => s.close)

  const ownerName = profile?.displayName ?? 'Thức'
  const ownerAvatar = profile?.avatar || undefined
  const ownerInitial = ownerName.charAt(0).toUpperCase()

  return (
    <>
      {isOpen && (
        <ChatWindow
          onClose={close}
          ownerName={ownerName}
          ownerInitial={ownerInitial}
          ownerAvatar={ownerAvatar}
          responseProvider={aiProvider}
        />
      )}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Đóng chat' : `Chat với ${ownerName}`}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all overflow-hidden"
      >
        {ownerAvatar ? (
          <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-semibold text-xl">{ownerInitial}</span>
        )}
      </button>
    </>
  )
}
