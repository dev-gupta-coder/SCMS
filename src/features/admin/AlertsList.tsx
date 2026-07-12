import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CollapsibleList, Modal } from '@/components/ui'
import { groupAlertsByProductAndBuilding } from './api'
import type { AdminAlertGroup } from './api'
import type { AdminAlert } from './types'

/** PRD 11, Admin screen 2 — active alerts across all buildings, clickable for detail. */
export function AlertsList({ alerts }: { alerts: AdminAlert[] }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<AdminAlertGroup | null>(null)
  const groups = groupAlertsByProductAndBuilding(alerts)

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Alerts</h2>

      {groups.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No active alerts.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <CollapsibleList
            items={groups}
            itemKey={(group) => group.key}
            renderItem={(group) => (
              <Card onClick={() => setSelected(group)} className="flex items-center gap-3 p-3">
                <span className="text-2xl" aria-hidden="true">
                  ⚠️
                </span>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{group.product.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {group.building.name} ·{' '}
                    {group.floors.length === 1
                      ? group.floors[0].floor_type === 'warehouse'
                        ? 'Warehouse'
                        : group.floors[0].name
                      : `${group.floors.length} locations low`}
                  </span>
                </div>
              </Card>
            )}
          />
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
          <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-100">{selected.product.name}</span> (
              {selected.product.unit})
            </p>
            <p>Building: {selected.building.name}</p>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {selected.floors.length === 1 ? 'Location' : `${selected.floors.length} locations low`}
              </span>
              {selected.floors.map((floor) => (
                <p key={floor.alertId} className="flex items-center justify-between gap-3">
                  <span>{floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name}</span>
                  <span className="text-gray-400 dark:text-gray-500">{new Date(floor.created_at).toLocaleString()}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
