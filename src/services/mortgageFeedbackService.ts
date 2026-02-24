import { supabase } from "@/integrations/supabase/client";
import { MortgageProfileFeedback, FeedbackSection, ReviewStatus } from "@/types/mortgage";

/**
 * Fetch all feedback messages for a specific mortgage profile
 */
export async function fetchProfileFeedback(profileId: string): Promise<MortgageProfileFeedback[]> {
  const { data, error } = await supabase
    .from('mortgage_profile_feedback')
    .select(`
      *,
      sender:user_profiles!sender_id (
        id,
        full_name,
        email,
        role
      )
    `)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching profile feedback:", error);
    throw error;
  }

  // Map sender information
  return (data || []).map((feedback: any) => ({
    ...feedback,
    sender_name: feedback.sender?.full_name || feedback.sender?.email || 'Unknown',
    sender_role: feedback.sender?.role || 'user'
  }));
}

/**
 * Send a feedback message
 */
export async function sendFeedbackMessage(
  profileId: string,
  message: string,
  section: FeedbackSection | null = 'general'
): Promise<MortgageProfileFeedback> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('mortgage_profile_feedback')
    .insert({
      profile_id: profileId,
      sender_id: user.id,
      message,
      section,
      is_read: false
    })
    .select(`
      *,
      sender:user_profiles!sender_id (
        id,
        full_name,
        email,
        role
      )
    `)
    .single();

  if (error) {
    console.error("Error sending feedback:", error);
    throw error;
  }

  // Map sender information
  return {
    ...data,
    sender_name: data.sender?.full_name || data.sender?.email || 'Unknown',
    sender_role: data.sender?.role || 'user'
  };
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('mortgage_profile_feedback')
    .update({ is_read: true })
    .in('id', messageIds);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

/**
 * Get unread message count for a profile
 */
export async function getUnreadCount(profileId: string): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 0;

  const { count, error } = await supabase
    .from('mortgage_profile_feedback')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('is_read', false)
    .neq('sender_id', user.id); // Don't count own messages

  if (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Update profile review status
 */
export async function updateReviewStatus(
  profileId: string,
  status: ReviewStatus
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const updateData: any = {
    review_status: status
  };

  // If broker is approving/rejecting, update reviewed fields
  if (status === 'approved' || status === 'rejected') {
    updateData.last_reviewed_at = new Date().toISOString();
    updateData.last_reviewed_by = user.id;
  }

  const { error } = await supabase
    .from('mortgage_profiles')
    .update(updateData)
    .eq('id', profileId);

  if (error) {
    console.error("Error updating review status:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time feedback updates
 */
export function subscribeToFeedback(
  profileId: string,
  callback: (feedback: MortgageProfileFeedback) => void
) {
  const channel = supabase
    .channel(`feedback:${profileId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mortgage_profile_feedback',
        filter: `profile_id=eq.${profileId}`
      },
      (payload) => {
        callback(payload.new as MortgageProfileFeedback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
