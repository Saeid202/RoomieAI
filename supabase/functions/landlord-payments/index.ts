import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        })
    }

    try {
        // 1. Validate Authorization Header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 2. Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: authHeader } } }
        )

        // 3. Authenticate User
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            console.error('User Auth Error:', userError)
            return new Response(
                JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
                {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        console.log(`[landlord-payments] Fetching payments for user: ${user.email} (ID: ${user.id})`)

        // 4. Normalize Email for Searching
        const normalizedEmail = user.email?.trim().toLowerCase()

        if (!normalizedEmail) {
            return new Response(
                JSON.stringify({ error: 'User email not found' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 5. Query Payments (landlord_id OR recipient_email match)
        const { data, error } = await supabaseClient
            .from('rental_payments')
            .select(`
        *,
        tenant:profiles!tenant_id(full_name, email)
      `)
            .or(`landlord_id.eq.${user.id},recipient_email.ilike.${normalizedEmail}`)
            .in('payment_status', ['processing', 'paid', 'paid_to_landlord'])
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Database Query Error:', error)
            return new Response(
                JSON.stringify({ error: 'Failed to fetch payments', details: error.message }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 6. Return Payments (empty array if none found - NOT an error)
        return new Response(
            JSON.stringify({
                payments: data || [],
                count: data?.length || 0
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )

    } catch (err: any) {
        console.error('Edge Function Error:', err)
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error' }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
