import { supabase } from '@/lib/supabaseClient'
import { setRememberMe } from '@/lib/authStorage'

export async function signIn(email: string, password: string, rememberMe: boolean) {
  setRememberMe(rememberMe)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
