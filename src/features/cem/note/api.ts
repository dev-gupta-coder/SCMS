import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

async function fetchMyNote(cemId: string): Promise<string> {
  const { data, error } = await supabase.from('cem_notes').select('content').eq('cem_id', cemId).maybeSingle()
  if (error) throw error
  return data?.content ?? ''
}

/** PRD 11, CEM App screen 12 — single overwritable note, not tied to any building. */
export function useMyNote() {
  const cemId = useAuthStore((state) => state.session?.user.id)
  return useQuery({
    queryKey: ['cem', 'note', cemId],
    queryFn: () => fetchMyNote(cemId!),
    enabled: !!cemId,
  })
}

async function saveMyNote(cemId: string, content: string): Promise<void> {
  const { error } = await supabase.from('cem_notes').upsert({ cem_id: cemId, content })
  if (error) throw error
}

export function useSaveMyNote() {
  const cemId = useAuthStore((state) => state.session?.user.id)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => saveMyNote(cemId!, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cem', 'note', cemId] }),
  })
}
