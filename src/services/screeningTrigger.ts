// =====================================================
// Screening Trigger Service
// Triggers AI screening when applications are submitted
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import { runAIScreening } from "./aiScreeningService";
import { logScreeningAction } from "./rulesEngine";
import { AIScreeningRules } from "@/types/aiScreening";

export interface ApplicationSubmission {
  applicationId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
}

/**
 * Trigger screening when a new application is submitted
 * This is called from the frontend after application submission
 */
export async function onApplicationSubmitted(
  applicationId: string,
  tenantId: string,
  landlordId: string,
  propertyId: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🎯 Triggering AI screening for application:', applicationId);

    // Log the trigger event
    await logScreeningAction({
      application_id: applicationId,
      landlord_id: landlordId,
      tenant_id: tenantId,
      action_type: 'screening_started',
      action_details: {
        property_id: propertyId,
        triggered_at: new Date().toISOString(),
      },
    });

    // Run the screening asynchronously
    // In production, this should be queued as a background job
    runAIScreening(applicationId)
      .then(async (result) => {
        if (result) {
          console.log('✅ Screening complete for application:', applicationId);
          console.log('   Result:', result.overall_result);
          console.log('   Confidence:', Math.round(result.confidence_score * 100) + '%');
        }
      })
      .catch(async (error) => {
        console.error('❌ Screening failed for application:', applicationId, error);
        await logScreeningAction({
          application_id: applicationId,
          landlord_id: landlordId,
          tenant_id: tenantId,
          action_type: 'error_occurred',
          action_details: {
            error: String(error),
            phase: 'screening_execution',
          },
        });
      });

    return {
      success: true,
      message: 'Screening started in background',
    };
  } catch (error) {
    console.error('Error triggering screening:', error);
    return {
      success: false,
      message: `Failed to trigger screening: ${error}`,
    };
  }
}

/**
 * Get screening status for an application
 */
export async function getScreeningStatus(applicationId: string): Promise<{
  hasResult: boolean;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: string;
  processedAt?: string;
}> {
  const { data, error } = await supabase
    .from('ai_screening_results')
    .select('overall_result, processed_at, created_at')
    .eq('application_id', applicationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching screening status:', error);
    return { hasResult: false, status: 'error' };
  }

  if (!data) {
    return { hasResult: false, status: 'pending' };
  }

  if (!data.processed_at) {
    return { hasResult: true, status: 'processing', result: data.overall_result };
  }

  return {
    hasResult: true,
    status: 'complete',
    result: data.overall_result,
    processedAt: data.processed_at,
  };
}

/**
 * Retry failed screening for an application
 */
export async function retryScreening(
  applicationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get application details
    const { data: application, error } = await supabase
      .from('rental_applications')
      .select('tenant_id, landlord_id, property_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (error || !application) {
      return { success: false, message: 'Application not found' };
    }

    // Delete old result if exists
    await supabase
      .from('ai_screening_results')
      .delete()
      .eq('application_id', applicationId);

    // Trigger new screening
    return await onApplicationSubmitted(
      applicationId,
      application.tenant_id,
      application.landlord_id,
      application.property_id
    );
  } catch (error) {
    console.error('Error retrying screening:', error);
    return { success: false, message: String(error) };
  }
}

/**
 * Batch trigger screening for multiple applications
 */
export async function batchTriggerScreening(
  applicationIds: string[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const applicationId of applicationIds) {
    try {
      // Get application details
      const { data: application, error } = await supabase
        .from('rental_applications')
        .select('tenant_id, landlord_id, property_id')
        .eq('id', applicationId)
        .maybeSingle();

      if (error || !application) {
        results.failed++;
        results.errors.push(`Application ${applicationId}: not found`);
        continue;
      }

      const result = await onApplicationSubmitted(
        applicationId,
        application.tenant_id,
        application.landlord_id,
        application.property_id
      );

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`Application ${applicationId}: ${result.message}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Application ${applicationId}: ${error}`);
    }
  }

  return results;
}

/**
 * Check if screening should auto-approve based on rules and result
 */
export function shouldAutoApprove(
  behaviourMode: AIScreeningRules['behaviour_mode'],
  screeningResult: string
): boolean {
  if (behaviourMode === 'auto_approve' && screeningResult === 'approved') {
    return true;
  }
  return false;
}

/**
 * Check if screening should auto-decline based on rules and result
 */
export function shouldAutoDecline(
  behaviourMode: AIScreeningRules['behaviour_mode'],
  screeningResult: string
): boolean {
  if (behaviourMode === 'auto_decline' && screeningResult === 'declined') {
    return true;
  }
  return false;
}