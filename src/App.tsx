import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/features/auth/LoginPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
import { AuthedHome } from '@/features/auth/AuthedHome'
import { RequireRole } from '@/features/auth/RequireRole'
import { RoleRedirect } from '@/features/auth/RoleRedirect'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AuthedHome />
            </RequireRole>
          }
        />
        <Route
          path="/cem"
          element={
            <RequireRole role="cem">
              <AuthedHome />
            </RequireRole>
          }
        />
        <Route
          path="/change-password"
          element={
            <RequireRole>
              <ChangePasswordPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
