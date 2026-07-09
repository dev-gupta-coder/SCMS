export type DateRangePreset = 'day' | 'week' | 'month' | 'custom'

export interface DateRange {
  from: string
  to: string
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Shared by Total Spend (screen 2) and Ledger History (screen 8) — both filter by day/week/month/custom range. */
export function computeDateRange(preset: DateRangePreset, customFrom: string, customTo: string): DateRange {
  const today = new Date()

  if (preset === 'day') {
    const iso = toISODate(today)
    return { from: iso, to: iso }
  }

  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(today.getDate() - 6)
    return { from: toISODate(start), to: toISODate(today) }
  }

  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: toISODate(start), to: toISODate(today) }
  }

  return { from: customFrom, to: customTo }
}
