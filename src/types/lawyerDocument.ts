export interface LawyerDocument {
  id: string;
  lawyer_id: string;
  client_id: string | null;
  relationship_id: string | null;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  is_shared_with_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface LawyerDocumentFormData {
  client_id?: string;
  relationship_id?: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
  is_shared_with_client?: boolean;
}

export const DOCUMENT_TYPES = [
  'Contract',
  'Agreement',
  'Court Filing',
  'Evidence',
  'Correspondence',
  'Invoice',
  'Receipt',
  'Legal Opinion',
  'Research',
  'Other'
] as const;
