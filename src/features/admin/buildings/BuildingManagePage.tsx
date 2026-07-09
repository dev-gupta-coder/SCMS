import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Modal, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useFloors } from '@/features/cem/api'
import { useAllBuildingsFull, useCreateFloor, useUpdateBuilding, useUpdateFloor } from './api'

/** PRD 11, Admin screen 5 — building fields + floor CRUD (warehouse excluded from manual creation/rename). */
export function BuildingManagePage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()

  const { data: buildings, isLoading: buildingsLoading } = useAllBuildingsFull()
  const building = buildings?.find((b) => b.id === buildingId)
  const { data: floors, isLoading: floorsLoading } = useFloors(buildingId)

  const updateBuilding = useUpdateBuilding()
  const createFloor = useCreateFloor()
  const updateFloor = useUpdateFloor()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (building) {
      setName(building.name)
      setAddress(building.address ?? '')
      setIsActive(building.is_active)
    }
  }, [building])

  const [addFloorOpen, setAddFloorOpen] = useState(false)
  const [newFloorName, setNewFloorName] = useState('')
  const [renameFloor, setRenameFloor] = useState<{ id: string; name: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')

  if (buildingsLoading || floorsLoading) return <LoadingScreen />
  if (!buildingId || !building) return null

  const handleSaveBuilding = async () => {
    try {
      await updateBuilding.mutateAsync({ buildingId, name: name.trim(), address: address.trim() || null, isActive })
      toast.success('Building updated.')
    } catch {
      toast.error('Could not update building. Try again.')
    }
  }

  const handleAddFloor = async () => {
    try {
      await createFloor.mutateAsync({ buildingId, name: newFloorName.trim() })
      toast.success('Floor added.')
      setAddFloorOpen(false)
      setNewFloorName('')
    } catch {
      toast.error('Could not add floor. Try again.')
    }
  }

  const handleRenameFloor = async () => {
    if (!renameFloor) return
    try {
      await updateFloor.mutateAsync({ floorId: renameFloor.id, buildingId, name: renameValue.trim() })
      toast.success('Floor renamed.')
      setRenameFloor(null)
    } catch {
      toast.error('Could not rename floor. Try again.')
    }
  }

  const warehouse = (floors ?? []).find((floor) => floor.floor_type === 'warehouse')
  const otherFloors = (floors ?? []).filter((floor) => floor.floor_type !== 'warehouse')

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/buildings')}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{building.name}</h1>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Building Details</h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</span>
          <Input type="text" value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Address (optional)</span>
          <Input type="text" value={address} onChange={(event) => setAddress(event.target.value)} />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-canvas-500 focus:ring-canvas-500 dark:border-gray-600 dark:bg-gray-800"
          />
          Active
        </label>

        <Button fullWidth loading={updateBuilding.isPending} disabled={name.trim() === ''} onClick={handleSaveBuilding}>
          Save Building
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Floors</h2>
          <Button size="md" onClick={() => setAddFloorOpen(true)}>
            + Add Floor
          </Button>
        </div>

        {warehouse && (
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-gray-800">
            <span className="font-medium text-gray-900 dark:text-gray-100">Warehouse</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">System-managed</span>
          </div>
        )}

        {otherFloors.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No additional floors yet.</p>
        ) : (
          otherFloors.map((floor) => (
            <div
              key={floor.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-gray-800"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{floor.name}</span>
              <button
                type="button"
                onClick={() => {
                  setRenameFloor({ id: floor.id, name: floor.name })
                  setRenameValue(floor.name)
                }}
                className="text-sm font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
              >
                Rename
              </button>
            </div>
          ))
        )}
      </div>

      <Modal
        open={addFloorOpen}
        onClose={() => setAddFloorOpen(false)}
        title="Add Floor"
        footer={
          <Button fullWidth loading={createFloor.isPending} disabled={newFloorName.trim() === ''} onClick={handleAddFloor}>
            Add Floor
          </Button>
        }
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Floor name</span>
          <Input type="text" value={newFloorName} onChange={(event) => setNewFloorName(event.target.value)} />
        </label>
      </Modal>

      <Modal
        open={renameFloor !== null}
        onClose={() => setRenameFloor(null)}
        title="Rename Floor"
        footer={
          <Button fullWidth loading={updateFloor.isPending} disabled={renameValue.trim() === ''} onClick={handleRenameFloor}>
            Save
          </Button>
        }
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Floor name</span>
          <Input type="text" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
        </label>
      </Modal>
    </div>
  )
}
