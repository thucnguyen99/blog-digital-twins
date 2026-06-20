import Toggle from '../ui/Toggle'
import type { EntryType } from '../../types'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  entryType: EntryType
}

export default function AIToggle({ checked, onChange, entryType }: Props) {
  const isTimeline = entryType === 'timeline'

  return (
    <Toggle
      checked={isTimeline ? true : checked}
      onChange={onChange}
      disabled={isTimeline}
      label="Include in AI training"
      description={
        isTimeline
          ? 'Timeline events are always included — they give the AI temporal context'
          : 'OFF by default. Enable to include this entry in your AI persona dataset.'
      }
    />
  )
}
