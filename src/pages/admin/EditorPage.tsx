import { useState, useEffect, useId } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { useEntry, useCreateEntry, useUpdateEntry } from '../../lib/firebase/entries'
import { useEditorStore } from '../../stores/editorStore'
import MarkdownEditor from '../../components/admin/MarkdownEditor'
import VisibilityPicker from '../../components/admin/VisibilityPicker'
import AIToggle from '../../components/admin/AIToggle'
import EmotionLabelSelector from '../../components/admin/EmotionLabelSelector'
import MediaUploader from '../../components/admin/MediaUploader'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { EntryType, Visibility } from '../../types'

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'diary', label: 'Diary' },
  { value: 'note', label: 'Note' },
  { value: 'timeline', label: 'Timeline event' },
  { value: 'project', label: 'Project' },
  { value: 'gallery', label: 'Gallery' },
]

const PRIVATE_TYPES: EntryType[] = ['diary', 'note']

export default function EditorPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const tempId = useId()

  const { data: existing } = useEntry(id ?? '')
  const { mutateAsync: createEntry } = useCreateEntry()
  const { mutateAsync: updateEntry } = useUpdateEntry()
  const { setDraft, markSaved, isDirty } = useEditorStore()

  const [type, setType] = useState<EntryType>('article')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emotionLabels, setEmotionLabels] = useState<string[]>([])
  const [tags, setTags] = useState('')
  const [peopleTags, setPeopleTags] = useState('')
  const [placeTags, setPlaceTags] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('private')
  const [publishAt, setPublishAt] = useState('')
  const [aiInclude, setAiInclude] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'idle'>('idle')

  useEffect(() => {
    if (!existing) return
    setType(existing.type)
    setTitle(existing.title)
    setContent(existing.content)
    setEmotionLabels(existing.emotionLabels)
    setTags(existing.tags.join(', '))
    setPeopleTags(existing.peopleTags.join(', '))
    setPlaceTags(existing.placeTags.join(', '))
    setVisibility(existing.visibility)
    setAiInclude(existing.aiInclude)
    if (existing.publishAt) {
      const d = existing.publishAt.toDate()
      setPublishAt(d.toISOString().slice(0, 16))
    }
    if (existing.eventDate) {
      const d = existing.eventDate.toDate()
      setEventDate(d.toISOString().slice(0, 16))
    }
  }, [existing])

  const isPrivateType = PRIVATE_TYPES.includes(type)
  const effectiveVisibility = isPrivateType ? 'private' : visibility
  const effectiveAiInclude = type === 'timeline' ? true : aiInclude

  const handleDebouncedSave = (val: string) => {
    setDraft({ title, content: val, type, visibility: effectiveVisibility })
    setSaveStatus('unsaved')
    markSaved()
    setSaveStatus('saved')
  }

  const buildPayload = () => ({
    type,
    title,
    content,
    excerpt: content.replace(/[#*`_[\]()!]/g, '').trim().slice(0, 500),
    emotionLabels,
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    peopleTags: peopleTags.split(',').map((t) => t.trim()).filter(Boolean),
    placeTags: placeTags.split(',').map((t) => t.trim()).filter(Boolean),
    visibility: effectiveVisibility,
    aiInclude: effectiveAiInclude,
    ...(effectiveVisibility === 'future_release' && publishAt
      ? { publishAt: Timestamp.fromDate(new Date(publishAt)) }
      : {}),
    ...(type === 'timeline' && eventDate
      ? { eventDate: Timestamp.fromDate(new Date(eventDate)) }
      : {}),
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (id) {
        await updateEntry({ id, data: buildPayload() })
      } else {
        const ref = await createEntry(buildPayload() as any)
        navigate(`/admin/editor/${ref.id}`, { replace: true })
      }
      markSaved()
      setSaveStatus('saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{id ? 'Edit entry' : 'New entry'}</h1>
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && <span className="text-xs text-green-600">Saved</span>}
          {isDirty && saveStatus !== 'saved' && <span className="text-xs text-orange-500">Unsaved changes</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EntryType)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ENTRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" />
          </div>

          {/* Event date for timeline */}
          {type === 'timeline' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event date</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              onDebouncedChange={handleDebouncedSave}
            />
          </div>

          {/* Media */}
          <MediaUploader entryId={id ?? tempId} onInsert={(md) => setContent((c) => c + '\n' + md)} />
        </div>

        <div className="space-y-6">
          <VisibilityPicker
            value={effectiveVisibility}
            publishAt={publishAt}
            onChange={setVisibility}
            onPublishAtChange={setPublishAt}
            disabled={isPrivateType}
            disabledReason={isPrivateType ? 'Diary and notes are always private' : undefined}
          />
          <EmotionLabelSelector selected={emotionLabels} onChange={setEmotionLabels} />
          <AIToggle checked={effectiveAiInclude} onChange={setAiInclude} entryType={type} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">People</label>
            <Input value={peopleTags} onChange={(e) => setPeopleTags(e.target.value)} placeholder="Name1, Name2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Places</label>
            <Input value={placeTags} onChange={(e) => setPlaceTags(e.target.value)} placeholder="City, Country" />
          </div>
        </div>
      </div>
    </div>
  )
}
