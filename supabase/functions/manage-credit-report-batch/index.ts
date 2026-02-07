
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

        const { batchId, action, adminUserId } = await req.json();

        if (!batchId || !action || !adminUserId) {
            throw new Error("Missing required fields (batchId, action, adminUserId)");
        }

        console.log(`Managing Batch ${batchId}: Action = ${action}`);

        // Fetch current status
        const { data: batch, error: batchError } = await supabaseClient
            .from('credit_reporting_batches')
            .select('*')
            .eq('id', batchId)
            .single();

        if (batchError || !batch) throw new Error("Batch not found");

        let newStatus = batch.status;
        let metadata = {};

        if (action === 'approve') {
            if (batch.status !== 'ready_for_review') {
                throw new Error("Batch must be 'ready_for_review' to approve.");
            }
            newStatus = 'approved_for_export';

            await supabaseClient.from('credit_reporting_batches')
                .update({
                    status: newStatus,
                    approved_at: new Date().toISOString(),
                    approved_by: adminUserId
                })
                .eq('id', batchId);

        } else if (action === 'block') {
            newStatus = 'blocked';
            await supabaseClient.from('credit_reporting_batches')
                .update({ status: newStatus })
                .eq('id', batchId);

        } else if (action === 'export_csv' || action === 'export_json') {
            // Export Actions do not change status to 'exported' immediately usually, or do they?
            // Let's set to 'exported' if it was 'approved_for_export'
            if (batch.status === 'approved_for_export') {
                newStatus = 'exported';
                await supabaseClient.from('credit_reporting_batches')
                    .update({
                        status: newStatus,
                        exported_at: new Date().toISOString()
                    })
                    .eq('id', batchId);
            }

            // Retrieve Data for Export
            const { data: entries } = await supabaseClient
                .from('credit_reporting_entries')
                .select('*, tenant:tenant_id(full_name, email)')
                .eq('batch_id', batchId);

            metadata = { format: action, count: entries?.length };

            // Return Data (for client to download)
            if (action === 'export_json') {
                // ... Audit happens below ...
                await logAudit(supabaseClient, batchId, adminUserId, action, metadata);

                return new Response(JSON.stringify({
                    success: true,
                    data: entries, // Full JSON dump
                    filename: `rent_credit_report_${batch.reporting_period}.json`
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            if (action === 'export_csv') {
                // Generate CSV string
                const headers = [
                    "tenant_id", "tenant_full_name", "tenant_email",
                    "reporting_period", "rent_amount", "paid_amount",
                    "due_date", "paid_at", "on_time", "days_late"
                ].join(",");

                const rows = entries?.map((e: any) => {
                    const p = e.payload;
                    return [
                        e.tenant_id,
                        `"${e.tenant?.full_name || ''}"`,
                        e.tenant?.email || '',
                        p.month,
                        p.rent_amount,
                        p.paid_amount,
                        p.due_date,
                        p.paid_at,
                        p.on_time,
                        p.days_late
                    ].join(",");
                });

                const csvContent = [headers, ...(rows || [])].join("\n");

                // ... Audit happens below ...
                await logAudit(supabaseClient, batchId, adminUserId, action, metadata);

                return new Response(JSON.stringify({
                    success: true,
                    csv: csvContent,
                    filename: `rent_credit_report_${batch.reporting_period}.csv`
                }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }

        // Default Audit Log for state changes
        await logAudit(supabaseClient, batchId, adminUserId, action, { old_status: batch.status, new_status: newStatus });

        return new Response(JSON.stringify({ success: true, status: newStatus }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Management Failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function logAudit(supabase: any, batchId: string, adminId: string, action: string, metadata: any) {
    await supabase.from('credit_reporting_audit_logs').insert({
        batch_id: batchId,
        actor_admin_id: adminId,
        action: action,
        metadata: metadata
    });
}

// HARD SAFETY GATE
// // NO EXTERNAL CREDIT BUREAU SUBMISSION IN THIS PHASE
// No HTTP calls to Equifax/TransUnion exist in this file.
