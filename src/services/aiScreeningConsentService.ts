import { supabase } from '@/integrations/supabase/client';

export const AI_SCREENING_CONSENT_TEXT =
  'I consent to my rental application being processed by an automated AI screening ' +
  'system on behalf of the landlord. This system will analyse the documents and ' +
  'information I have provided to assess my suitability as a tenant. I understand ' +
  'I may request a human review of any automated decision.';

export interface RecordConsentOptions {
  applicationId: string;
  consentGiven: boolean;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Record the tenant's AI screening consent.
 * - Updates rental_applications with the consent flag + timestamp
 * - Inserts an immutable row into ai_screening_consent_log
 */
export async function recordAiScreeningConsent(opts: RecordConsentOptions): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const now = new Date().toISOString();

  const db = supabase as any;

  // 1. Update the application row
  const { error: updateError } = await db
    .from('rental_applications')
    .update({
      ai_screening_consent_given: opts.consentGiven,
      ai_screening_consent_date:  opts.consentGiven ? now : null,
      ai_screening_consent_ip:    opts.ipAddress ?? null,
      ai_screening_consent_text:  opts.consentGiven ? AI_SCREENING_CONSENT_TEXT : null,
    })
    .eq('id', opts.applicationId)
    .eq('applicant_id', user.id); // ensure ownership

  if (updateError) throw new Error(`Failed to update consent: ${updateError.message}`);

  // 2. Append to immutable audit log
  const { error: logError } = await db
    .from('ai_screening_consent_log')
    .insert({
      application_id: opts.applicationId,
      tenant_id:      user.id,
      consent_given:  opts.consentGiven,
      consent_date:   now,
      consent_ip:     opts.ipAddress ?? null,
      consent_text:   opts.consentGiven ? AI_SCREENING_CONSENT_TEXT : null,
      user_agent:     opts.userAgent ?? navigator.userAgent,
    });

  if (logError) throw new Error(`Failed to log consent: ${logError.message}`);
}

/**
 * Check whether a tenant has consented for a given application.
 * Returns true only if consent_given = true.
 */
export async function hasAiScreeningConsent(applicationId: string): Promise<boolean> {
  const { data, error } = await (supabase as any)
    .from('rental_applications')
    .select('ai_screening_consent_given')
    .eq('id', applicationId)
    .single();

  if (error || !data) return false;
  return (data as any).ai_screening_consent_given === true;
}

/**
 * Fetch the full consent audit trail for an application.
 */
export async function getConsentLog(applicationId: string) {
  const { data, error } = await (supabase as any)
    .from('ai_screening_consent_log')
    .select('*')
    .eq('application_id', applicationId)
    .order('consent_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch consent log: ${error.message}`);
  return data;
}
