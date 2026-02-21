// =====================================================
// Property Document Service
// =====================================================
// Purpose: Handle property document uploads, access
//          requests, and listing strength calculations
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import type { PropertyDocument, DocumentAccessRequest, PropertyDocumentType } from "@/types/propertyCategories";

const STORAGE_BUCKET = 'property-documents';

/**
 * Upload a property document
 */
export async function uploadPropertyDocument(
  propertyId: string,
  file: File,
  documentType: PropertyDocumentType,
  documentLabel: string,
  isPublic: boolean = false
): Promise<PropertyDocument> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${documentType}_${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    // Create document record
    const { data, error } = await supabase
      .from('property_documents')
      .insert({
        property_id: propertyId,
        document_type: documentType,
        document_label: documentLabel,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_public: isPublic,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return data as PropertyDocument;
  } catch (error) {
    console.error('Error uploading property document:', error);
    throw error;
  }
}

/**
 * Get all documents for a property
 */
export async function getPropertyDocuments(
  propertyId: string
): Promise<PropertyDocument[]> {
  try {
    console.log('🔍 getPropertyDocuments called with propertyId:', propertyId);
    
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    console.log('📊 Query result:', { data, error, count: data?.length || 0 });

    if (error) throw error;

    return (data || []) as PropertyDocument[];
  } catch (error) {
    console.error('Error fetching property documents:', error);
    throw error;
  }
}

/**
 * Get public documents for a property (for buyers)
 */
export async function getPublicPropertyDocuments(
  propertyId: string
): Promise<PropertyDocument[]> {
  try {
    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return (data || []) as PropertyDocument[];
  } catch (error) {
    console.error('Error fetching public documents:', error);
    throw error;
  }
}

/**
 * Update document privacy setting
 */
export async function updateDocumentPrivacy(
  documentId: string,
  isPublic: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('property_documents')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating document privacy:', error);
    throw error;
  }
}

/**
 * Delete a property document (soft delete)
 */
export async function deletePropertyDocument(
  documentId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('property_documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting property document:', error);
    throw error;
  }
}

/**
 * Request access to a private document
 */
export async function requestDocumentAccess(
  documentId: string,
  propertyId: string,
  message?: string
): Promise<DocumentAccessRequest> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get user profile for name/email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('document_access_requests')
      .insert({
        document_id: documentId,
        property_id: propertyId,
        requester_id: user.id,
        requester_email: profile?.email || user.email,
        requester_name: profile?.full_name || 'Unknown',
        request_message: message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return data as DocumentAccessRequest;
  } catch (error) {
    console.error('Error requesting document access:', error);
    throw error;
  }
}

/**
 * Get access requests for a property (landlord view)
 */
export async function getPropertyAccessRequests(
  propertyId: string
): Promise<DocumentAccessRequest[]> {
  try {
    const { data, error } = await supabase
      .from('document_access_requests')
      .select('*')
      .eq('property_id', propertyId)
      .order('requested_at', { ascending: false });

    if (error) throw error;

    return (data || []) as DocumentAccessRequest[];
  } catch (error) {
    console.error('Error fetching access requests:', error);
    throw error;
  }
}

/**
 * Respond to a document access request
 */
export async function respondToAccessRequest(
  requestId: string,
  status: 'approved' | 'denied',
  responseMessage?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('document_access_requests')
      .update({
        status,
        response_message: responseMessage,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error responding to access request:', error);
    throw error;
  }
}

/**
 * Get listing strength score for a property
 */
export async function getListingStrength(
  propertyId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('calculate_listing_strength', { p_property_id: propertyId });

    if (error) throw error;

    return data || 0;
  } catch (error) {
    console.error('Error calculating listing strength:', error);
    return 0;
  }
}

/**
 * Download a document (for approved access or public documents)
 */
export async function downloadDocument(
  documentId: string
): Promise<Blob> {
  try {
    // Get document info
    const { data: doc, error: docError } = await supabase
      .from('property_documents')
      .select('file_url, is_public')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Check if user has access
    if (!doc.is_public) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if user has approved access request
      const { data: request } = await supabase
        .from('document_access_requests')
        .select('status')
        .eq('document_id', documentId)
        .eq('requester_id', user.id)
        .eq('status', 'approved')
        .single();

      if (!request) {
        throw new Error("Access denied. Please request access first.");
      }
    }

    // Download file
    const response = await fetch(doc.file_url);
    if (!response.ok) throw new Error("Failed to download file");

    return await response.blob();
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}
