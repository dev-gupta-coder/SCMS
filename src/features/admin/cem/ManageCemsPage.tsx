import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAllBuildingsFull } from '@/features/admin/buildings/api'
import { useCemAssignments, useCems, useSetCemActive } from './api'
import type { CemProfile } from './api'
import { ManageAssignmentsModal } from './ManageAssignmentsModal'

type CemTab = 'active' | 'deactivated'

const TABS: { value: CemTab; label: string }[] = [
  { value: 'active', label: 'Active CEMs' },
  { value: 'deactivated', label: 'Deactivated CEMs' },
]

/** PRD 11, Admin screen 6 — Manage CEM Assignments + entry point to Create CEM Account. */
export function ManageCemsPage() {
  const navigate = useNavigate()
  const { data: cems, isLoading: cemsLoading } = useCems()
  const { data: buildings, isLoading: buildingsLoading } = useAllBuildingsFull()
  const { data: assignments, isLoading: assignmentsLoading } = useCemAssignments()
  const setCemActive = useSetCemActive()
  const [managingCem, setManagingCem] = useState<CemProfile | null>(null)
  const [tab, setTab] = useState<CemTab>('active')
  const [pendingId, setPendingId] = useState<string | null>(null)

  if (cemsLoading || buildingsLoading || assignmentsLoading) return <LoadingScreen />

  const buildingName = (id: string) => buildings?.find((building) => building.id === id)?.name ?? 'Unknown'
  const visibleCems = (cems ?? []).filter((cem) => (tab === 'active' ? cem.is_active : !cem.is_active))

  const handleToggleActive = async (cem: CemProfile) => {
    setPendingId(cem.id)
    try {
      await setCemActive.mutateAsync({ cemId: cem.id, isActive: !cem.is_active })
      toast.success(cem.is_active ? 'CEM deactivated.' : 'CEM reactivated.')
    } catch {
      toast.error('Could not update CEM. Try again.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage CEM Assignments</h1>

      <Button onClick={() => navigate('/admin/cems/new')}>+ Create CEM Account</Button>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === option.value
                ? 'border-canvas-500 text-canvas-600 dark:text-canvas-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleCems.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          {tab === 'active' ? 'No active CEMs.' : 'No deactivated CEMs.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleCems.map((cem) => {
            const cemBuildingIds = (assignments ?? [])
              .filter((assignment) => assignment.cem_id === cem.id)
              .map((assignment) => assignment.building_id)

            return (
              <Card key={cem.id} className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{cem.full_name}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setManagingCem(cem)}
                      className="text-sm font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
                    >
                      Assign Buildings{/* was "Manage" */}
                    </button>
                    <Button
                      variant={cem.is_active ? 'danger' : 'secondary'}
                      size="sm"
                      loading={pendingId === cem.id}
                      onClick={() => handleToggleActive(cem)}
                    >
                      {cem.is_active ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </div>
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
