import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'

interface CollapsibleListProps<T> {
  items: T[]
  itemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  /** CLAUDE.md UX Polish: "at most 2-3 items by default" — 3 is the shared default for every list using this. */
  defaultVisibleCount?: number
}

/** Shared collapse/expand pattern (CLAUDE.md UX Polish — Overview Dashboard) — one implementation reused by every long list on the dashboard, not a per-section one-off. */
export function CollapsibleList<T>({ items, itemKey, renderItem, defaultVisibleCount = 3 }: CollapsibleListProps<T>) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = expanded ? items : items.slice(0, defaultVisibleCount)
  const hiddenCount = items.length - defaultVisibleCount

  return (
    <>
      {visibleItems.map((item) => (
        <Fragment key={itemKey(item)}>{renderItem(item)}</Fragment>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="self-center text-sm font-medium text-canvas-600 hover:text-canvas-700 dark:text-canvas-400 dark:hover:text-canvas-300"
        >
          {expanded ? 'See less' : `See more (${hiddenCount})`}
        </button>
      )}
    </>
  )
}
