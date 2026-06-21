/// <reference types="node" />
import { getAdminDb, skillDoc, skillVersionsCol, entryDoc } from './lib/firebaseAdmin.js'
import { FieldValue } from 'firebase-admin/firestore'

interface VercelRequest {
  method?: string
  body: {
    userId?: string
    entryId?: string
    idToken?: string
  }
}

interface VercelResponse {
  status(code: number): VercelResponse
  json(data: unknown): void
}

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ''

// Merger prompt: extract new insights from blog post and integrate into existing skill
function buildMergerPrompt(existingSkill: string, postTitle: string, postContent: string): string {
  return `Bạn là hệ thống cập nhật digital twin skill.

NHIỆM VỤ: Tích hợp thông tin mới từ bài blog vào skill profile hiện tại.

---SKILL HIỆN TẠI---
${existingSkill}

---BÀI BLOG MỚI---
Tiêu đề: ${postTitle}
Nội dung:
${postContent}

---HƯỚNG DẪN---
1. Phân tích bài blog để tìm:
   - Kiến thức kỹ thuật, phương pháp, công cụ mới → cập nhật phần Work (PART A)
   - Góc nhìn, giá trị, phong cách giao tiếp, cách tư duy mới → cập nhật phần Persona (PART B)
   - Cụm từ, cách diễn đạt đặc trưng → thêm vào phần ngôn ngữ/biểu đạt

2. Quy tắc merge:
   - Giữ nguyên toàn bộ nội dung cũ trừ khi bài blog mâu thuẫn rõ ràng
   - Thêm insight mới dưới dạng bullet points ngắn gọn, có dẫn chứng từ bài blog
   - Một bài blog chỉ thêm tối đa 3-5 insight mới (chất lượng hơn số lượng)
   - Không bịa thông tin không có trong bài blog

3. Trả về TOÀN BỘ skill profile đã cập nhật, giữ nguyên cấu trúc và format.

OUTPUT: Chỉ trả về nội dung skill đã cập nhật, không có comment hay giải thích thêm.`
}

async function verifyOwner(db: FirebaseFirestore.Firestore, idToken: string, userId: string): Promise<boolean> {
  try {
    const { getAuth } = await import('firebase-admin/auth')
    const decoded = await getAuth().verifyIdToken(idToken)
    return decoded.uid === userId
  } catch {
    return false
  }
}

async function archiveVersion(db: FirebaseFirestore.Firestore, userId: string, skillContent: string, version: number) {
  const versionsRef = db.collection(skillVersionsCol(userId))
  // Keep max 10 versions
  const old = await versionsRef.orderBy('version').limit(1).get()
  const total = (await versionsRef.count().get()).data().count
  if (total >= 10 && !old.empty) {
    await old.docs[0].ref.delete()
  }
  await versionsRef.add({ skillContent, version, archivedAt: FieldValue.serverTimestamp() })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, entryId, idToken } = req.body ?? {}

  if (!userId || !entryId) return res.status(400).json({ error: 'userId and entryId required' })
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not configured' })

  const db = getAdminDb()

  // Verify ownership
  if (idToken) {
    const isOwner = await verifyOwner(db, idToken, userId)
    if (!isOwner) return res.status(403).json({ error: 'Unauthorized' })
  } else {
    return res.status(403).json({ error: 'idToken required' })
  }

  // Fetch blog post
  const entrySnap = await db.doc(entryDoc(entryId)).get()
  if (!entrySnap.exists) return res.status(404).json({ error: 'Entry not found' })

  const entry = entrySnap.data() as { title?: string; content?: string; aiInclude?: boolean }
  if (!entry.aiInclude) return res.status(400).json({ error: 'Entry not marked for AI inclusion' })

  const postTitle = entry.title ?? 'Untitled'
  const postContent = (entry.content ?? '').slice(0, 8000) // cap to avoid token overflow

  // Fetch current skill (or bootstrap from env var)
  const skillSnap = await db.doc(skillDoc(userId)).get()
  const skillData = skillSnap.exists ? (skillSnap.data() as { skillContent?: string; version?: number }) : null
  const currentSkill =
    skillData?.skillContent && skillData.skillContent.length > 100
      ? skillData.skillContent
      : (process.env.THUC_SKILL_CONTENT ?? '')
  const currentVersion = skillData?.version ?? 0

  if (!currentSkill) {
    return res.status(400).json({ error: 'No existing skill found. Run sync-skill first or generate an initial skill.' })
  }

  // Call Groq to run merger
  const prompt = buildMergerPrompt(currentSkill, postTitle, postContent)

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!groqRes.ok) {
    const errText = await groqRes.text()
    console.error('Groq merger error:', groqRes.status, errText)
    return res.status(500).json({ error: 'LLM call failed' })
  }

  const groqData = (await groqRes.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const updatedSkill = (groqData.choices?.[0]?.message?.content ?? '').trim()

  if (!updatedSkill || updatedSkill.length < 100) {
    return res.status(500).json({ error: 'LLM returned empty or invalid skill' })
  }

  // Archive current version, write new skill
  if (currentSkill) await archiveVersion(db, userId, currentSkill, currentVersion)

  await db.doc(skillDoc(userId)).set({
    skillContent: updatedSkill,
    version: currentVersion + 1,
    lastEntryId: entryId,
    lastEntryTitle: postTitle,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return res.status(200).json({ ok: true, version: currentVersion + 1, chars: updatedSkill.length })
}
