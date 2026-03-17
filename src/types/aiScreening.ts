// =====================================================
// AI Screening Agent - TypeScript Types
// =====================================================

// Agent behaviour modes
export type ScreeningBehaviourMode = 'auto_approve' | 'report_only' | 'auto_decline';

// Document types
export type ScreeningDocumentType = 
  | 'credit_report'
  | 'payroll'
  | 'employment_letter'
  | 'reference_letter';

// Rule result types
export type RuleResultStatus = 'pass' | 'fail' | 'conditional' | 'not_applicable';

// Overall screening result
export type ScreeningOverallResult = 'approved' | 'conditional' | 'declined' | 'pending' | 'error';

// =====================================================
// Screening Rules Configuration
// =====================================================

export interface AIScreeningRules {
  id: string;
  landlord_id: string;
  behaviour_mode: ScreeningBehaviourMode;
  require_credit_report: boolean;
  require_payroll: boolean;
  require_employment_letter: boolean;
  require_reference_letter: boolean;
  min_credit_score: number;
  min_income_to_rent_ratio: number;
  min_employment_months: number;
  assess_reference_quality: boolean;
  property_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScreeningRulesInput {
  behaviour_mode?: ScreeningBehaviourMode;
  require_credit_report?: boolean;
  require_payroll?: boolean;
  require_employment_letter?: boolean;
  require_reference_letter?: boolean;
  min_credit_score?: number;
  min_income_to_rent_ratio?: number;
  min_employment_months?: number;
  assess_reference_quality?: boolean;
  property_id?: string | null;
}

export interface UpdateScreeningRulesInput extends Partial<CreateScreeningRulesInput> {}

// =====================================================
// Screening Results
// =====================================================

export interface ExtractedDocumentData {
  document_type: ScreeningDocumentType;
  file_name: string;
  extracted_text?: string;
  confidence_score: number; // 0-1
  data_points: {
    credit_score?: number;
    monthly_income?: number;
    employer_name?: string;
    job_title?: string;
    employment_months?: number;
    reference_quality?: 'excellent' | 'good' | 'average' | 'poor' | 'unclear';
    reference_contact?: string;
    [key: string]: unknown;
  };
  errors?: string[];
}

export interface RuleEvaluation {
  rule_name: string;
  rule_description: string;
  extracted_value: string | number | null;
  threshold: string | number | null;
  result: RuleResultStatus;
  is_hard_rule: boolean; // hard rules cause auto-decline in auto_decline mode
  details?: string;
}

export interface AIScreeningResult {
  id: string;
  application_id: string;
  landlord_id: string;
  overall_result: ScreeningOverallResult;
  confidence_score: number;
  documents_complete: boolean;
  missing_documents: ScreeningDocumentType[];
  extracted_data: ExtractedDocumentData[];
  rule_results: RuleEvaluation[];
  ai_summary: string;
  processed_at: string | null;
  processing_duration_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScreeningResultInput {
  application_id: string;
  landlord_id: string;
  overall_result: ScreeningOverallResult;
  confidence_score: number;
  documents_complete: boolean;
  missing_documents: ScreeningDocumentType[];
  extracted_data: ExtractedDocumentData[];
  rule_results: RuleEvaluation[];
  ai_summary: string;
  processing_duration_ms?: number;
}

export interface UpdateScreeningResultInput {
  overall_result?: ScreeningOverallResult;
  confidence_score?: number;
  extracted_data?: ExtractedDocumentData[];
  rule_results?: RuleEvaluation[];
  ai_summary?: string;
  processed_at?: string;
}

// =====================================================
// Audit Logs
// =====================================================

export type ScreeningLogAction = 
  | 'screening_started'
  | 'document_checked'
  | 'data_extracted'
  | 'rule_evaluated'
  | 'decision_made'
  | 'landlord_override'
  | 'notification_sent'
  | 'error_occurred';

export interface AIScreeningLog {
  id: string;
  application_id: string;
  landlord_id: string;
  tenant_id: string;
  action_type: ScreeningLogAction;
  action_details: Record<string, unknown>;
  document_type: ScreeningDocumentType | null;
  document_path: string | null;
  rule_name: string | null;
  rule_threshold: string | null;
  extracted_value: string | null;
  rule_result: RuleResultStatus | null;
  created_at: string;
}

export interface CreateScreeningLogInput {
  application_id: string;
  landlord_id: string;
  tenant_id: string;
  action_type: ScreeningLogAction;
  action_details?: Record<string, unknown>;
  document_type?: ScreeningDocumentType;
  document_path?: string;
  rule_name?: string;
  rule_threshold?: string;
  extracted_value?: string;
  rule_result?: RuleResultStatus;
}

// =====================================================
// Application with Screening Results
// =====================================================

export interface ApplicationWithScreening {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  status: string;
  screening_result: AIScreeningResult | null;
}

// =====================================================
// Rules Engine Types
// =====================================================

export interface RulesEngineInput {
  extracted_data: ExtractedDocumentData[];
  rules: AIScreeningRules;
  monthly_rent: number;
}

export interface RulesEngineOutput {
  overall_result: ScreeningOverallResult;
  confidence_score: number;
  rule_results: RuleEvaluation[];
  documents_complete: boolean;
  missing_documents: ScreeningDocumentType[];
  ai_summary: string;
}