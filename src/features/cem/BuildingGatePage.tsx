import { Navigate, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useMyBuildings } from './api'

/**
 * PRD 11, CEM App screen 2 — only shown if the CEM manages more than one
 * building; a single-building CEM skips straight to their check-in screen.
 */
export function BuildingGatePage() {
  const navigate = useNavigate()
  const { data: buildings = [], isLoading, isError } = useMyBuildings()

  if (isLoading) return <LoadingScreen />

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">Could not load your buildings. Try again.</p>
      </div>
    )
  }

  if (buildings.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">You are not assigned to any building yet. Contact your Admin.</p>
      </div>
    )
  }

  if (buildings.length === 1) {
    return <Navigate to={`/cem/${buildings[0].id}`} replace />
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Choose a Building</h1>
      <div className="flex flex-col gap-3">
        {buildings.map((building) => (
          <Card key={building.id} onClick={() => navigate(`/cem/${building.id}`)}>
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{building.name}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
