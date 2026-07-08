import { createClient } from '@supabase/supabase-js'
import { rememberMeStorage } from './authStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // "Remember me" on the login screen decides whether the session survives
    // a browser restart (localStorage) or ends with the tab (sessionStorage).
    storage: rememberMeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
