import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export interface CemProfile {
  id: string
  full_name: string
  personal_email: string | null
  phone: string | null
}

async function fetchCems(): Promise<CemProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, personal_email, phone')
    .eq('role', 'cem')
    .order('full_name')
  if (error) throw error
  return data
}

export function useCems() {
  return useQuery({ queryKey: ['admin', 'cems'], queryFn: fetchCems })
}

export interface CemAssignment {
  id: string
  cem_id: string
  building_id: string
}

async function fetchAssignments(): Promise<CemAssignment[]> {
  const { data, error } = await supabase.from('cem_building_assignments').select('id, cem_id, building_id')
  if (error) throw error
  return data
}

export function useCemAssignments() {
  return useQuery({ queryKey: ['admin', 'cem-assignments'], queryFn: fetchAssignments })
}

interface AssignParams {
  cemId: string
  buildingId: string
}

async function assignBuilding(params: AssignParams): Promise<void> {
  const { error } = await supabase
    .from('cem_building_assignments')
    .insert({ cem_id: params.cemId, building_id: params.buildingId })
  if (error) throw error
}

/** Single-row insert — no RPC needed. */
export function useAssignBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignBuilding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cem-assignments'] }),
  })
}

async function unassignBuilding(assignmentId: string): Promise<void> {
  const { error } = await supabase.from('cem_building_assignments').delete().eq('id', assignmentId)
  if (error) throw error
}

export function useUnassignBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unassignBuilding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cem-assignments'] }),
  })
}

interface CreateCemAccountParams {
  fullName: string
  companyEmail: string
  temporaryPassword: string
  personalEmail: string | null
  phone: string | null
}

interface CreateCemAccountResponse {
  profile_id?: string
  error?: string
}

async function createCemAccount(params: CreateCemAccountParams): Promise<string> {
  const { data, error } = await supabase.functions.invoke<CreateCemAccountResponse>('create-cem-account', {
    body: {
      full_name: params.fullName,
      company_email: params.companyEmail,
      temporary_password: params.temporaryPassword,
      personal_email: params.personalEmail,
      phone: params.phone,
    },
  })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = (await error.context.json()) as CreateCemAccountResponse
      throw new Error(body.error ?? 'Could not create CEM account.')
    }
    throw new Error('Could not reach the server. Try again.')
  }

  if (!data?.profile_id) throw new Error(data?.error ?? 'Could not create CEM account.')
  return data.profile_id
}

/** Calls the create-cem-account Edge Function — the only path that creates a CEM login (PRD 8). */
export function useCreateCemAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCemAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cems'] }),
  })
}
