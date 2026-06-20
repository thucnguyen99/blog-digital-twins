interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
        />
        <div
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
    </label>
  )
}
