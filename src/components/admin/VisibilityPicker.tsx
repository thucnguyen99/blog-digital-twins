import type { Visibility } from '../../types'

const OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Anyone can read this entry' },
  { value: 'private', label: 'Private', description: 'Only you can see this' },
  { value: 'future_release', label: 'Scheduled', description: 'Becomes public on a set date' },
]

interface Props {
  value: Visibility
  publishAt?: string
  onChange: (v: Visibility) => void
  onPublishAtChange?: (v: string) => void
  disabled?: boolean
  disabledReason?: string
}

export default function VisibilityPicker({ value, publishAt, onChange, onPublishAtChange, disabled, disabledReason }: Props) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-gray-700">Visibility</div>
      {disabled && disabledReason && (
        <p className="mb-2 text-xs text-orange-600">{disabledReason}</p>
      )}
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${value === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <input
              type="radio"
              name="visibility"
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
              onChange={() => !disabled && onChange(opt.value)}
              className="mt-0.5"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.description}</div>
            </div>
          </label>
        ))}
      </div>
      {value === 'future_release' && !disabled && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Publish date &amp; time</label>
          <input
            type="datetime-local"
            value={publishAt ?? ''}
            onChange={(e) => onPublishAtChange?.(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  )
}
