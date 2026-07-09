
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from './useProfile'
import { LoadingScreen } from '@/components/LoadingScreen'
import type { UserRole } from './types'

interface RequireRoleProps {
  /** Omit to allow any authenticated role (e.g. the Change Password screen). */
  role?: UserRole
  children: ReactNode
}

/** Route guard: redirects to /login if signed out, or to the correct role home if the role doesn't match. */
export function RequireRole({ role, children }: RequireRoleProps) {
  const session = useAuthStore((state) => state.session)
  const initializing = useAuthStore((state) => state.initializing)
  const { data: profile, isLoading: profileLoading } = useProfile()

  if (initializing) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  if (profileLoading || !profile) return <LoadingScreen />

  if (role && profile.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/cem'} replace />
  }

  return <>{children}</>
}
