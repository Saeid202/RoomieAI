// =====================================================
// Rules Engine - Pure Logic (No AI)
// Compares extracted data against landlord thresholds
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import {
  AIScreeningRules,
  ExtractedDocumentData,
  RuleEvaluation,
  RulesEngineInput,
  RulesEngineOutput,
  RuleResultStatus,
  ScreeningDocumentType,
  ScreeningOverallResult,
} from "@/types/aiScreening";

// Document type to required field mapping
const DOCUMENT_REQUIREMENTS: Record<ScreeningDocumentType, keyof ExtractedDocumentData['data_points'][]> = {
  credit_report: ['credit_score'],
  payroll: ['monthly_income'],
  employment_letter: ['employer_name', 'job_title', 'employment_months'],
  reference_letter: ['reference_quality', 'reference_contact'],
};

// Hard rules that cause auto-decline in auto_decline mode
const HARD_RULES = ['credit_score', 'income_ratio'];

export async function runRulesEngine(
  input: RulesEngineInput
): Promise<RulesEngineOutput> {
  const { extracted_data, rules, monthly_rent } = input;
  const rule_results: RuleEvaluation[] = [];
  const missing_documents: ScreeningDocumentType[] = [];

  // Step 1: Check document completeness
  const requiredDocs: ScreeningDocumentType[] = [];
  if (rules.require_credit_report) requiredDocs.push('credit_report');
  if (rules.require_payroll) requiredDocs.push('payroll');
  if (rules.require_employment_letter) requiredDocs.push('employment_letter');
  if (rules.require_reference_letter) requiredDocs.push('reference_letter');

  for (const docType of requiredDocs) {
    const doc = extracted_data.find((d) => d.document_type === docType);
    if (!doc) {
      missing_documents.push(docType);
      rule_results.push({
        rule_name: `${docType}_present`,
        rule_description: `${formatDocType(docType)} is required`,
        extracted_value: 'missing',
        threshold: 'required',
        result: 'fail',
        is_hard_rule: true,
        details: `Missing required document: ${formatDocType(docType)}`,
      });
    } else {
      rule_results.push({
        rule_name: `${docType}_present`,
        rule_description: `${formatDocType(docType)} is present`,
        extracted_value: 'present',
        threshold: 'required',
        result: 'pass',
        is_hard_rule: false,
        details: `Document found: ${doc.file_name}`,
      });
    }
  }

  const documents_complete = missing_documents.length === 0;

  // Step 2: Evaluate credit score rule
  const creditDoc = extracted_data.find((d) => d.document_type === 'credit_report');
  if (creditDoc && creditDoc.data_points.credit_score !== undefined) {
    const creditScore = creditDoc.data_points.credit_score;
    const passed = creditScore >= rules.min_credit_score;
    rule_results.push({
      rule_name: 'credit_score',
      rule_description: `Minimum credit score of ${rules.min_credit_score}`,
      extracted_value: creditScore,
      threshold: rules.min_credit_score,
      result: passed ? 'pass' : 'fail',
      is_hard_rule: HARD_RULES.includes('credit_score'),
      details: passed
        ? `Credit score ${creditScore} meets minimum requirement`
        : `Credit score ${creditScore} is below minimum of ${rules.min_credit_score}`,
    });
  }

  // Step 3: Evaluate income-to-rent ratio
  const payrollDoc = extracted_data.find((d) => d.document_type === 'payroll');
  if (payrollDoc && payrollDoc.data_points.monthly_income !== undefined) {
    const income = payrollDoc.data_points.monthly_income;
    const ratio = income / monthly_rent;
    const passed = ratio >= rules.min_income_to_rent_ratio;
    rule_results.push({
      rule_name: 'income_ratio',
      rule_description: `Income-to-rent ratio of at least ${rules.min_income_to_rent_ratio}x`,
      extracted_value: `${ratio.toFixed(2)}x`,
      threshold: `${rules.min_income_to_rent_ratio}x`,
      result: passed ? 'pass' : 'conditional',
      is_hard_rule: HARD_RULES.includes('income_ratio'),
      details: passed
        ? `Income $${income.toLocaleString()} / Rent $${monthly_rent.toLocaleString()} = ${ratio.toFixed(2)}x`
        : `Income $${income.toLocaleString()} is ${ratio.toFixed(2)}x rent (needs ${rules.min_income_to_rent_ratio}x)`,
    });
  }

  // Step 4: Evaluate employment tenure
  const employmentDoc = extracted_data.find((d) => d.document_type === 'employment_letter');
  if (employmentDoc && employmentDoc.data_points.employment_months !== undefined) {
    const months = employmentDoc.data_points.employment_months;
    const passed = months >= rules.min_employment_months;
    rule_results.push({
      rule_name: 'employment_tenure',
      rule_description: `At least ${rules.min_employment_months} months at current job`,
      extracted_value: `${months} months`,
      threshold: `${rules.min_employment_months} months`,
      result: passed ? 'pass' : 'conditional',
      is_hard_rule: false,
      details: passed
        ? `Tenant has been employed for ${months} months`
        : `Only ${months} months employment (needs ${rules.min_employment_months}+)`,
    });
  }

  // Step 5: Reference letter quality (if enabled)
  if (rules.assess_reference_quality) {
    const refDoc = extracted_data.find((d) => d.document_type === 'reference_letter');
    if (refDoc && refDoc.data_points.reference_quality) {
      const quality = refDoc.data_points.reference_quality;
      const qualityOrder = ['excellent', 'good', 'average', 'poor', 'unclear'];
      const isPositive = qualityOrder.indexOf(quality) <= 1; // excellent or good
      rule_results.push({
        rule_name: 'reference_quality',
        rule_description: 'Reference letter quality assessment',
        extracted_value: quality,
        threshold: 'good or excellent',
        result: isPositive ? 'pass' : 'conditional',
        is_hard_rule: false,
        details: `Reference quality rated as: ${quality}`,
      });
    }
  }

  // Step 6: Calculate overall result
  const { overall_result, confidence_score } = calculateOverallResult(
    rule_results,
    documents_complete,
    rules.behaviour_mode
  );

  // Step 7: Generate AI summary
  const ai_summary = generateSummary(rule_results, overall_result, documents_complete);

  return {
    overall_result,
    confidence_score,
    rule_results,
    documents_complete,
    missing_documents,
    ai_summary,
  };
}

// =====================================================
// Helper Functions
// =====================================================

function calculateOverallResult(
  rule_results: RuleEvaluation[],
  documents_complete: boolean,
  behaviour_mode: AIScreeningRules['behaviour_mode']
): { overall_result: ScreeningOverallResult; confidence_score: number } {
  const failCount = rule_results.filter((r) => r.result === 'fail').length;
  const conditionalCount = rule_results.filter((r) => r.result === 'conditional').length;
  const passCount = rule_results.filter((r) => r.result === 'pass').length;
  const totalRules = rule_results.length;

  // Calculate confidence based on data quality
  const confidence_score = totalRules > 0 ? passCount / totalRules : 0;

  // Auto-approve mode: approve if all pass
  if (behaviour_mode === 'auto_approve') {
    if (!documents_complete) {
      return { overall_result: 'pending', confidence_score };
    }
    if (failCount === 0) {
      return { overall_result: 'approved', confidence_score };
    }
    return { overall_result: 'declined', confidence_score };
  }

  // Auto-decline mode: decline if any hard rule fails
  if (behaviour_mode === 'auto_decline') {
    if (!documents_complete) {
      return { overall_result: 'pending', confidence_score };
    }
    const hardFailCount = rule_results.filter(
      (r) => r.result === 'fail' && r.is_hard_rule
    ).length;
    if (hardFailCount > 0) {
      return { overall_result: 'declined', confidence_score };
    }
    if (failCount === 0 && conditionalCount === 0) {
      return { overall_result: 'approved', confidence_score };
    }
    return { overall_result: 'conditional', confidence_score };
  }

  // Report-only mode: always report, let landlord decide
  if (!documents_complete) {
    return { overall_result: 'pending', confidence_score };
  }
  if (failCount === 0 && conditionalCount === 0) {
    return { overall_result: 'approved', confidence_score };
  }
  if (failCount > 0) {
    return { overall_result: 'declined', confidence_score };
  }
  return { overall_result: 'conditional', confidence_score };
}

function generateSummary(
  rule_results: RuleEvaluation[],
  overall_result: ScreeningOverallResult,
  documents_complete: boolean
): string {
  const passCount = rule_results.filter((r) => r.result === 'pass').length;
  const failCount = rule_results.filter((r) => r.result === 'fail').length;
  const conditionalCount = rule_results.filter((r) => r.result === 'conditional').length;

  if (!documents_complete) {
    const missing = rule_results
      .filter((r) => r.result === 'fail' && r.rule_name.endsWith('_present'))
      .map((r) => r.details?.replace('Missing required document: ', ''))
      .join(', ');
    return `Application is pending. Missing documents: ${missing || 'required documents'}`;
  }

  switch (overall_result) {
    case 'approved':
      return `All ${passCount} screening rules passed. Application meets all requirements.`;
    case 'declined':
      return `${failCount} rule(s) failed. Application does not meet minimum requirements.`;
    case 'conditional':
      return `${passCount} passed, ${conditionalCount} conditional. Review required before approval.`;
    default:
      return 'Application requires manual review.';
  }
}

function formatDocType(docType: ScreeningDocumentType): string {
  const labels: Record<ScreeningDocumentType, string> = {
    credit_report: 'Credit Report',
    payroll: 'Payroll Documents',
    employment_letter: 'Employment Letter',
    reference_letter: 'Reference Letter',
  };
  return labels[docType] || docType;
}

// =====================================================
// Database Functions
// =====================================================

export async function getScreeningRules(
  landlordId: string,
  propertyId?: string
): Promise<AIScreeningRules | null> {
  // Try property-specific rules first, then fall back to global
  let query = supabase
    .from('ai_screening_rules')
    .select('*')
    .eq('landlord_id', landlordId);

  if (propertyId) {
    query = query.or(`property_id.eq.${propertyId},property_id.is.null`);
    query = query.order('property_id', { ascending: false }); // property-specific first
  } else {
    query = query.is('property_id', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching screening rules:', error);
    throw error;
  }

  return data;
}

export async function saveScreeningResult(
  result: RulesEngineOutput,
  applicationId: string,
  landlordId: string,
  extractedData: ExtractedDocumentData[],
  processingDurationMs?: number
): Promise<string> {
  const { data, error } = await supabase
    .from('ai_screening_results')
    .insert({
      application_id: applicationId,
      landlord_id: landlordId,
      overall_result: result.overall_result,
      confidence_score: result.confidence_score,
      documents_complete: result.documents_complete,
      missing_documents: result.missing_documents,
      extracted_data: extractedData,
      rule_results: result.rule_results,
      ai_summary: result.ai_summary,
      processed_at: new Date().toISOString(),
      processing_duration_ms: processingDurationMs,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving screening result:', error);
    throw error;
  }

  return data.id;
}

export async function logScreeningAction(
  log: CreateScreeningLogInput
): Promise<void> {
  const { error } = await supabase.from('ai_screening_logs').insert({
    application_id: log.application_id,
    landlord_id: log.landlord_id,
    tenant_id: log.tenant_id,
    action_type: log.action_type,
    action_details: log.action_details || {},
    document_type: log.document_type || null,
    document_path: log.document_path || null,
    rule_name: log.rule_name || null,
    rule_threshold: log.rule_threshold || null,
    extracted_value: log.extracted_value || null,
    rule_result: log.rule_result || null,
  });

  if (error) {
    console.error('Error logging screening action:', error);
    throw error;
  }
}

export async function getScreeningResult(
  applicationId: string
): Promise<AIScreeningResult | null> {
  const { data, error } = await supabase
    .from('ai_screening_results')
    .select('*')
    .eq('application_id', applicationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching screening result:', error);
    throw error;
  }

  return data;
}

export async function updateScreeningRules(
  rulesId: string,
  updates: UpdateScreeningRulesInput
): Promise<void> {
  const { error } = await supabase
    .from('ai_screening_rules')
    .update(updates)
    .eq('id', rulesId);

  if (error) {
    console.error('Error updating screening rules:', error);
    throw error;
  }
}

export async function createScreeningRules(
  landlordId: string,
  input: CreateScreeningRulesInput
): Promise<string> {
  const { data, error } = await supabase
    .from('ai_screening_rules')
    .insert({
      landlord_id: landlordId,
      ...input,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating screening rules:', error);
    throw error;
  }

  return data.id;
}