import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Modal } from '@/components/ui'
import type { AdminAlert } from './types'

/** PRD 11, Admin screen 2 — active alerts across all buildings, clickable for detail. */
export function AlertsList({ alerts }: { alerts: AdminAlert[] }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<AdminAlert | null>(null)

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Alerts</h2>

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No active alerts.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <Card key={alert.id} onClick={() => setSelected(alert)} className="flex items-center gap-3 p-3">
              <span className="text-2xl" aria-hidden="true">
                ⚠️
              </span>
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900 dark:text-gray-100">{alert.product.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {alert.building.name} · {alert.floor.floor_type === 'warehouse' ? 'Warehouse' : alert.floor.name}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Low Stock Alert"
        footer={
          selected && (
            <Button fullWidth onClick={() => navigate(`/admin/buildings/${selected.building.id}`)}>
              View Building
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selected.product.name}</span> (
              {selected.product.unit})
            </p>
            <p>Building: {selected.building.name}</p>
            <p>Location: {selected.floor.floor_type === 'warehouse' ? 'Warehouse' : selected.floor.name}</p>
            <p>Flagged: {new Date(selected.created_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
