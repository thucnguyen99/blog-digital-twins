import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { ReactNode } from 'react'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const isOwner = useAuthStore((s) => s.isOwner)
  if (!isOwner) return <Navigate to="/login" replace />
  return <>{children}</>
}
