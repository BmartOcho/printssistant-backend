// app/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

// IMPORTANT: This client is for SERVER ROUTES ONLY.
// Do NOT import it in Client Components or ship it to the browser.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
})
