import type { ChangeEvent } from 'react'
import { cn } from '@/lib/cn'
import { BuildingsIcon } from './icons'
import { navPillBase, navPillInactive } from './navPillStyles'
import type { Building } from './types'

interface BuildingSelectorProps {
  buildings: Building[]
  value: string
  onChange: (buildingId: string) => void
}

/** Header building switcher for CEMs assigned to more than one building — same dropdown pattern as LocationSelector, restyled to match the quick-link pills so a CEM can switch directly from the top bar. */
export function BuildingSelector({ buildings, value, onChange }: BuildingSelectorProps) {
  return (
    <label className={cn(navPillBase, navPillInactive, 'cursor-pointer')}>
      <BuildingsIcon className="h-4 w-4 shrink-0" />
      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        aria-label="Switch building"
        className="cursor-pointer bg-transparent text-inherit focus:outline-none"
      >
        {buildings.map((building) => (
          <option key={building.id} value={building.id} className="text-gray-900 dark:text-gray-100">
            {building.name}
          </option>
        ))}
      </select>
    </label>
  )
}
