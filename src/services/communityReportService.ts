import { supabase } from "@/integrations/supabase/client";
import type { CommunityReport, CreateReportInput, ReportStatus } from "@/types/community";

// New tables not yet in generated types
const db = supabase as any;

/**
 * Create a report for a post or comment
 */
export async function createReport(input: CreateReportInput): Promise<CommunityReport> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await db
    .from('community_reports')
    .insert({
      reporter_id: user.id,
      target_type: input.target_type,
      target_id: input.target_id,
      reason: input.reason,
      details: input.details || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating report:", error);
    throw new Error(`Failed to create report: ${error.message}`);
  }

  return data as CommunityReport;
}

/**
 * Get all pending reports (admin only)
 */
export async function getPendingReports(): Promise<CommunityReport[]> {
  const { data, error } = await db
    .from('community_reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching pending reports:", error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return (data as CommunityReport[]) || [];
}

/**
 * Get all reports (admin only)
 */
export async function getAllReports(status?: ReportStatus): Promise<CommunityReport[]> {
  let query = db
    .from('community_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reports:", error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return (data as CommunityReport[]) || [];
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(id: string, status: ReportStatus): Promise<CommunityReport> {
  const { data, error } = await db
    .from('community_reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating report status:", error);
    throw new Error(`Failed to update report: ${error.message}`);
  }

  return data as CommunityReport;
}

/**
 * Resolve a report (admin only)
 */
export async function resolveReport(id: string): Promise<CommunityReport> {
  return updateReportStatus(id, 'resolved');
}

/**
 * Ignore a report (admin only)
 */
export async function ignoreReport(id: string): Promise<CommunityReport> {
  return updateReportStatus(id, 'ignored');
}
