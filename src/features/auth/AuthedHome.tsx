import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useProfile } from './useProfile'
import { signOut } from './authActions'

/**
 * Temporary post-login landing page. Replaced by the real CEM check-in flow
 * (build order step 3) and Admin dashboard (build order step 9) — this just
 * proves auth + role redirect works end to end.
 */
export function AuthedHome() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <img src="/logo.png" alt="Canvas Workspace" className="h-10" />
      <p className="text-lg font-semibold text-gray-900">Welcome, {profile?.full_name}</p>
      <p className="max-w-xs text-sm text-gray-500">
        Signed in as {profile?.role === 'admin' ? 'Admin' : 'CEM'}. The{' '}
        {profile?.role === 'admin' ? 'Admin dashboard' : 'daily check-in'} lands here in a later build step.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        {profile?.role === 'cem' && (
          <Button variant="secondary" onClick={() => navigate('/change-password')}>
            Change Password
          </Button>
        )}
        <Button variant="secondary" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  )
}
