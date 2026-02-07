
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Identify Reporting Period (Previous Month)
        // Runs on e.g. Feb 1st, reports for Jan
        const now = new Date();
        // Default to previous month
        let targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Optional: Allow manual override of 'period' in body for testing: { "period": "2024-01" }
        const reqBody = await req.json().catch(() => ({}));
        if (reqBody.period) {
            targetDate = new Date(reqBody.period + "-01");
        }

        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1; // 1-12
        const reportingPeriod = `${year}-${String(month).padStart(2, '0')}`;

        console.log(`🚀 Starting Dry-Run Credit Reporting Job for period: ${reportingPeriod}`);

        // Time ranges for the reporting month
        // "Completed billing month" usually means Due Date within that month OR Paid Date within that month?
        // Standard practice: Report based on Due Date cycle. If due in Jan, report in Feb.
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        // 2. Creates Batch Record
        const { data: batch, error: batchError } = await supabaseClient
            .from('credit_reporting_batches')
            .insert({
                reporting_period: reportingPeriod,
                dry_run: true,
                status: 'processing'
            })
            .select()
            .single();

        if (batchError) throw new Error(`Failed to create batch: ${batchError.message}`);

        // 3. Gather Eligible Data
        // Join logic manual or via extensive query. 
        // We need: Paid Rent Ledgers where Tenant has Consent.

        // 3.1 Fetch Tenants with Active Consent
        const { data: consents, error: consentError } = await supabaseClient
            .from('user_consents')
            .select('user_id')
            .eq('consent_type', 'rent_credit_reporting')
            .eq('granted', true)
            .is('revoked_at', null);

        if (consentError) throw new Error(`Consent fetch failed: ${consentError.message}`);

        const consentedUserIds = consents.map(c => c.user_id);
        console.log(`ℹ️ Found ${consentedUserIds.length} users with active consent.`);

        if (consentedUserIds.length === 0) {
            // Close batch empty
            await supabaseClient.from('credit_reporting_batches').update({ status: 'completed', record_count: 0 }).eq('id', batch.id);
            return new Response(JSON.stringify({ success: true, message: "No consented users found.", batch }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3.2 Fetch Rent Ledgers for these users in period
        // Filtering by Due Date in the reporting month
        const { data: ledgers, error: ledgerError } = await supabaseClient
            .from('rent_ledgers')
            .select('*, tenant:tenant_id(full_name), lease:lease_id(rent_amount)')    // Removed: landlord:landlord_id(full_name) - landlord_id is on ledger itself usually
            .in('tenant_id', consentedUserIds)
            .eq('status', 'paid')
            .gte('due_date', startOfMonth.toISOString())
            .lte('due_date', endOfMonth.toISOString());

        if (ledgerError) throw new Error(`Ledger fetch failed: ${ledgerError.message}`);

        console.log(`ℹ️ Found ${ledgers.length} eligible rent records.`);

        // 4. Build Payloads & Insert Entries
        let recordCount = 0;
        const entries = [];

        for (const ledger of ledgers) {
            // Double check paid_at exists (it should if status=paid)
            if (!ledger.paid_at) continue;

            const payload = {
                tenant_id: ledger.tenant_id,
                lease_id: ledger.lease_id,
                landlord_id: ledger.landlord_id,
                month: reportingPeriod,
                rent_amount: ledger.rent_amount, // or lease rent amount
                paid_amount: ledger.amount_paid,
                due_date: ledger.due_date,
                paid_at: ledger.paid_at,
                on_time: ledger.on_time,
                days_late: ledger.days_late,
                payment_method_type: ledger.payment_method_type,
                reporting_period: reportingPeriod,
                generated_at: new Date().toISOString(),
                dry_run_disclaimer: "INTERNAL ONLY - NO SUBMISSION"
            };

            entries.push({
                batch_id: batch.id,
                tenant_id: ledger.tenant_id,
                lease_id: ledger.lease_id,
                payload: payload,
                status: 'dry_run_completed'
            });

            recordCount++;
        }

        if (entries.length > 0) {
            const { error: insertError } = await supabaseClient
                .from('credit_reporting_entries')
                .insert(entries);

            if (insertError) throw new Error(`Failed to insert entries: ${insertError.message}`);
        }

        // 5. Finalize Batch
        await supabaseClient
            .from('credit_reporting_batches')
            .update({
                status: 'completed',
                record_count: recordCount
            })
            .eq('id', batch.id);

        return new Response(JSON.stringify({
            success: true,
            message: `Batch processed successfully. ${recordCount} records generated.`,
            batchId: batch.id,
            period: reportingPeriod
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("❌ Job Failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
