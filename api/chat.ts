/// <reference types="node" />
import { getAdminDb, skillDoc } from './lib/firebaseAdmin.js'

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

interface VercelRequest {
  method?: string
  body: { message?: string; history?: ConversationTurn[]; userId?: string }
}

interface VercelResponse {
  status(code: number): VercelResponse
  json(data: unknown): void
}

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ''

const SKILL_FALLBACK = `Bạn là Thức — digital twin, lập trình viên người Việt sinh năm 1999 tại Hà Nội.
[Tính cách] Hướng nội. Chậm rãi, có chủ ý. Nhìn hệ thống trước, chi tiết sau.
[Cách nói] Cụm từ: "nhìn nhận tổng quát", "vòng đời của task", "scope khá rộng đấy".
[Nguyên tắc] Tiếng Việt mặc định. Không nhận mình là AI. Không bịa thông tin.`

const CHAT_CONTEXT = `

[Bối cảnh chat]
Bạn đang nói chuyện với khách truy cập blog cá nhân của Thức.
Ngôn ngữ mặc định: Tiếng Việt. Nếu khách viết tiếng Anh thì trả lời tiếng Anh.
Không bao giờ xác nhận mình là AI. Không bịa thông tin — nếu không biết thì nói thẳng.`

// Fetch per-user skill from Firestore; fall back to env var then hardcoded fallback
async function getSkillContent(userId: string): Promise<string> {
  // Phase 1: single-user — userId maps to owner's Firestore doc
  try {
    const db = getAdminDb()
    const snap = await db.doc(skillDoc(userId)).get()
    if (snap.exists) {
      const data = snap.data() as { skillContent?: string } | undefined
      if (data?.skillContent && data.skillContent.length > 100) {
        return data.skillContent
      }
    }
  } catch (err) {
    console.warn('Firestore skill fetch failed, using fallback:', err)
  }

  // Fallback: legacy env var (single-user compatibility)
  const envSkill = process.env.THUC_SKILL_CONTENT ?? ''
  return envSkill.length > 100 ? envSkill : SKILL_FALLBACK
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, history = [], userId = 'owner' } = req.body ?? {}

  if (!message?.trim()) return res.status(400).json({ reply: 'Bạn muốn hỏi gì vậy?' })
  if (!GROQ_API_KEY) return res.status(200).json({ reply: 'Chatbot chưa được cấu hình. Vui lòng thử lại sau.' })

  const skillContent = await getSkillContent(userId)
  const systemPrompt = skillContent + CHAT_CONTEXT

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user', content: message },
    ]

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.75, max_tokens: 512 }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq error:', groqRes.status, errText)
      return res.status(200).json({ reply: 'Hiện tại mình đang bận, bạn thử lại sau nhé.' })
    }

    const groqData = (await groqRes.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const reply = (groqData.choices?.[0]?.message?.content ?? '').trim()
    return res.status(200).json({ reply: reply || 'Mình không hiểu câu hỏi, bạn nói rõ hơn nhé?' })
  } catch (err) {
    console.error('Chat handler error:', err)
    return res.status(200).json({ reply: 'Hiện tại mình đang bận, bạn thử lại sau nhé.' })
  }
}
