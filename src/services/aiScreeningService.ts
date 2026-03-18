// =====================================================
// AI Screening Service - Orchestration Layer
// Coordinates document processing, rules engine, and notifications
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import { getDocumentSignedUrl, downloadTenantDocument } from "./documentUploadService";
import {
  runRulesEngine,
  getScreeningRules,
  saveScreeningResult,
  logScreeningAction,
  getScreeningResult,
} from "./rulesEngine";
import { extractDocumentData, validateRequiredDocuments } from "./documentProcessor";
import {
  AIScreeningRules,
  AIScreeningResult,
  CreateScreeningLogInput,
  ExtractedDocumentData,
  RulesEngineInput,
  ScreeningDocumentType,
} from "@/types/aiScreening";
import { getTenantProfileForApplication } from "@/utils/profileCompleteness";
import { toast } from "sonner";

// =====================================================
// Main Screening Function
// =====================================================

export async function runAIScreening(applicationId: string): Promise<AIScreeningResult | null> {
  const startTime = Date.now();
  let tenantId: string | null = null;
  let landlordId: string | null = null;
  let propertyId: string | null = null;
  let monthlyRent = 0;

  try {
    // Step 1: Fetch application details
    console.log('🔍 Starting AI screening for application:', applicationId);
    
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*, properties!inner(monthly_rent)')
      .eq('id', applicationId)
      .maybeSingle();

    if (appError || !application) {
      console.error('❌ Application not found:', appError);
      await logScreeningAction({
        application_id: applicationId,
        landlord_id: '',
        tenant_id: '',
        action_type: 'error_occurred',
        action_details: { error: 'Application not found' },
      });
      return null;
    }

    tenantId = application.tenant_id;
    landlordId = application.landlord_id;
    propertyId = application.property_id;
    monthlyRent = application.properties?.monthly_rent || 0;

    // Log screening start
    await logScreeningAction({
      application_id: applicationId,
      landlord_id: landlordId,
      tenant_id: tenantId,
      action_type: 'screening_started',
      action_details: { property_id: propertyId },
    });

    // Step 2: Get screening rules for this landlord
    const rules = await getScreeningRules(landlordId, propertyId);
    if (!rules) {
      console.log('⚠️ No screening rules found, using defaults');
      // Create default rules if none exist
      const defaultRules: AIScreeningRules = {
        id: '',
        landlord_id: landlordId,
        behaviour_mode: 'report_only',
        require_credit_report: true,
        require_payroll: true,
        require_employment_letter: false,
        require_reference_letter: false,
        min_credit_score: 650,
        min_income_to_rent_ratio: 2.5,
        min_employment_months: 3,
        assess_reference_quality: false,
        property_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Use default rules
      return await executeScreening(
        applicationId,
        tenantId,
        landlordId,
        defaultRules,
        monthlyRent,
        startTime
      );
    }

    return await executeScreening(
      applicationId,
      tenantId,
      landlordId,
      rules,
      monthlyRent,
      startTime
    );
  } catch (error) {
    console.error('❌ AI Screening error:', error);
    if (landlordId && tenantId) {
      await logScreeningAction({
        application_id: applicationId,
        landlord_id: landlordId,
        tenant_id: tenantId,
        action_type: 'error_occurred',
        action_details: { error: String(error) },
      });
    }
    return null;
  }
}

// =====================================================
// Execute Screening (Internal)
// =====================================================

async function executeScreening(
  applicationId: string,
  tenantId: string,
  landlordId: string,
  rules: AIScreeningRules,
  monthlyRent: number,
  startTime: number
): Promise<AIScreeningResult | null> {
  try {
    // Step 3: Get tenant profile and document paths
    const tenantProfile = await getTenantProfileForApplication(tenantId);
    if (!tenantProfile) {
      console.error('❌ Tenant profile not found');
      return null;
    }

    // Step 4: Download and process documents
    const extractedData = await processDocuments(tenantProfile, applicationId, landlordId, tenantId);

    // Log each document processed
    for (const doc of extractedData) {
      await logScreeningAction({
        application_id: applicationId,
        landlord_id: landlordId,
        tenant_id: tenantId,
        action_type: 'data_extracted',
        action_details: {
          document_type: doc.document_type,
          confidence: doc.confidence_score,
          data_points: doc.data_points,
        },
        document_type: doc.document_type,
        document_path: doc.file_name,
      });
    }

    // Step 5: Run rules engine
    const rulesInput: RulesEngineInput = {
      extracted_data: extractedData,
      rules,
      monthly_rent: monthlyRent,
    };

    const rulesOutput = await runRulesEngine(rulesInput);

    // Log rule evaluations
    for (const rule of rulesOutput.rule_results) {
      await logScreeningAction({
        application_id: applicationId,
        landlord_id: landlordId,
        tenant_id: tenantId,
        action_type: 'rule_evaluated',
        action_details: {
          rule_name: rule.rule_name,
          result: rule.result,
          details: rule.details,
        },
        rule_name: rule.rule_name,
        rule_threshold: String(rule.threshold),
        extracted_value: String(rule.extracted_value),
        rule_result: rule.result,
      });
    }

    // Step 6: Save results
    const processingDurationMs = Date.now() - startTime;
    const resultId = await saveScreeningResult(
      rulesOutput,
      applicationId,
      landlordId,
      extractedData,
      processingDurationMs
    );

    // Log decision
    await logScreeningAction({
      application_id: applicationId,
      landlord_id: landlordId,
      tenant_id: tenantId,
      action_type: 'decision_made',
      action_details: {
        overall_result: rulesOutput.overall_result,
        confidence_score: rulesOutput.confidence_score,
        ai_summary: rulesOutput.ai_summary,
        behaviour_mode: rules.behaviour_mode,
      },
    });

    // Step 7: Send notifications based on behaviour mode
    await handleNotifications(
      applicationId,
      landlordId,
      tenantId,
      rules.behaviour_mode,
      rulesOutput.overall_result,
      rulesOutput.missing_documents
    );

    // Fetch and return the saved result
    const result = await getScreeningResult(applicationId);
    return result;
  } catch (error) {
    console.error('❌ Screening execution error:', error);
    throw error;
  }
}

// =====================================================
// Document Processing
// =====================================================

async function processDocuments(
  tenantProfile: Record<string, unknown>,
  applicationId: string,
  landlordId: string,
  tenantId: string
): Promise<ExtractedDocumentData[]> {
  // Map tenant profile fields to document types
  const documentFieldMap: Record<ScreeningDocumentType, keyof typeof tenantProfile> = {
    credit_report: 'credit_score_report',
    payroll: 'additional_documents',
    employment_letter: 'employment_letter',
    reference_letter: 'reference_letters',
  };

  const results: ExtractedDocumentData[] = [];

  for (const [docType, fieldName] of Object.entries(documentFieldMap)) {
    const filePath = tenantProfile[fieldName] as string | null | undefined;
    
    if (!filePath) {
      // Document not uploaded
      results.push({
        document_type: docType as ScreeningDocumentType,
        file_name: '',
        confidence_score: 0,
        data_points: {},
        errors: ['Document not uploaded'],
      });
      continue;
    }

    try {
      // Use the document processor to extract data
      const extracted = await extractDocumentData(filePath, docType as ScreeningDocumentType);
      results.push(extracted);

      // Log each document processed
      await logScreeningAction({
        application_id: applicationId,
        landlord_id: landlordId,
        tenant_id: tenantId,
        action_type: 'data_extracted',
        action_details: {
          document_type: docType,
          confidence: extracted.confidence_score,
          data_points: extracted.data_points,
        },
        document_type: docType as ScreeningDocumentType,
        document_path: extracted.file_name,
      });
    } catch (error) {
      console.error(`❌ Error processing ${docType}:`, error);
      results.push({
        document_type: docType as ScreeningDocumentType,
        file_name: filePath,
        confidence_score: 0,
        data_points: {},
        errors: [String(error)],
      });
    }
  }

  return results;
}

// =====================================================
// Data Extraction (Now handled by documentProcessor)
// =====================================================

// Removed - now using extractDocumentData from documentProcessor.ts

// =====================================================
// Notifications
// =====================================================

async function handleNotifications(
  applicationId: string,
  landlordId: string,
  tenantId: string,
  behaviourMode: AIScreeningRules['behaviour_mode'],
  overallResult: string,
  missingDocuments: ScreeningDocumentType[]
): Promise<void> {
  // Notify landlord of new screening result
  await logScreeningAction({
    application_id: applicationId,
    landlord_id: landlordId,
    tenant_id: tenantId,
    action_type: 'notification_sent',
    action_details: {
      type: 'screening_complete',
      behaviour_mode: behaviourMode,
      result: overallResult,
    },
  });

  // If documents are missing, notify tenant
  if (missingDocuments.length > 0) {
    await logScreeningAction({
      application_id: applicationId,
      landlord_id: landlordId,
      tenant_id: tenantId,
      action_type: 'notification_sent',
      action_details: {
        type: 'missing_documents',
        documents: missingDocuments,
      },
    });
  }
}

// =====================================================
// Public API Functions
// =====================================================

export async function getApplicationScreening(
  applicationId: string
): Promise<AIScreeningResult | null> {
  return await getScreeningResult(applicationId);
}

export async function overrideScreeningDecision(
  applicationId: string,
  landlordId: string,
  newResult: 'approved' | 'declined',
  reason?: string
): Promise<void> {
  // Update the screening result
  const { error } = await supabase
    .from('ai_screening_results')
    .update({
      overall_result: newResult,
      updated_at: new Date().toISOString(),
    })
    .eq('application_id', applicationId);

  if (error) {
    console.error('Error overriding screening decision:', error);
    throw error;
  }

  // Log the override
  await logScreeningAction({
    application_id: applicationId,
    landlord_id: landlordId,
    tenant_id: '', // Would need to fetch
    action_type: 'landlord_override',
    action_details: {
      new_result: newResult,
      reason: reason,
    },
  });
}

export async function updateScreeningRules(
  landlordId: string,
  rules: Partial<AIScreeningRules>
): Promise<void> {
  const { error } = await supabase
    .from('ai_screening_rules')
    .update({
      ...rules,
      updated_at: new Date().toISOString(),
    })
    .eq('landlord_id', landlordId)
    .is('property_id', null);

  if (error) {
    console.error('Error updating screening rules:', error);
    throw error;
  }
}