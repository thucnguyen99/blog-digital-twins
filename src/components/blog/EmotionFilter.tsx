const LABELS = ['work', 'love', 'family', 'failure', 'learning', 'philosophy', 'business']

interface Props {
  selected: string | null
  onChange: (label: string | null) => void
}

export default function EmotionFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {LABELS.map((label) => (
        <button
          key={label}
          onClick={() => onChange(selected === label ? null : label)}
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
            selected === label ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
