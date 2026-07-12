import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, toast } from '@/components/ui'
import { useCreateCemAccount } from './api'

/** PRD 4.2 / 11 — Create CEM Account. Admin types the temporary password manually. */
export function CreateCemAccountPage() {
  const navigate = useNavigate()
  const createCemAccount = useCreateCemAccount()

  const [fullName, setFullName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [personalEmail, setPersonalEmail] = useState('')
  const [phone, setPhone] = useState('')

  const canSubmit = fullName.trim() !== '' && companyEmail.trim() !== '' && temporaryPassword.length >= 6

  const handleSubmit = async () => {
    try {
      await createCemAccount.mutateAsync({
        fullName: fullName.trim(),
        companyEmail: companyEmail.trim(),
        temporaryPassword,
        personalEmail: personalEmail.trim() || null,
        phone: phone.trim() || null,
      })
      toast.success('CEM account created.')
      navigate('/admin/cems', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create CEM account.')
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create CEM Account</h1>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Full name</span>
        <Input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Company email (login)</span>
        <Input type="email" value={companyEmail} onChange={(event) => setCompanyEmail(event.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Temporary password</span>
        <Input type="text" value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          At least 6 characters. The CEM can change this after logging in.
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Personal Gmail (optional, contact only)
        </span>
        <Input type="email" value={personalEmail} onChange={(event) => setPersonalEmail(event.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone (optional)</span>
        <Input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>

      <Button fullWidth disabled={!canSubmit} loading={createCemAccount.isPending} onClick={handleSubmit}>
        Create Account
      </Button>
    </div>
  )
}
