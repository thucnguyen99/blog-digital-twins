/**
 * Sync relationship-thuc SKILL.md → Vercel env var THUC_SKILL_CONTENT
 *
 * Run after colleague-skill evolution:
 *   cd blog && npm run sync-skill
 *   vercel --prod --yes
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { spawnSync } from 'child_process'

const SKILL_PATHS = [
  // colleague-skill repo (source of truth after evolution)
  join(homedir(), 'OneDrive', 'Documents', 'test', '~', '.claude', 'skills', 'dot-skill', 'skills', 'relationship', 'thuc', 'SKILL.md'),
  // installed location
  join(homedir(), '.claude', 'skills', 'relationship-thuc', 'SKILL.md'),
]

function readSkill() {
  for (const p of SKILL_PATHS) {
    try {
      const raw = readFileSync(p, 'utf-8')
      // Strip YAML frontmatter (--- ... ---)
      const stripped = raw.replace(/^---[\s\S]*?---\s*\n/, '').trim()
      if (stripped.length > 100) {
        console.log(`Read from: ${p}`)
        return stripped
      }
    } catch {
      // try next path
    }
  }
  throw new Error(
    'Không tìm thấy SKILL.md. Đảm bảo colleague-skill đã chạy và tạo relationship-thuc.'
  )
}

const content = readSkill()
console.log(`Skill content: ${content.length} chars`)

// Remove old value first
const rm = spawnSync(
  'vercel',
  ['env', 'rm', 'THUC_SKILL_CONTENT', 'production', '--yes'],
  { stdio: 'inherit', encoding: 'utf-8' }
)
if (rm.status !== 0 && rm.status !== null) {
  // env var might not exist yet, that's fine
  console.log('(env var chưa tồn tại, bỏ qua bước xóa)')
}

// Add new value — pipe content via stdin to avoid shell escaping
const add = spawnSync('vercel', ['env', 'add', 'THUC_SKILL_CONTENT', 'production'], {
  input: content,
  encoding: 'utf-8',
  stdio: ['pipe', 'inherit', 'inherit'],
})

if (add.status !== 0) {
  console.error('Lỗi khi update env var. Thử lại hoặc update thủ công qua Vercel dashboard.')
  process.exit(1)
}

console.log('\n✓ THUC_SKILL_CONTENT đã được cập nhật trên Vercel')
console.log('Bước tiếp theo: vercel --prod --yes')
