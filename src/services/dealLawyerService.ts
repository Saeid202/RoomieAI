// =====================================================
// Deal Lawyer Service
// =====================================================
// Purpose: Handle lawyer assignment to property deals
//          for document review in Secure Document Room
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import type { DealLawyer, LawyerNotification, AssignedDeal, PlatformLawyer } from "@/types/dealLawyer";

/**
 * Get platform's partner lawyer (hardcoded for now)
 * In production, this would fetch from a database of verified platform lawyers
 */
export async function getPlatformLawyer(): Promise<PlatformLawyer | null> {
  try {
    // For now, return the first lawyer in the system
    // In production, you'd have a "is_platform_partner" flag or similar
    const { data, error } = await supabase
      .from('lawyer_profiles')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching platform lawyer:', error);
      return null;
    }

    return data as PlatformLawyer;
  } catch (error) {
    console.error('Error in getPlatformLawyer:', error);
    return null;
  }
}

/**
 * Assign a lawyer to a deal
 */
export async function assignLawyerToDeal(
  dealId: string,
  lawyerId: string,
  buyerId: string
): Promise<DealLawyer> {
  try {
    const { data, error } = await supabase
      .from('deal_lawyers')
      .insert({
        deal_id: dealId,
        lawyer_id: lawyerId,
        buyer_id: buyerId,
        role: 'buyer_lawyer',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for lawyer
    await createLawyerNotification(lawyerId, dealId, buyerId);

    return data as DealLawyer;
  } catch (error) {
    console.error('Error assigning lawyer to deal:', error);
    throw error;
  }
}

/**
 * Get lawyer assigned to a deal
 */
export async function getLawyerForDeal(dealId: string): Promise<DealLawyer | null> {
  try {
    const { data, error } = await supabase
      .from('deal_lawyers')
      .select('*')
      .eq('deal_id', dealId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;

    return data as DealLawyer | null;
  } catch (error) {
    console.error('Error getting lawyer for deal:', error);
    return null;
  }
}

/**
 * Remove lawyer from deal
 */
export async function removeLawyerFromDeal(
  dealId: string,
  lawyerId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('deal_lawyers')
      .update({ 
        status: 'removed',
        updated_at: new Date().toISOString()
      })
      .eq('deal_id', dealId)
      .eq('lawyer_id', lawyerId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing lawyer from deal:', error);
    throw error;
  }
}

/**
 * Get all deals assigned to a lawyer
 */
export async function getDealsForLawyer(lawyerId: string): Promise<AssignedDeal[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_lawyer_assigned_deals', { p_lawyer_id: lawyerId });

    if (error) throw error;

    return (data || []) as AssignedDeal[];
  } catch (error) {
    console.error('Error getting deals for lawyer:', error);
    return [];
  }
}

/**
 * Create notification for lawyer
 */
export async function createLawyerNotification(
  lawyerId: string,
  dealId: string,
  buyerId: string
): Promise<LawyerNotification> {
  try {
    // Get buyer info
    const { data: buyer } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', buyerId)
      .single();

    // Get property info
    const { data: property } = await supabase
      .from('properties')
      .select('address, city')
      .eq('id', dealId)
      .single();

    const buyerName = buyer?.full_name || 'A buyer';
    const propertyAddress = property ? `${property.address}, ${property.city}` : 'a property';

    const { data, error } = await supabase
      .from('lawyer_notifications')
      .insert({
        lawyer_id: lawyerId,
        deal_id: dealId,
        buyer_id: buyerId,
        type: 'document_review_request',
        title: 'New Property Document Review',
        message: `${buyerName} has assigned you to review documents for ${propertyAddress}`,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return data as LawyerNotification;
  } catch (error) {
    console.error('Error creating lawyer notification:', error);
    throw error;
  }
}

/**
 * Get notifications for a lawyer
 */
export async function getLawyerNotifications(lawyerId: string): Promise<LawyerNotification[]> {
  try {
    const { data, error } = await supabase
      .from('lawyer_notifications')
      .select('*')
      .eq('lawyer_id', lawyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as LawyerNotification[];
  } catch (error) {
    console.error('Error getting lawyer notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('lawyer_notifications')
      .update({ 
        read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count for lawyer
 */
export async function getUnreadNotificationCount(lawyerId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_lawyer_unread_notification_count', { p_lawyer_id: lawyerId });

    if (error) throw error;

    return data || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

/**
 * Check if current user is assigned lawyer for a deal
 */
export async function isUserAssignedLawyer(dealId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('is_lawyer_assigned_to_deal', { 
        p_deal_id: dealId,
        p_user_id: user.id
      });

    if (error) throw error;

    return data || false;
  } catch (error) {
    console.error('Error checking if user is assigned lawyer:', error);
    return false;
  }
}

