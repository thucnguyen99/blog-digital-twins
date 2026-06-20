import { useCallback, useEffect, useRef } from 'react'
import MDEditor from '@uiw/react-md-editor'

interface Props {
  value: string
  onChange: (val: string) => void
  onDebouncedChange?: (val: string) => void
  debounceMs?: number
}

export default function MarkdownEditor({ value, onChange, onDebouncedChange, debounceMs = 5000 }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (val: string | undefined) => {
      const v = val ?? ''
      onChange(v)
      if (onDebouncedChange) {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => onDebouncedChange(v), debounceMs)
      }
    },
    [onChange, onDebouncedChange, debounceMs],
  )

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div data-color-mode="light">
      <MDEditor value={value} onChange={handleChange} height={400} preview="edit" />
    </div>
  )
}
