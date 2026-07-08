import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthState {
  session: Session | null
  /** True until the initial getSession() call resolves, so routes don't flash the login screen. */
  initializing: boolean
  initialize: () => void
}

let unsubscribe: (() => void) | null = null

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initializing: true,

  initialize: () => {
    if (unsubscribe) return // already initialized

    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, initializing: false })
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, initializing: false })
    })
    unsubscribe = () => data.subscription.unsubscribe()
  },
}))
