import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from './useProfile'
import { LoadingScreen } from '@/components/LoadingScreen'

/** Landing hub for "/" — sends a signed-in user to their role's home, or to /login. */
export function RoleRedirect() {
  const session = useAuthStore((state) => state.session)
  const initializing = useAuthStore((state) => state.initializing)
  const { data: profile, isLoading: profileLoading } = useProfile()

  if (initializing) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  if (profileLoading || !profile) return <LoadingScreen />

  return <Navigate to={profile.role === 'admin' ? '/admin' : '/cem'} replace />
}
