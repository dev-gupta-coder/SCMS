import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { AdminBuildingFull } from '@/features/admin/buildings/api'
import type { ConsumptionAnalyticsRow, DeliveryAnalyticsRow } from './api'

export interface CategorySpend {
  category: string
  total: number
}

export interface BuildingSpend {
  building: string
  total: number
}

export interface DailySpend {
  date: string
  total: number
}

export interface ProductUsage {
  product: string
  unit: string
  quantity: number
}

export interface DailyUsage {
  date: string
  quantity: number
}

export function spendByCategory(rows: DeliveryAnalyticsRow[]): CategorySpend[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.product.category, (totals.get(row.product.category) ?? 0) + Number(row.total_price ?? 0))
  }
  return PRODUCT_CATEGORIES.map((category) => ({ category, total: totals.get(category) ?? 0 }))
}

export function spendByBuilding(rows: DeliveryAnalyticsRow[], buildings: AdminBuildingFull[]): BuildingSpend[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.building_id, (totals.get(row.building_id) ?? 0) + Number(row.total_price ?? 0))
  }
  return buildings
    .map((building) => ({ building: building.name, total: totals.get(building.id) ?? 0 }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function spendOverTime(rows: DeliveryAnalyticsRow[]): DailySpend[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const date = row.logged_at.slice(0, 10)
    totals.set(date, (totals.get(date) ?? 0) + Number(row.total_price ?? 0))
  }
  return Array.from(totals, ([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date))
}

export function topConsumedProducts(rows: ConsumptionAnalyticsRow[], limit = 10): ProductUsage[] {
  const totals = new Map<string, ProductUsage>()
  for (const row of rows) {
    const existing = totals.get(row.product.id)
    if (existing) {
      existing.quantity += Number(row.quantity)
    } else {
      totals.set(row.product.id, { product: row.product.name, unit: row.product.unit, quantity: Number(row.quantity) })
    }
  }
  return Array.from(totals.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export function usageOverTime(rows: ConsumptionAnalyticsRow[]): DailyUsage[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const date = row.logged_at.slice(0, 10)
    totals.set(date, (totals.get(date) ?? 0) + Number(row.quantity))
  }
  return Array.from(totals, ([date, quantity]) => ({ date, quantity })).sort((a, b) => a.date.localeCompare(b.date))
}
