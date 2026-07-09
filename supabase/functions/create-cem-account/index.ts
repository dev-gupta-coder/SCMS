// SCMS — Canvas Workspace
// Edge Function: create-cem-account
//
// Admin cannot insert into auth.users directly from the client (PRD 8 / 4.2)
// — this function is the only path that creates a CEM login. It uses the
// service-role key to call the Auth Admin API and insert the matching
// profiles row. The caller's own JWT is checked first (via a client scoped
// to their Authorization header) to confirm they're an Admin before the
// service-role client is ever touched, so this function grants no more
// access than "Admin can create CEM accounts."
//
// auth.users and profiles aren't in the same Postgres transaction (the
// Auth Admin API isn't SQL), so on a profiles-insert failure the created
// auth user is deleted to avoid an orphaned login with no profile.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface CreateCemAccountBody {
  full_name: string
  company_email: string
  temporary_password: string
  personal_email?: string | null
  phone?: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Scoped to the caller's own JWT — used only to find out who's calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser()

    if (userError || !user) {
      return json({ error: 'Not authenticated' }, 401)
    }

    // Service-role client — bypasses RLS. Only reached after the caller is
    // confirmed to be an Admin below, and only used for the two writes this
    // function exists to perform.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || callerProfile?.role !== 'admin') {
      return json({ error: 'Only Admin can create CEM accounts' }, 403)
    }

    const body = (await req.json()) as CreateCemAccountBody
    const { full_name, company_email, temporary_password, personal_email, phone } = body

    if (!full_name?.trim() || !company_email?.trim() || !temporary_password) {
      return json({ error: 'full_name, company_email, and temporary_password are required' }, 400)
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: company_email.trim(),
      password: temporary_password,
      email_confirm: true,
    })

    if (createError || !created.user) {
      return json({ error: createError?.message ?? 'Could not create login' }, 400)
    }

    const { error: insertError } = await adminClient.from('profiles').insert({
      id: created.user.id,
      full_name: full_name.trim(),
      role: 'cem',
      personal_email: personal_email?.trim() || null,
      phone: phone?.trim() || null,
    })

    if (insertError) {
      await adminClient.auth.admin.deleteUser(created.user.id)
      return json({ error: insertError.message }, 400)
    }

    return json({ profile_id: created.user.id }, 200)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500)
  }
})
