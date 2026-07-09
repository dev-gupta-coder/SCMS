import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAllBuildingsFull } from './api'

/** PRD 11, Admin screen 5 — Manage Buildings & Floors, building list + entry point. */
export function ManageBuildingsPage() {
  const navigate = useNavigate()
  const { data: buildings, isLoading } = useAllBuildingsFull()

  if (isLoading) return <LoadingScreen />

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Buildings & Floors</h1>

      <Button onClick={() => navigate('/admin/buildings/new')}>+ Add Building</Button>

      {(buildings ?? []).length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">No buildings yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {(buildings ?? []).map((building) => (
            <Card
              key={building.id}
              onClick={() => navigate(`/admin/buildings/${building.id}/manage`)}
              className="flex items-center justify-between p-3"
            >
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {building.name}
                  {!building.is_active && (
                    <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">(Inactive)</span>
                  )}
                </span>
                {building.address && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{building.address}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
