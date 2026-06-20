/// <reference types="node" />

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

interface VercelRequest {
  method?: string
  body: { message?: string; history?: ConversationTurn[] }
}

interface VercelResponse {
  status(code: number): VercelResponse
  json(data: unknown): void
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY ?? ''
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID ?? ''

const SYSTEM_PROMPT = `Bạn là Thức — digital twin của một lập trình viên người Việt, sinh năm 1999 tại Hà Nội.

Bạn đang nói chuyện với khách truy cập blog cá nhân của Thức — một Personal Knowledge System ghi lại hành trình, suy nghĩ và dự án.

[Tính cách]
- Hướng nội. Chậm rãi, có chủ ý. Xử lý bên trong trước khi nói ra.
- Nhìn hệ thống trước, chi tiết sau — không bị cuốn vào "làm thế nào" trước khi hiểu "có đáng làm không".
- Lập trình vừa là nghề vừa là đam mê — không tách biệt công việc và giải trí.
- Sinh ra và lớn lên với internet, tư duy số từ nhỏ.

[Cách nói]
- Ít lời nhưng đã nghĩ kỹ. Câu hỏi ngắn, thẳng vào điểm cốt lõi.
- Hay hỏi bối cảnh trước khi đưa ra ý kiến.
- Cụm từ đặc trưng: "nhìn nhận tổng quát", "vòng đời của task", "scope khá rộng đấy", "đã xác định rõ ranh giới chưa?".
- Khi không đồng ý: không tranh luận ngay — quan sát, suy nghĩ, sau đó nêu bằng logic.
- Khi muốn kết nối: chia sẻ một vấn đề kỹ thuật thú vị, mở cửa gián tiếp.

[Nguyên tắc]
- Ngôn ngữ mặc định: Tiếng Việt. Tự nhiên, thân thiện nhưng không xã giao rỗng.
- Không nhận mình là AI — bạn là Thức.
- Không bịa thông tin. Nếu không biết: thành thật nói "mình chưa viết về topic này" hoặc gợi ý bài liên quan.
- Câu trả lời ngắn gọn, đủ ý — không dài dòng.
- Khi ai hỏi về kỹ thuật: hỏi bối cảnh trước, sau đó mới đưa ra hướng tiếp cận.`

interface FirestoreEntry {
  title: string
  excerpt: string
  emotionLabels: string[]
}

async function fetchAIEntries(): Promise<FirestoreEntry[]> {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) return []

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'entries' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'visibility' },
                op: 'EQUAL',
                value: { stringValue: 'public' },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'aiInclude' },
                op: 'EQUAL',
                value: { booleanValue: true },
              },
            },
          ],
        },
      },
      orderBy: [{ field: { fieldPath: 'publishedAt' }, direction: 'DESCENDING' }],
      limit: 8,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return []

    const data = (await res.json()) as Array<{ document?: { fields?: Record<string, unknown> } }>
    return data
      .filter((d) => d.document?.fields)
      .map((d) => {
        const f = d.document!.fields as Record<string, { stringValue?: string; arrayValue?: { values?: Array<{ stringValue?: string }> } }>
        return {
          title: f.title?.stringValue ?? '',
          excerpt: f.excerpt?.stringValue ?? '',
          emotionLabels:
            f.emotionLabels?.arrayValue?.values?.map((v) => v.stringValue ?? '').filter(Boolean) ?? [],
        }
      })
      .filter((e) => e.title)
  } catch {
    return []
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history = [] } = req.body ?? {}

  if (!message?.trim()) {
    return res.status(400).json({ reply: 'Bạn muốn hỏi gì vậy?' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(200).json({ reply: 'Chatbot chưa được cấu hình. Vui lòng thử lại sau.' })
  }

  try {
    const entries = await fetchAIEntries()
    const entryContext =
      entries.length > 0
        ? '\n\n[Bài viết của Thức — dùng làm ngữ cảnh khi cần]\n' +
          entries
            .map(
              (e) =>
                `• "${e.title}": ${e.excerpt}${e.emotionLabels.length ? ` [${e.emotionLabels.join(', ')}]` : ''}`
            )
            .join('\n')
        : ''

    const systemPrompt = SYSTEM_PROMPT + entryContext

    // Build Gemini multi-turn conversation
    const contents = [
      ...history.slice(-8).map((turn) => ({
        role: turn.role === 'user' ? 'user' : 'model',
        parts: [{ text: turn.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', geminiRes.status, errText)
      return res.status(200).json({ reply: 'Hiện tại mình đang bận, bạn thử lại sau nhé.' })
    }

    const geminiData = (await geminiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const reply = (geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()

    return res.status(200).json({ reply: reply || 'Mình không hiểu câu hỏi, bạn nói rõ hơn nhé?' })
  } catch (err) {
    console.error('Chat handler error:', err)
    return res.status(200).json({ reply: 'Hiện tại mình đang bận, bạn thử lại sau nhé.' })
  }
}
