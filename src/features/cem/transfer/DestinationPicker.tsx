import { Card } from '@/components/ui'
import type { Floor } from '../types'

interface DestinationPickerProps {
  floors: Floor[]
  excludeFloorId: string
  value: string
  onSelect: (floorId: string) => void
}

export function DestinationPicker({ floors, excludeFloorId, value, onSelect }: DestinationPickerProps) {
  const options = floors.filter((floor) => floor.id !== excludeFloorId)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-600">Send to</span>
      <div className="flex flex-col gap-2">
        {options.map((floor) => (
          <Card key={floor.id} selected={value === floor.id} onClick={() => onSelect(floor.id)} className="p-3">
            <span className="font-medium text-gray-900">
              {floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
