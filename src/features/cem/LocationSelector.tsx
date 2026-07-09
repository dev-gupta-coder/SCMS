import { Select } from '@/components/ui'
import type { Floor } from './types'

interface LocationSelectorProps {
  floors: Floor[]
  value: string
  onChange: (value: string) => void
}

/** PRD 5, Step 2 — dropdown: Warehouse, a specific Floor, or All Floors. */
export function LocationSelector({ floors, value, onChange }: LocationSelectorProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</span>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {floors.map((floor) => (
          <option key={floor.id} value={floor.id}>
            {floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name}
          </option>
        ))}
        <option value="all">All Floors</option>
      </Select>
    </label>
  )
}
