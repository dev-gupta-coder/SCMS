import { Modal, toast } from '@/components/ui'
import { useAllBuildingsFull } from '@/features/admin/buildings/api'
import { useAssignBuilding, useCemAssignments, useUnassignBuilding } from './api'
import type { CemProfile } from './api'

interface ManageAssignmentsModalProps {
  cem: CemProfile
  open: boolean
  onClose: () => void
}

export function ManageAssignmentsModal({ cem, open, onClose }: ManageAssignmentsModalProps) {
  const { data: buildings } = useAllBuildingsFull()
  const { data: assignments } = useCemAssignments()
  const assignBuilding = useAssignBuilding()
  const unassignBuilding = useUnassignBuilding()

  const assignedForCem = (assignments ?? []).filter((assignment) => assignment.cem_id === cem.id)

  const toggle = async (buildingId: string) => {
    const existing = assignedForCem.find((assignment) => assignment.building_id === buildingId)
    try {
      if (existing) {
        await unassignBuilding.mutateAsync(existing.id)
      } else {
        await assignBuilding.mutateAsync({ cemId: cem.id, buildingId })
      }
    } catch {
      toast.error('Could not update assignment. Try again.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Assign Buildings — ${cem.full_name}`}>
      <div className="flex flex-col gap-2">
        {(buildings ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No buildings yet.</p>
        ) : (
          (buildings ?? []).map((building) => {
            const isAssigned = assignedForCem.some((assignment) => assignment.building_id === building.id)
            return (
              <label
                key={building.id}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={isAssigned}
                  onChange={() => toggle(building.id)}
                  className="h-4 w-4 rounded border-gray-300 text-canvas-500 focus:ring-canvas-500 dark:border-gray-600 dark:bg-gray-800"
                />
                {building.name}
                {!building.is_active && <span className="text-xs text-gray-400 dark:text-gray-500">(Inactive)</span>}
              </label>
            )
          })
        )}
      </div>
    </Modal>
  )
}
