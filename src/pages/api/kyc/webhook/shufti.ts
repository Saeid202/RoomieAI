import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Shufti webhook event types
interface ShuftiWebhookEvent {
  event: string;
  reference: string;
  verification_url?: string;
  error?: {
    message: string;
  };
  // Additional fields based on event type
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Shufti doesn't use webhook secrets, they use IP whitelisting
    // For additional security, we can check the content type and basic structure
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Basic request validation
    const body = req.body;
    if (!body || typeof body !== 'object') {
      console.error('Invalid request body');
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const event: ShuftiWebhookEvent = body;
    console.log('Shufti webhook received:', event);

    // Validate required fields
    if (!event.event || !event.reference) {
      console.error('Missing required fields:', { event: event.event, reference: event.reference });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the KYC record by reference ID
    const { data: kycRecord, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('reference_id', event.reference)
      .single();

    if (fetchError || !kycRecord) {
      console.error('KYC record not found for reference:', event.reference);
      return res.status(404).json({ error: 'KYC record not found' });
    }

    // Process different event types
    let newStatus: string;
    let verificationData: any;

    switch (event.event) {
      case 'verification.accepted':
        newStatus = 'verified';
        verificationData = {
          ...kycRecord.verification_data,
          completed_at: new Date().toISOString(),
          verification_result: event,
        };
        break;

      case 'verification.declined':
        newStatus = 'rejected';
        verificationData = {
          ...kycRecord.verification_data,
          completed_at: new Date().toISOString(),
          verification_result: event,
          rejection_reason: event.error?.message || 'Verification declined',
        };
        break;

      case 'request.cancelled':
        newStatus = 'cancelled';
        verificationData = {
          ...kycRecord.verification_data,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: event.error?.message || 'User cancelled',
        };
        break;

      case 'request.timeout':
        newStatus = 'expired';
        verificationData = {
          ...kycRecord.verification_data,
          expired_at: new Date().toISOString(),
          timeout_reason: event.error?.message || 'Request timed out',
        };
        break;

      default:
        console.warn('Unknown Shufti event type:', event.event);
        return res.status(400).json({ error: 'Unknown event type' });
    }

    // Update KYC record
    const updateData = {
      status: newStatus,
      verification_data: verificationData,
      updated_at: new Date().toISOString(),
      rejection_reason: verificationData.rejection_reason || null,
    };

    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycRecord.id);

    if (updateError) {
      console.error('Error updating KYC record:', updateError);
      return res.status(500).json({ error: 'Failed to update KYC record' });
    }

    // Update user profile verification status if verified
    if (newStatus === 'verified') {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'verified',
          verification_completed_at: new Date().toISOString()
        })
        .eq('id', kycRecord.user_id);

      if (profileUpdateError) {
        console.error('Error updating profile verification status:', profileUpdateError);
        // Don't fail the webhook, but log the error
      }
    }

    // Send notification to user (optional)
    await sendUserNotification(kycRecord.user_id, newStatus, event.reference);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      reference_id: event.reference,
      status: newStatus,
    });

  } catch (error) {
    console.error('Shufti webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Send notification to user about verification status change
async function sendUserNotification(userId: string, status: string, referenceId: string) {
  try {
    // This would integrate with your notification system
    // For now, we'll just log it
    console.log(`User ${userId} KYC status changed to ${status} for reference ${referenceId}`);

    // Example notification implementation:
    const notificationData = {
      user_id: userId,
      type: 'kyc_status_change',
      title: getNotificationTitle(status),
      message: getNotificationMessage(status),
      data: {
        kyc_status: status,
        reference_id: referenceId,
      },
      created_at: new Date().toISOString(),
    };

    // Save notification to database (if you have a notifications table)
    // await supabase.from('notifications').insert(notificationData);

  } catch (error) {
    console.error('Error sending user notification:', error);
  }
}

function getNotificationTitle(status: string): string {
  switch (status) {
    case 'verified':
      return 'Identity Verified! 🎉';
    case 'rejected':
      return 'Verification Failed';
    case 'cancelled':
      return 'Verification Cancelled';
    case 'expired':
      return 'Verification Expired';
    default:
      return 'Verification Status Updated';
  }
}

function getNotificationMessage(status: string): string {
  switch (status) {
    case 'verified':
      return 'Your identity has been successfully verified. You now have access to premium features!';
    case 'rejected':
      return 'Your verification was declined. Please check your documents and try again.';
    case 'cancelled':
      return 'Your verification process was cancelled. You can start a new verification anytime.';
    case 'expired':
      return 'Your verification session has expired. Please start a new verification.';
    default:
      return 'Your verification status has been updated.';
  }
}
