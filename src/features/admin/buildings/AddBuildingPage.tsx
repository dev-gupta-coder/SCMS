import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, toast } from '@/components/ui'
import { isDuplicateBuildingNameError, useCreateBuilding } from './api'

export function AddBuildingPage() {
  const navigate = useNavigate()
  const createBuilding = useCreateBuilding()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const handleSubmit = async () => {
    try {
      const buildingId = await createBuilding.mutateAsync({ name: name.trim(), address: address.trim() || null })
      toast.success('Building added.')
      navigate(`/admin/buildings/${buildingId}/manage`, { replace: true })
    } catch (err) {
      toast.error(
        isDuplicateBuildingNameError(err)
          ? 'A building with this name already exists.'
          : 'Could not add building. Try again.',
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">

        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Building</h1>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</span>
        <Input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Address (optional)</span>
        <Input type="text" value={address} onChange={(event) => setAddress(event.target.value)} />
      </label>

      <p className="text-sm text-gray-400 dark:text-gray-500">
        A warehouse is created automatically — you don't need to add one.
      </p>

      <Button fullWidth disabled={name.trim() === ''} loading={createBuilding.isPending} onClick={handleSubmit}>
        Add Building
      </Button>
    </div>
  )
}
