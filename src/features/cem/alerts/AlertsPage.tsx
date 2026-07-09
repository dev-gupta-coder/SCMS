import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useActiveAlerts } from './api'

export function AlertsPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const { data: alerts, isLoading, isError } = useActiveAlerts(buildingId)

  if (isLoading) return <LoadingScreen />

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/cem/${buildingId}`)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Alerts</h1>
      </div>

      {isError && <p className="text-sm text-red-600 dark:text-red-400">Could not load alerts. Try again.</p>}

      {alerts &&
        (alerts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">No active alerts.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <Card key={alert.id} className="flex items-center gap-3 p-3">
                <span className="text-2xl" aria-hidden="true">
                  ⚠️
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{alert.product.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Low stock at {alert.floor.floor_type === 'warehouse' ? 'Warehouse' : alert.floor.name}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ))}
    </div>
  )
}
