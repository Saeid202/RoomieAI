
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

        const { batchId, adminUserId } = await req.json();

        if (!batchId) throw new Error("batchId is required");

        console.log(`Starting Validation for Batch: ${batchId}`);

        // 1. Fetch Batch Entries with expanded tenant data
        // We need to query the entries table, then also check "current" state of tenant profile/consent 
        // to ensure nothing changed since generation (though generation was likely seconds ago or we want to validate the 'snapshot').
        // Use the Payload snapshot for data integrity, but "Consent" should be re-verified against live status for safety.

        const { data: entries, error: entryError } = await supabaseClient
            .from('credit_reporting_entries')
            .select('*, tenant:tenant_id(id, full_name, email)') // basic join
            .eq('batch_id', batchId);

        if (entryError) throw entryError;

        // Fetch Consents in bulk for efficiency
        const tenantIds = entries.map((e: any) => e.tenant_id);
        const { data: consents, error: consentError } = await supabaseClient
            .from('user_consents')
            .select('user_id, granted, revoked_at')
            .eq('consent_type', 'rent_credit_reporting')
            .in('user_id', tenantIds);

        if (consentError) throw consentError;

        const issues = [];
        let validCount = 0;

        // 2. Validate Each Entry
        for (const entry of entries) {
            const payload = entry.payload;
            const tenant = entry.tenant;
            const consent = consents.find((c: any) => c.user_id === entry.tenant_id);

            // Check 1: Consent
            if (!consent || !consent.granted || consent.revoked_at) {
                issues.push({
                    batch_id: batchId,
                    entry_id: entry.id,
                    issue_type: 'missing_consent',
                    description: `Tenant ${tenant?.full_name || entry.tenant_id} does not have active consent.`
                });
                continue;
            }

            // Check 2: Payment Data Integrity
            if (!payload.paid_at || !payload.due_date) {
                issues.push({
                    batch_id: batchId,
                    entry_id: entry.id,
                    issue_type: 'data_integrity',
                    description: `Missing payment dates.`
                });
                continue;
            }
            if (Number(payload.rent_amount) <= 0) {
                issues.push({
                    batch_id: batchId,
                    entry_id: entry.id,
                    issue_type: 'data_integrity',
                    description: `Rent amount is invalid (<= 0).`
                });
                continue;
            }

            // Check 3: Tenant Identity (Approximate check if we have enough info)
            if (!tenant?.full_name) {
                issues.push({
                    batch_id: batchId,
                    entry_id: entry.id,
                    issue_type: 'missing_identity',
                    description: `Tenant full name missing.`
                });
                continue;
            }
            // Note: DOB/Address might be missing in profiles but are required for bureaus.
            // If we don't have them in 'profiles', we'd flag it here. 
            // Assuming 'profiles' generally has this or we rely on 'full_name' + 'match' logic.
            // For now, Full Name + Email constitutes our "minimum identity" for this stage.

            validCount++;
        }

        // 3. Clear old issues for this batch (if re-running validation)
        await supabaseClient.from('credit_reporting_batch_issues').delete().eq('batch_id', batchId);

        // 4. Update Batch Status
        let newStatus = 'ready_for_review';
        if (issues.length > 0) {
            newStatus = 'blocked';
            // Insert issues
            const { error: issueInsertError } = await supabaseClient
                .from('credit_reporting_batch_issues')
                .insert(issues);
            if (issueInsertError) throw issueInsertError;
        }

        await supabaseClient
            .from('credit_reporting_batches')
            .update({ status: newStatus })
            .eq('id', batchId);

        // 5. Audit Log
        if (adminUserId) {
            await supabaseClient.from('credit_reporting_audit_logs').insert({
                batch_id: batchId,
                actor_admin_id: adminUserId,
                action: 'validate',
                metadata: {
                    valid_count: validCount,
                    issue_count: issues.length,
                    outcome: newStatus
                }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            status: newStatus,
            issuesCount: issues.length
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Validation Failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
