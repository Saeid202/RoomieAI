import { supabase } from "@/integrations/supabase/client";
import { LawyerDocument, LawyerDocumentFormData } from "@/types/lawyerDocument";

export async function uploadLawyerDocument(
  lawyerId: string,
  file: File,
  metadata: Omit<LawyerDocumentFormData, 'file_path' | 'file_size' | 'mime_type'>
): Promise<LawyerDocument | null> {
  try {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${lawyerId}/${Date.now()}_${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lawyer-documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Create document record
    const { data, error } = await supabase
      .from('lawyer_documents')
      .insert({
        lawyer_id: lawyerId,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        ...metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating document record:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in uploadLawyerDocument:", error);
    throw error;
  }
}

export async function fetchLawyerDocuments(
  lawyerId: string,
  clientId?: string
): Promise<LawyerDocument[]> {
  let query = supabase
    .from('lawyer_documents')
    .select('*')
    .eq('lawyer_id', lawyerId);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data || [];
}

export async function getDocumentSignedUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('lawyer-documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

export async function deleteLawyerDocument(documentId: string, filePath: string): Promise<boolean> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('lawyer-documents')
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
    }

    // Delete record
    const { error: dbError } = await supabase
      .from('lawyer_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error("Error deleting document record:", dbError);
      throw dbError;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteLawyerDocument:", error);
    throw error;
  }
}

export async function updateDocumentSharing(
  documentId: string,
  isShared: boolean
): Promise<LawyerDocument | null> {
  const { data, error } = await supabase
    .from('lawyer_documents')
    .update({
      is_shared_with_client: isShared,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating document sharing:", error);
    throw error;
  }

  return data;
}
