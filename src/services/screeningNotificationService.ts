// =====================================================
// Screening Notification Service
// Sends notifications to landlords and tenants based on screening results
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import { AIScreeningResult, ScreeningDocumentType } from "@/types/aiScreening";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send notification to a user
 */
async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_screening_notifications')
      .insert({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link: payload.link,
        metadata: payload.metadata,
        read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error sending notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

/**
 * Notify landlord of new application with AI screening result
 */
export async function notifyLandlordApplication(
  landlordId: string,
  applicationId: string,
  screeningResult: AIScreeningResult
): Promise<void> {
  const resultEmoji = screeningResult.overall_result === 'approved' ? '✅' :
                      screeningResult.overall_result === 'declined' ? '❌' :
                      screeningResult.overall_result === 'conditional' ? '⚠️' : '⏳';

  await sendNotification({
    userId: landlordId,
    title: `New Application ${resultEmoji}`,
    message: `AI screening ${screeningResult.overall_result}: ${screeningResult.ai_summary}`,
    type: screeningResult.overall_result === 'approved' ? 'success' :
          screeningResult.overall_result === 'declined' ? 'warning' : 'info',
    link: `/dashboard/landlord/applications`,
    metadata: {
      applicationId,
      screeningResult: screeningResult.overall_result,
      confidence: screeningResult.confidence_score,
    },
  });
}

/**
 * Notify tenant of application status change
 */
export async function notifyTenantApplicationStatus(
  tenantId: string,
  applicationId: string,
  status: 'approved' | 'declined' | 'pending_documents',
  reason?: string
): Promise<void> {
  const config = {
    approved: {
      title: 'Application Approved! 🎉',
      message: 'Your rental application has been approved. The landlord will contact you with next steps.',
      type: 'success' as const,
    },
    declined: {
      title: 'Application Not Approved',
      message: reason ? `Your application was not approved. ${reason}` : 'Your rental application was not approved.',
      type: 'error' as const,
    },
    pending_documents: {
      title: 'Documents Required',
      message: 'Please upload the missing documents to continue processing your application.',
      type: 'warning' as const,
    },
  };

  const { title, message, type } = config[status];

  await sendNotification({
    userId: tenantId,
    title,
    message,
    type,
    link: `/dashboard/applications`,
    metadata: {
      applicationId,
      status,
      reason,
    },
  });
}

/**
 * Notify tenant of missing documents
 */
export async function notifyMissingDocuments(
  tenantId: string,
  applicationId: string,
  missingDocuments: ScreeningDocumentType[]
): Promise<void> {
  const docLabels: Record<ScreeningDocumentType, string> = {
    credit_report: 'Credit Report',
    payroll: 'Payroll Documents',
    employment_letter: 'Employment Letter',
    reference_letter: 'Reference Letter',
  };

  const missingLabels = missingDocuments.map(d => docLabels[d]).join(', ');

  await sendNotification({
    userId: tenantId,
    title: 'Documents Required',
    message: `Please upload the following documents: ${missingLabels}`,
    type: 'warning',
    link: `/dashboard/profile`,
    metadata: {
      applicationId,
      missingDocuments,
    },
  });
}

/**
 * Send summary notification to landlord (for report_only mode)
 */
export async function sendScreeningSummaryNotification(
  landlordId: string,
  applicationId: string,
  summary: string,
  confidence: number
): Promise<void> {
  await sendNotification({
    userId: landlordId,
    title: 'Application Ready for Review',
    message: summary,
    type: 'info',
    link: `/dashboard/landlord/applications`,
    metadata: {
      applicationId,
      confidence,
    },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('ai_screening_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ai_screening_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return !error;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ai_screening_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  return !error;
}

/**
 * Get recent notifications for a user
 */
export async function getNotifications(
  userId: string,
  limit: number = 20
): Promise<Array<{
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}>> {
  const { data, error } = await supabase
    .from('ai_screening_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    link: n.link,
    read: n.read,
    createdAt: n.created_at,
  }));
}