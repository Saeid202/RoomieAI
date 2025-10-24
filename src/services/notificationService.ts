import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: 'contract_ready' | 'contract_signed' | 'application_approved' | 'application_rejected' | 'general';
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a new notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  console.log("Creating notification:", input);
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    console.log("Notification created successfully:", data.id);
    return data as Notification;
  } catch (error) {
    console.error("Error in createNotification:", error);
    throw error;
  }
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(): Promise<Notification[]> {
  console.log("Fetching notifications for current user");
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    console.log("Notifications fetched successfully:", data?.length || 0);
    return (data as Notification[]) || [];
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<number> {
  console.log("Fetching unread notifications count");
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('read', false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  console.log("Marking notification as read:", notificationId);
  
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }

    console.log("Notification marked as read successfully");
  } catch (error) {
    console.error("Error in markAsRead:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllAsRead(): Promise<number> {
  console.log("Marking all notifications as read");
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        read: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('read', false)
      .select('id');

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }

    const updatedCount = data?.length || 0;
    console.log(`Marked ${updatedCount} notifications as read`);
    return updatedCount;
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    return 0;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  console.log("Deleting notification:", notificationId);
  
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }

    console.log("Notification deleted successfully");
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    throw error;
  }
}

/**
 * Create contract-related notifications
 */
export async function createContractNotification(
  landlordId: string,
  tenantId: string,
  contractId: string,
  type: 'contract_ready' | 'contract_signed'
): Promise<void> {
  console.log("Creating contract notification:", { landlordId, tenantId, contractId, type });
  
  try {
    if (type === 'contract_ready') {
      // Notify landlord that contract is ready for signature
      await createNotification({
        user_id: landlordId,
        type: 'contract_ready',
        title: 'New Lease Contract Ready',
        message: 'A tenant has signed a lease contract that requires your signature.',
        link: `/dashboard/landlord/contracts/${contractId}`
      });
    } else if (type === 'contract_signed') {
      // Notify tenant that contract is fully executed
      await createNotification({
        user_id: tenantId,
        type: 'contract_signed',
        title: 'Lease Contract Fully Executed',
        message: 'Your lease contract has been fully executed by both parties.',
        link: `/dashboard/contracts/${contractId}`
      });
    }
    
    console.log("Contract notification created successfully");
  } catch (error) {
    console.error("Error in createContractNotification:", error);
    throw error;
  }
}
