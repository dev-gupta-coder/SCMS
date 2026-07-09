import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Input, toast } from '@/components/ui'
import { changePassword } from './authActions'

interface ChangePasswordFormValues {
  newPassword: string
  confirmPassword: string
}

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>()

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setSubmitting(true)
    try {
      await changePassword(values.newPassword)
      toast.success('Password updated.')
      navigate(-1)
    } catch {
      toast.error('Could not update password. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Change Password</h1>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">New password</span>
          <Input
            type="password"
            autoComplete="new-password"
            {...register('newPassword', { required: true, minLength: 6 })}
          />
          {errors.newPassword && (
            <span className="text-sm text-red-600 dark:text-red-400">At least 6 characters.</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirm new password</span>
          <Input
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: true,
              validate: (value) => value === watch('newPassword') || 'Passwords do not match.',
            })}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</span>
          )}
        </label>

        <Button type="submit" fullWidth loading={submitting}>
          Update Password
        </Button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}
