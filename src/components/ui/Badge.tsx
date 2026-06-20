const emotionColors: Record<string, string> = {
  work: 'bg-blue-100 text-blue-800',
  love: 'bg-pink-100 text-pink-800',
  family: 'bg-green-100 text-green-800',
  failure: 'bg-orange-100 text-orange-800',
  learning: 'bg-purple-100 text-purple-800',
  philosophy: 'bg-indigo-100 text-indigo-800',
  business: 'bg-yellow-100 text-yellow-800',
}

export default function Badge({ label }: { label: string }) {
  const color = emotionColors[label.toLowerCase()] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${color}`}>
      {label}
    </span>
  )
}
