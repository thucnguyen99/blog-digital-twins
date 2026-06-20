import { format } from 'date-fns'
import { useSnapshots } from '../../lib/firebase/snapshots'
import Button from '../../components/ui/Button'

export default function SnapshotsPage() {
  const { data: snapshots = [], isLoading } = useSnapshots()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">AI Snapshots</h1>
        <Button
          disabled
          title="AI aggregation implemented in Phase 2"
          variant="secondary"
        >
          Create snapshot
        </Button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Phase 2 feature.</strong> Snapshot aggregation and the AI chatbot will be implemented in Phase 2. Your entry data (with <code>aiInclude: true</code>) is already structured and ready.
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : snapshots.length === 0 ? (
        <p className="text-sm text-gray-500">No snapshots yet.</p>
      ) : (
        <ul className="space-y-3">
          {snapshots.map((s) => (
            <li key={s.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="font-medium text-gray-900">{s.label}</div>
              <div className="text-xs text-gray-400 mt-1">
                {s.createdAt ? format(s.createdAt.toDate(), 'MMM d, yyyy HH:mm') : ''}
                {' · '}
                {s.stats.aiIncludedEntries} entries · {s.persona.layer5_correctionLog.length} corrections
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
