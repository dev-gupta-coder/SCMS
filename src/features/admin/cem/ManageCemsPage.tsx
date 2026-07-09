import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAllBuildingsFull } from '@/features/admin/buildings/api'
import { useCemAssignments, useCems } from './api'
import type { CemProfile } from './api'
import { ManageAssignmentsModal } from './ManageAssignmentsModal'

/** PRD 11, Admin screen 6 — Manage CEM Assignments + entry point to Create CEM Account. */
export function ManageCemsPage() {
  const navigate = useNavigate()
  const { data: cems, isLoading: cemsLoading } = useCems()
  const { data: buildings, isLoading: buildingsLoading } = useAllBuildingsFull()
  const { data: assignments, isLoading: assignmentsLoading } = useCemAssignments()
  const [managingCem, setManagingCem] = useState<CemProfile | null>(null)

  if (cemsLoading || buildingsLoading || assignmentsLoading) return <LoadingScreen />

  const buildingName = (id: string) => buildings?.find((building) => building.id === id)?.name ?? 'Unknown'

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage CEM Assignments</h1>

      <Button onClick={() => navigate('/admin/cems/new')}>+ Create CEM Account</Button>

      {(cems ?? []).length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">No CEMs yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {(cems ?? []).map((cem) => {
            const cemBuildingIds = (assignments ?? [])
              .filter((assignment) => assignment.cem_id === cem.id)
              .map((assignment) => assignment.building_id)

            return (
              <Card key={cem.id} className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{cem.full_name}</span>
                  <button
                    type="button"
                    onClick={() => setManagingCem(cem)}
                    className="text-sm font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cemBuildingIds.length === 0 ? (
                    <span className="text-sm text-gray-400 dark:text-gray-500">No buildings assigned</span>
                  ) : (
                    cemBuildingIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-full bg-canvas-50 px-2 py-0.5 text-xs font-medium text-canvas-700 dark:bg-canvas-500/10 dark:text-canvas-300"
                      >
                        {buildingName(id)}
                      </span>
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {managingCem && (
        <ManageAssignmentsModal cem={managingCem} open={managingCem !== null} onClose={() => setManagingCem(null)} />
      )}
    </div>
  )
}
