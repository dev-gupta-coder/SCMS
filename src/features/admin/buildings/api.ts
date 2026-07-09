import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export interface AdminBuildingFull {
  id: string
  name: string
  address: string | null
  is_active: boolean
}

async function fetchAllBuildingsFull(): Promise<AdminBuildingFull[]> {
  const { data, error } = await supabase.from('buildings').select('id, name, address, is_active').order('name')
  if (error) throw error
  return data
}

/** Includes inactive buildings, unlike the Overview Dashboard's list — Admin needs to see/reactivate them here. */
export function useAllBuildingsFull() {
  return useQuery({ queryKey: ['admin', 'buildings-full'], queryFn: fetchAllBuildingsFull })
}

export interface AdminFloor {
  id: string
  building_id: string
  name: string
  floor_type: 'warehouse' | 'floor'
}

async function fetchAllFloors(): Promise<AdminFloor[]> {
  const { data, error } = await supabase.from('floors').select('id, building_id, name, floor_type').order('name')
  if (error) throw error
  return data
}

/** Every floor across every building — used by Ledger History's cascading building/floor filters. */
export function useAllFloors() {
  return useQuery({ queryKey: ['admin', 'floors'], queryFn: fetchAllFloors })
}

interface CreateBuildingParams {
  name: string
  address: string | null
}

async function createBuilding(params: CreateBuildingParams): Promise<string> {
  const { data, error } = await supabase.rpc('create_building', { p_name: params.name, p_address: params.address })
  if (error) throw error
  return data as string
}

/** Atomic: building insert + its auto-created warehouse floor (see migration 0006). */
export function useCreateBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings-full'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] })
    },
  })
}

interface UpdateBuildingParams {
  buildingId: string
  name: string
  address: string | null
  isActive: boolean
}

async function updateBuilding(params: UpdateBuildingParams): Promise<void> {
  const { error } = await supabase
    .from('buildings')
    .update({ name: params.name, address: params.address, is_active: params.isActive })
    .eq('id', params.buildingId)
  if (error) throw error
}

/** Single-row update — no RPC needed, no other table is touched. */
export function useUpdateBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBuilding,
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings-full'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'building', params.buildingId] })
    },
  })
}

interface CreateFloorParams {
  buildingId: string
  name: string
}

async function createFloor(params: CreateFloorParams): Promise<string> {
  const { data, error } = await supabase.rpc('create_floor', { p_building_id: params.buildingId, p_name: params.name })
  if (error) throw error
  return data as string
}

/** Atomic: floor insert + a 0-stock inventory_stock row per existing active product (see migration 0006). */
export function useCreateFloor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFloor,
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'floors', params.buildingId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'building-stock', params.buildingId] })
    },
  })
}

interface UpdateFloorParams {
  floorId: string
  buildingId: string
  name: string
}

async function updateFloor(params: UpdateFloorParams): Promise<void> {
  const { error } = await supabase.from('floors').update({ name: params.name }).eq('id', params.floorId)
  if (error) throw error
}

/** Rename only — the warehouse floor is excluded from this in the UI (system-managed, per PRD 6.2). */
export function useUpdateFloor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateFloor,
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'floors', params.buildingId] })
    },
  })
}
