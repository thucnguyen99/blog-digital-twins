import { useOwnerSettings } from '../../lib/firebase/profile'

const FIXED_LABELS = ['work', 'love', 'family', 'failure', 'learning', 'philosophy', 'business']

interface Props {
  selected: string[]
  onChange: (labels: string[]) => void
  max?: number
}

export default function EmotionLabelSelector({ selected, onChange, max = 5 }: Props) {
  const { data: settings } = useOwnerSettings()
  const allLabels = [...FIXED_LABELS, ...(settings?.customEmotionLabels ?? [])]

  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((l) => l !== label))
    } else if (selected.length < max) {
      onChange([...selected, label])
    }
  }

  return (
    <div>
      <div className="mb-1 text-sm font-medium text-gray-700">Emotion labels <span className="text-gray-400 font-normal">(max {max})</span></div>
      <div className="flex flex-wrap gap-2">
        {allLabels.map((label) => {
          const active = selected.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!active && selected.length >= max ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
