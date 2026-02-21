// =====================================================
// Document Access Log Service
// =====================================================
// Purpose: Service for logging and retrieving document
//          access audit trails
// =====================================================

import { supabase } from "@/integrations/supabase/client";

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  property_id: string;
  viewer_id: string;
  viewer_email: string;
  viewer_name: string | null;
  access_type: "view" | "download" | "print_attempt";
  ip_address: string | null;
  user_agent: string | null;
  accessed_at: string;
  created_at: string;
}

/**
 * Log a document access event
 */
export async function logDocumentAccess(
  documentId: string,
  propertyId: string,
  accessType: "view" | "download" | "print_attempt" = "view"
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Get user agent and IP (IP will be null on client-side)
    const userAgent = navigator.userAgent;

    const { error } = await supabase.from("document_access_logs").insert({
      document_id: documentId,
      property_id: propertyId,
      viewer_id: user.id,
      viewer_email: profile?.email || user.email || "unknown@email.com",
      viewer_name: profile?.full_name || null,
      access_type: accessType,
      user_agent: userAgent,
    });

    if (error) throw error;

    console.log(`📊 Document access logged: ${accessType}`);
  } catch (error) {
    console.error("Failed to log document access:", error);
    throw error;
  }
}

/**
 * Get access logs for a specific document
 */
export async function getDocumentAccessLogs(
  documentId: string
): Promise<DocumentAccessLog[]> {
  try {
    const { data, error } = await supabase
      .from("document_access_logs")
      .select("*")
      .eq("document_id", documentId)
      .order("accessed_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Failed to get document access logs:", error);
    throw error;
  }
}

/**
 * Get access logs for a property (all documents)
 */
export async function getPropertyAccessLogs(
  propertyId: string
): Promise<DocumentAccessLog[]> {
  try {
    const { data, error } = await supabase
      .from("document_access_logs")
      .select("*")
      .eq("property_id", propertyId)
      .order("accessed_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Failed to get property access logs:", error);
    throw error;
  }
}

/**
 * Get access logs for a specific viewer
 */
export async function getViewerAccessLogs(
  viewerId: string
): Promise<DocumentAccessLog[]> {
  try {
    const { data, error } = await supabase
      .from("document_access_logs")
      .select("*")
      .eq("viewer_id", viewerId)
      .order("accessed_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Failed to get viewer access logs:", error);
    throw error;
  }
}

/**
 * Get access statistics for a document
 */
export async function getDocumentAccessStats(documentId: string): Promise<{
  totalViews: number;
  uniqueViewers: number;
  printAttempts: number;
  lastAccessed: string | null;
}> {
  try {
    const logs = await getDocumentAccessLogs(documentId);

    const views = logs.filter((log) => log.access_type === "view");
    const uniqueViewers = new Set(logs.map((log) => log.viewer_id)).size;
    const printAttempts = logs.filter(
      (log) => log.access_type === "print_attempt"
    ).length;
    const lastAccessed = logs.length > 0 ? logs[0].accessed_at : null;

    return {
      totalViews: views.length,
      uniqueViewers,
      printAttempts,
      lastAccessed,
    };
  } catch (error) {
    console.error("Failed to get document access stats:", error);
    throw error;
  }
}
