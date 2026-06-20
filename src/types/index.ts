import type { Timestamp } from 'firebase/firestore'

export type EntryType =
  | 'article'
  | 'diary'
  | 'note'
  | 'timeline'
  | 'project'
  | 'gallery'

export type Visibility = 'public' | 'private' | 'future_release'

export type EmotionLabel =
  | 'work'
  | 'love'
  | 'family'
  | 'failure'
  | 'learning'
  | 'philosophy'
  | 'business'
  | string

export interface Entry {
  id: string
  type: EntryType
  title: string
  content: string
  excerpt: string
  emotionLabels: EmotionLabel[]
  tags: string[]
  peopleTags: string[]
  placeTags: string[]
  visibility: Visibility
  publishAt?: Timestamp
  aiInclude: boolean
  eventDate?: Timestamp
  coverImage?: string
  viewCount: number
  readingTimeMin: number
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
}

export type EntryFormData = Omit<Entry, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'readingTimeMin'>

export interface LifeStat {
  label: string
  value: string | number
  icon?: string
  order: number
}

export interface OwnerProfile {
  displayName: string
  tagline: string
  bio: string
  avatar: string
  socialLinks: {
    twitter?: string
    github?: string
    linkedin?: string
    [key: string]: string | undefined
  }
  lifeStats: LifeStat[]
}

export interface OwnerSettings {
  customEmotionLabels: string[]
  aiSystemPrompt?: string
  aiChatEnabled: boolean
}

export interface CorrectionEntry {
  id: string
  createdAt: Timestamp
  wrongClaim: string
  correction: string
}

export interface SnapshotPersona {
  layer0_hardRules: string
  layer1_identity: string
  layer2_beliefs: string
  layer3_communication: string
  layer4_emotionalPatterns: string
  layer5_correctionLog: CorrectionEntry[]
}

export interface SnapshotWorkSkill {
  primaryDomain: string
  subSkills: string[]
  approach: string
  knownFor: string
  growthAreas: string
}

export interface Snapshot {
  id: string
  createdAt: Timestamp
  label: string
  persona: SnapshotPersona
  workSkill?: SnapshotWorkSkill
  stats: {
    totalEntries: number
    aiIncludedEntries: number
    byType: Partial<Record<EntryType, number>>
    byEmotionLabel: Record<string, number>
  }
  dotSkillExport?: string
}
