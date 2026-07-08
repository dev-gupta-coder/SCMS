import { useEffect, useMemo } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useFloors, useLocationStock, useMyBuildings } from './api'
import { LocationSelector } from './LocationSelector'
import { CheckInChecklist } from './CheckInChecklist'
import { AllFloorsChecklist } from './AllFloorsChecklist'
import type { StockRow, StockRowWithFloor } from './types'

/** PRD 11, CEM App screens 3-4 — Location Selector + Today's Check-In checklist. */
export function CheckInPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: buildings, isLoading: buildingsLoading } = useMyBuildings()
  const { data: floors, isLoading: floorsLoading } = useFloors(buildingId)

  const building = buildings?.find((b) => b.id === buildingId)
  const warehouse = floors?.find((f) => f.floor_type === 'warehouse')
  const locationParam = searchParams.get('loc')

  // Default to the warehouse on first load of a building.
  useEffect(() => {
    if (!locationParam && warehouse) {
      setSearchParams({ loc: warehouse.id }, { replace: true })
    }
  }, [locationParam, warehouse, setSearchParams])

  const selectedLocation = locationParam ?? warehouse?.id ?? ''
  const floorIds = useMemo(() => floors?.map((f) => f.id) ?? [], [floors])

  const stockQuery = useLocationStock(
    selectedLocation === 'all' ? { type: 'all', floorIds } : { type: 'floor', floorId: selectedLocation },
  )

  if (buildingsLoading || floorsLoading) return <LoadingScreen />
  if (!buildingId || (buildings && !building)) return <Navigate to="/cem" replace />

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">{building?.name}</h1>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/cem/${buildingId}/products`)}
            className="text-sm font-medium text-canvas-600 hover:text-canvas-700"
          >
            Products
          </button>
          {buildings && buildings.length > 1 && (
            <button
              type="button"
              onClick={() => navigate('/cem')}
              className="text-sm font-medium text-canvas-600 hover:text-canvas-700"
            >
              Switch Building
            </button>
          )}
        </div>
      </div>

      {floors && floors.length > 0 && (
        <LocationSelector floors={floors} value={selectedLocation} onChange={(value) => setSearchParams({ loc: value })} />
      )}

      {stockQuery.isLoading && <LoadingScreen />}
      {stockQuery.isError && <p className="text-sm text-red-600">Could not load stock. Try again.</p>}

      {stockQuery.data &&
        (selectedLocation === 'all' ? (
          <AllFloorsChecklist rows={stockQuery.data as StockRowWithFloor[]} />
        ) : (
          <CheckInChecklist
            rows={stockQuery.data as StockRow[]}
            locationType={floors?.find((f) => f.id === selectedLocation)?.floor_type ?? 'floor'}
            onLogDelivery={
              warehouse && selectedLocation === warehouse.id ? () => navigate(`/cem/${buildingId}/delivery`) : undefined
            }
            onTransferStock={() => navigate(`/cem/${buildingId}/transfer?loc=${selectedLocation}`)}
            onUpdateStock={() => navigate(`/cem/${buildingId}/update-stock?loc=${selectedLocation}`)}
          />
        ))}
    </div>
  )
}
