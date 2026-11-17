// Admin opretter en CCC/CREW-bruger. Erstatter det gamle mønster, hvor browseren kaldte
// auth.signUp og derefter selv indsatte sin profil i public.users med en valgfri rolle —
// så kunne enhver med den offentlige nøgle oprette sig selv som ADMIN.
//
// Sikkerhed: kræver gyldig Supabase-JWT (verify_jwt) OG at kalderen har role='ADMIN' i public.users.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROLES = ['INSTRUCTOR', 'GAMEMASTER', 'ADMIN']
const MIN_PASSWORD_LENGTH = 6

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt)
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401)

  const { data: caller } = await admin.from('users').select('role').eq('id', userData.user.id).maybeSingle()
  if (!caller || caller.role !== 'ADMIN') return json({ error: 'forbidden' }, 403)

  let body: { email?: string; password?: string; role?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const role = String(body.role ?? '')
  const name = String(body.name ?? '').trim() || null
  if (!email.includes('@')) return json({ error: 'invalid_email' }, 400)
  if (password.length < MIN_PASSWORD_LENGTH) return json({ error: 'password_too_short' }, 400)
  if (!ROLES.includes(role)) return json({ error: 'invalid_role' }, 400)

  const { data: existing } = await admin.from('users').select('id').eq('email', email).maybeSingle()
  if (existing) return json({ error: 'EMAIL_EXISTS' }, 409)

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr || !created?.user) {
    const msg = createErr?.message || 'Failed to create user'
    return json({ error: /already/i.test(msg) ? 'EMAIL_EXISTS' : msg }, 400)
  }

  const { error: profileErr } = await admin.from('users').upsert(
    { id: created.user.id, email, role, name, created_at: new Date().toISOString() },
    { onConflict: 'id' },
  )
  if (profileErr) return json({ error: profileErr.message }, 400)

  return json({ success: true, id: created.user.id })
})
