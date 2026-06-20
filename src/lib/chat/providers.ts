export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export type ResponseProvider = (
  message: string,
  history?: ConversationTurn[]
) => Promise<string>

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export const placeholderProvider: ResponseProvider = async (_message, _history) => {
  await delay(800)
  return 'Tính năng chat đang được hoàn thiện. Bạn có thể đọc bài viết của mình tại blog trong khi chờ nhé!'
}

export const aiProvider: ResponseProvider = async (message, history = []) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })

  if (!res.ok) {
    if (import.meta.env.DEV) {
      await delay(800)
      return 'API route chưa chạy trong dev mode. Dùng `vercel dev` hoặc deploy lên Vercel để test AI.'
    }
    throw new Error(`Chat API error: ${res.status}`)
  }

  const data = (await res.json()) as { reply?: string }
  return data.reply ?? 'Mình không hiểu câu hỏi, bạn nói rõ hơn nhé?'
}
