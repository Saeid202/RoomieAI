// =====================================================
// Property Document Service
// =====================================================
// Purpose: Handle property document uploads, access
//          requests, and listing strength calculations
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import type { PropertyDocument, DocumentAccessRequest, PropertyDocumentType } from "@/types/propertyCategories";
import { processDocumentForAI } from "./aiPropertyAssistantService";

const STORAGE_BUCKET = 'rental-documents';

/**
 * Trigger AI processing for a document (non-blocking)
 */
async function triggerAIProcessing(
  documentId: string,
  propertyId: string,
  documentUrl: string,
  documentType: string
): Promise<void> {
  try {
    console.log("🤖 Triggering AI processing for document:", documentId);
    await processDocumentForAI(documentId, propertyId, documentUrl, documentType);
    console.log("✅ AI processing triggered successfully");
  } catch (error) {
    console.error("❌ AI processing trigger failed:", error);
    throw error;
  }
}

/**
 * Note: The property-documents bucket is created via database migration.
 * No need to check/create it from client code.
 */

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
    // Prevent invalid UUID 'new' from being passed to database
    if (propertyId === 'new') {
      throw new Error("Cannot upload documents for unsaved property. Please save the property first.");
    }

    console.log("🔵 Starting document upload...", { propertyId, documentType, documentLabel, fileName: file.name, fileSize: file.size });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("❌ Auth error:", authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }
    if (!user) {
      console.error("❌ User not authenticated");
      throw new Error("User not authenticated. Please log in and try again.");
    }
    console.log("✅ User authenticated:", user.id);
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("❌ Session error:", sessionError);
    }
    if (!session) {
      console.error("❌ No active session");
      throw new Error("No active session. Please log in again.");
    }
    console.log("✅ Active session found");

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${documentType}_${Date.now()}.${fileExt}`;
    console.log("🔵 Generated file path:", fileName);

    // Upload file to storage
    console.log("🔵 Uploading to storage bucket:", STORAGE_BUCKET);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      throw uploadError;
    }
    console.log("✅ File uploaded to storage:", uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);
    console.log("✅ Public URL generated:", publicUrl);

    // Create document record
    console.log("🔵 Creating database record...");
    const documentData = {
      property_id: propertyId,
      document_type: documentType,
      document_label: documentLabel,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      is_public: isPublic,
      uploaded_by: user.id,
    };
    console.log("🔵 Document data:", documentData);

    const { data, error } = await supabase
      .from('property_documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      console.error("❌ Database insert error:", error);
      throw error;
    }
    console.log("✅ Document record created:", data);

    // Trigger AI processing in background (don't wait for completion)
    triggerAIProcessing(data.id, propertyId, publicUrl, documentType).catch((error) => {
      console.error("⚠️ Failed to trigger AI processing (non-blocking):", error);
      // Don't throw - document upload succeeded, AI processing can be retried later
    });

    return data as PropertyDocument;
  } catch (error) {
    console.error('❌ Error uploading property document:', error);
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
    // Handle new properties gracefully - return empty array instead of error
    if (propertyId === 'new' || !propertyId) {
      console.log("New property detected, returning empty documents array");
      return [];
    }

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
  responseMessage?: string,
  expiresAt?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const updateData: any = {
      status,
      response_message: responseMessage,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Add expiration date if provided (only for approved requests)
    if (status === 'approved' && expiresAt) {
      updateData.access_expires_at = expiresAt;
    }

    const { error } = await supabase
      .from('document_access_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error responding to access request:', error);
    throw error;
  }
}

/**
 * Revoke an approved document access request immediately
 */
export async function revokeDocumentAccess(requestId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('document_access_requests')
      .update({
        status: 'denied',
        access_expires_at: new Date().toISOString(),
        response_message: 'Access has been ended by the property owner.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      console.error('Supabase error revoking access:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error revoking document access:', error);
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
 * Check if user has valid (non-expired) access to a property's documents
 */
export async function checkDocumentAccess(
  propertyId: string
): Promise<{ hasAccess: boolean; expiresAt?: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasAccess: false };

    // Check for approved access request
    const { data, error } = await supabase
      .from('document_access_requests')
      .select('status, access_expires_at')
      .eq('property_id', propertyId)
      .eq('requester_id', user.id)
      .eq('status', 'approved')
      .maybeSingle();

    if (error) throw error;
    if (!data) return { hasAccess: false };

    // Check if access has expired
    if (data.access_expires_at) {
      const expiresAt = new Date(data.access_expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        // Access has expired - update status
        await supabase
          .from('document_access_requests')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('property_id', propertyId)
          .eq('requester_id', user.id)
          .eq('status', 'approved');
        
        return { hasAccess: false };
      }
    }

    return { 
      hasAccess: true, 
      expiresAt: data.access_expires_at 
    };
  } catch (error) {
    console.error('Error checking document access:', error);
    return { hasAccess: false };
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
      .select('file_url, is_public, property_id')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Check if user has access
    if (!doc.is_public) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if user has approved access request that hasn't expired
      const { data: request } = await supabase
        .from('document_access_requests')
        .select('status, access_expires_at')
        .eq('property_id', doc.property_id)
        .eq('requester_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (!request) {
        throw new Error("Access denied. Please request access first.");
      }

      // Check expiration
      if (request.access_expires_at) {
        const expiresAt = new Date(request.access_expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          // Auto-expire the access
          await supabase
            .from('document_access_requests')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('property_id', doc.property_id)
            .eq('requester_id', user.id)
            .eq('status', 'approved');
          
          throw new Error("Your access has expired. Please request access again.");
        }
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
