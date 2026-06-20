import { useRef, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase/config'
import Button from '../ui/Button'

type MediaType = 'image' | 'audio'

interface Props {
  entryId: string
  onInsert: (markdown: string) => void
}

export default function MediaUploader({ entryId, onInsert }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const mediaType: MediaType = file.type.startsWith('audio') ? 'audio' : 'image'
    const storageRef = ref(storage, `entries/${entryId}/${file.name}`)
    const task = uploadBytesResumable(storageRef, file)

    setUploading(true)
    task.on(
      'state_changed',
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => setUploading(false),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        const markdown = mediaType === 'audio' ? `::audio[${url}]` : `![](${url})`
        onInsert(markdown)
        setUploading(false)
        setProgress(0)
        if (fileRef.current) fileRef.current.value = ''
      },
    )
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,audio/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? `Uploading ${progress}%` : 'Upload media'}
      </Button>
      <span className="text-xs text-gray-500">Image or audio — inserted as markdown</span>
    </div>
  )
}
