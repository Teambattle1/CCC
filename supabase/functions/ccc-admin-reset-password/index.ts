// Admin password-reset for CCC/CREW. Erstatter det gamle mønster hvor
// frontenden kaldte Auth Admin API'et direkte med service-role-nøglen
// (VITE_SUPABASE_SERVICE_ROLE_KEY) — nøglen bor nu kun her, server-side.
//
// Sikkerhed: kræver gyldig Supabase-JWT (verify_jwt) OG at kalderen har
// role='ADMIN' i public.users. Ellers 401/403.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

  // Hvem kalder? (JWT'en er allerede gateway-verificeret via verify_jwt)
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt)
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401)

  const { data: caller } = await admin
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()
  if (!caller || caller.role !== 'ADMIN') return json({ error: 'forbidden' }, 403)

  let body: { userId?: string; newPassword?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const { userId, newPassword } = body
  if (!userId || typeof userId !== 'string') return json({ error: 'missing_userId' }, 400)
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return json({ error: 'password_too_short' }, 400)
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  })
  if (updErr) return json({ error: updErr.message }, 400)

  return json({ success: true })
})
