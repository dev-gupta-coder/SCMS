import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, toast } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { signIn } from './authActions'

interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.session)
  const initializing = useAuthStore((state) => state.initializing)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { rememberMe: true } })

  if (!initializing && session) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    try {
      await signIn(values.email, values.password, values.rememberMe)
      navigate('/', { replace: true })
    } catch {
      toast.error('Incorrect email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Canvas Workspace" className="mx-auto mb-8 h-10" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">Email</span>
            <input
              type="email"
              autoComplete="username"
              className="min-h-12 rounded-xl border border-gray-300 px-3 text-base focus:border-canvas-500 focus:outline-none"
              {...register('email', { required: true })}
            />
            {errors.email && <span className="text-sm text-red-600">Email is required.</span>}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className="min-h-12 rounded-xl border border-gray-300 px-3 text-base focus:border-canvas-500 focus:outline-none"
              {...register('password', { required: true })}
            />
            {errors.password && <span className="text-sm text-red-600">Password is required.</span>}
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-canvas-500 focus:ring-canvas-500"
              {...register('rememberMe')}
            />
            Remember me
          </label>

          <Button type="submit" fullWidth loading={submitting}>
            Sign In
          </Button>

          <button
            type="button"
            onClick={() => navigate('/change-password')}
            className="text-sm font-medium text-canvas-600 hover:text-canvas-700"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
