import { useState } from 'react'
import Button from '../ui/Button'

interface Props {
  onInsert: (markdown: string) => void
}

type MediaType = 'image' | 'audio'

export default function MediaUploader({ onInsert }: Props) {
  const [url, setUrl] = useState('')
  const [mediaType, setMediaType] = useState<MediaType>('image')

  const handleInsert = () => {
    if (!url.trim()) return
    const markdown = mediaType === 'audio' ? `::audio[${url.trim()}]` : `![](${url.trim()})`
    onInsert(markdown)
    setUrl('')
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={mediaType}
        onChange={(e) => setMediaType(e.target.value as MediaType)}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="image">Image</option>
        <option value="audio">Audio</option>
      </select>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
        placeholder="Paste URL (Imgur, Cloudinary…)"
        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <Button type="button" variant="secondary" onClick={handleInsert} disabled={!url.trim()}>
        Insert
      </Button>
    </div>
  )
}
