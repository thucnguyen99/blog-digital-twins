/**
 * Bootstrap: đẩy SKILL.md hiện tại lên Firestore users/{userId}/aiSkill
 * Chạy một lần sau khi thiết lập Firebase Admin SDK.
 *
 * Usage:
 *   cd blog && npm run bootstrap-skill
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Load .env.local
const envPath = new URL('../.env.local', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const SERVICE_ACCOUNT = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
const OWNER_UID = env.VITE_OWNER_UID

if (!OWNER_UID) {
  console.error('VITE_OWNER_UID not found in .env.local')
  process.exit(1)
}

// Read SKILL.md
const SKILL_PATHS = [
  join(homedir(), 'OneDrive', 'Documents', 'test', '~', '.claude', 'skills', 'dot-skill', 'skills', 'relationship', 'thuc', 'SKILL.md'),
  join(homedir(), '.claude', 'skills', 'relationship-thuc', 'SKILL.md'),
]

function readSkill() {
  for (const p of SKILL_PATHS) {
    try {
      const raw = readFileSync(p, 'utf-8')
      const stripped = raw.replace(/^---[\s\S]*?---\s*\n/, '').trim()
      if (stripped.length > 100) {
        console.log(`Đọc SKILL.md từ: ${p}`)
        return stripped
      }
    } catch {
      // try next
    }
  }
  throw new Error('Không tìm thấy SKILL.md')
}

const skillContent = readSkill()
console.log(`Skill: ${skillContent.length} ký tự`)

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({ credential: cert(SERVICE_ACCOUNT) })
}
const db = getFirestore()

const docRef = db.doc(`aiSkills/${OWNER_UID}`)
const existing = await docRef.get()
const currentVersion = existing.exists ? (existing.data().version ?? 0) : 0

await docRef.set({
  skillContent,
  version: currentVersion + 1,
  updatedAt: FieldValue.serverTimestamp(),
  source: 'bootstrap',
})

console.log(`✓ Đã đẩy skill lên Firestore: aiSkills/${OWNER_UID} (version ${currentVersion + 1})`)
console.log('Bước tiếp theo: vercel --prod --yes')
