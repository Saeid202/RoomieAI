
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch unpaid rent ledgers that are due or overdue AND have auto-pay enabled
        const today = new Date().toISOString().split('T')[0];

        const { data: ledgers, error } = await supabaseClient
            .from('rent_ledgers')
            .select(`
                *,
                lease:lease_contracts!inner(
                    id, 
                    auto_pay_enabled, 
                    payment_day_of_month
                )
            `)
            .eq('status', 'unpaid')
            .lte('due_date', today) // Due today or in the past
            .eq('lease.auto_pay_enabled', true)

        if (error) throw error;

        console.log(`Found ${ledgers?.length} auto-pay ledgers to process.`);

        const results = [];

        // 2. Process each ledger entry
        for (const ledger of ledgers || []) {
            try {
                // Here we would trigger the actual payment logic (e.g. charge saved card)
                // For this MVP step, we will verify "Overdue" status marking if payment fails or day passes

                // If due date < today, mark overdue if not auto-paid
                if (ledger.due_date < today) {
                    await supabaseClient
                        .from('rent_ledgers')
                        .update({ status: 'overdue' })
                        .eq('id', ledger.id);
                    results.push({ id: ledger.id, status: 'marked_overdue' });
                } else {
                    // Trigger payment (In real implementation, this calls stripe)
                    // Here we'll just log it for the prompt requirement of "Auto-Pay toggles"
                    results.push({ id: ledger.id, status: 'ready_for_payment' });
                }

            } catch (e) {
                console.error(`Failed to process ledger ${ledger.id}:`, e);
            }
        }

        return new Response(JSON.stringify({ processed: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
