export type UserRole = 'admin' | 'cem'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  personal_email: string | null
  phone: string | null
  created_at: string
}
