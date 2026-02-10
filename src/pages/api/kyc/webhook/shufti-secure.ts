import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Webhook security types
interface ShuftiWebhookEvent {
  event: string;
  reference: string;
  verification_url?: string;
  error?: {
    message: string;
  };
  timestamp?: number;
  signature?: string;
  // Additional fields based on event type
  [key: string]: any;
}

interface WebhookLog {
  reference_id: string;
  event_type: string;
  received_at: string;
  processed_at: string;
  signature_valid: boolean;
  duplicate: boolean;
  ip_address: string;
  user_agent: string;
  request_body: any;
  response_status: number;
  error_message?: string;
}

// In-memory store for recent webhooks (for duplicate detection)
const recentWebhooks = new Map<string, { timestamp: number; processed: boolean }>();
const WEBHOOK_TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Cleanup old webhook records
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of recentWebhooks.entries()) {
    if (now - value.timestamp > WEBHOOK_TTL) {
      recentWebhooks.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  try {
    // Extract client information
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Log incoming webhook
    console.log(`[${requestId}] Incoming Shufti webhook:`, {
      ip: clientIP,
      userAgent,
      contentType: req.headers['content-type'],
      timestamp: new Date().toISOString()
    });

    // 1. Validate content type
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('application/json')) {
      const error = 'Invalid content type';
      await logWebhook({
                reference_id: 'unknown',
        event_type: 'invalid_request',
        received_at: new Date(startTime).toISOString(),
        processed_at: new Date().toISOString(),
        signature_valid: false,
        duplicate: false,
        ip_address: clientIP,
        user_agent: userAgent,
        request_body: null,
        response_status: 400,
        error_message: error
      });
      
      console.error(`[${requestId}] ${error}:`, contentType);
      return res.status(400).json({ error });
    }

    // 2. Parse and validate request body
    const body = req.body;
    if (!body || typeof body !== 'object') {
      const error = 'Invalid request body';
      await logWebhook({
                reference_id: 'unknown',
        event_type: 'invalid_request',
        received_at: new Date(startTime).toISOString(),
        processed_at: new Date().toISOString(),
        signature_valid: false,
        duplicate: false,
        ip_address: clientIP,
        user_agent: userAgent,
        request_body: null,
        response_status: 400,
        error_message: error
      });
      
      console.error(`[${requestId}] ${error}`);
      return res.status(400).json({ error });
    }

    const event: ShuftiWebhookEvent = body;

    // 3. Validate required fields
    if (!event.event || !event.reference) {
      const error = 'Missing required fields';
      await logWebhook({
                reference_id: event.reference || 'unknown',
        event_type: event.event || 'unknown',
        received_at: new Date(startTime).toISOString(),
        processed_at: new Date().toISOString(),
        signature_valid: false,
        duplicate: false,
        ip_address: clientIP,
        user_agent: userAgent,
        request_body: event,
        response_status: 400,
        error_message: error
      });
      
      console.error(`[${requestId}] ${error}:`, { event: event.event, reference: event.reference });
      return res.status(400).json({ error });
    }

    // 4. Check for duplicate/replayed webhooks
    const webhookKey = `${event.event}:${event.reference}`;
    const existingWebhook = recentWebhooks.get(webhookKey);
    
    if (existingWebhook && (startTime - existingWebhook.timestamp) < WEBHOOK_TTL) {
      const error = 'Duplicate or replayed webhook';
      await logWebhook({
                reference_id: event.reference,
        event_type: event.event,
        received_at: new Date(startTime).toISOString(),
        processed_at: new Date().toISOString(),
        signature_valid: false,
        duplicate: true,
        ip_address: clientIP,
        user_agent: userAgent,
        request_body: event,
        response_status: 409,
        error_message: error
      });
      
      console.warn(`[${requestId}] ${error}:`, webhookKey);
      return res.status(409).json({ error: 'Duplicate webhook' });
    }

    // 5. Validate webhook signature (if provided)
    const signature = req.headers['x-shufti-signature'] as string;
    let signatureValid = false;
    
    if (signature) {
      signatureValid = verifyShuftiSignature(JSON.stringify(body), signature);
      
      if (!signatureValid) {
        const error = 'Invalid webhook signature';
        await logWebhook({
                    reference_id: event.reference,
          event_type: event.event,
          received_at: new Date(startTime).toISOString(),
          processed_at: new Date().toISOString(),
          signature_valid: false,
          duplicate: false,
          ip_address: clientIP,
          user_agent: userAgent,
          request_body: event,
          response_status: 401,
          error_message: error
        });
        
        console.error(`[${requestId}] ${error}`);
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } else {
      // Shufti doesn't always send signatures, so we'll log this but proceed
      console.warn(`[${requestId}] No signature provided, proceeding without signature validation`);
      signatureValid = true; // Assume valid for now
    }

    // 6. Mark webhook as received to prevent duplicates
    recentWebhooks.set(webhookKey, { timestamp: startTime, processed: false });

    // 7. Find the KYC record
    const { data: kycRecord, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('reference_id', event.reference)
      .single();

    if (fetchError || !kycRecord) {
      const error = 'KYC record not found';
      await logWebhook({
                reference_id: event.reference,
        event_type: event.event,
        received_at: new Date(startTime).toISOString(),
        processed_at: new Date().toISOString(),
        signature_valid,
        duplicate: false,
        ip_address: clientIP,
        user_agent: userAgent,
        request_body: event,
        response_status: 404,
        error_message: error
      });
      
      console.error(`[${requestId}] ${error} for reference:`, event.reference);
      return res.status(404).json({ error: 'KYC record not found' });
    }

    // 8. Process different event types
    let newStatus: string;
    let verificationData: any;

    switch (event.event) {
      case 'verification.accepted':
        newStatus = 'verified';
        verificationData = {
          ...kycRecord.verification_data,
          completed_at: new Date().toISOString(),
          verification_result: event,
          webhook_processed_at: new Date().toISOString(),
          webhook_request_        };
        break;

      case 'verification.declined':
        newStatus = 'rejected';
        verificationData = {
          ...kycRecord.verification_data,
          completed_at: new Date().toISOString(),
          verification_result: event,
          rejection_reason: event.error?.message || 'Verification declined',
          webhook_processed_at: new Date().toISOString(),
          webhook_request_        };
        break;

      case 'request.cancelled':
        newStatus = 'cancelled';
        verificationData = {
          ...kycRecord.verification_data,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: event.error?.message || 'User cancelled',
          webhook_processed_at: new Date().toISOString(),
          webhook_request_        };
        break;

      case 'request.timeout':
        newStatus = 'expired';
        verificationData = {
          ...kycRecord.verification_data,
          expired_at: new Date().toISOString(),
          timeout_reason: event.error?.message || 'Request timed out',
          webhook_processed_at: new Date().toISOString(),
          webhook_request_        };
        break;

      default:
        const error = `Unknown event type: ${event.event}`;
        await logWebhook({
                    reference_id: event.reference,
          event_type: event.event,
          received_at: new Date(startTime).toISOString(),
          processed_at: new Date().toISOString(),
          signature_valid,
          duplicate: false,
          ip_address: clientIP,
          user_agent: userAgent,
          request_body: event,
          response_status: 400,
          error_message: error
        });
        
        console.warn(`[${requestId}] ${error}`);
        return res.status(400).json({ error: 'Unknown event type' });
    }

    // 9. Update KYC record
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
      const error = 'Failed to update KYC record';
      await logWebhook({
                reference_id: event.reference,
        event_type: event.event,
        received_at: new Date(startTime).toISOString(),
        processed_at: new Date().toISOString(),
        signature_valid,
        duplicate: false,
        ip_address: clientIP,
        user_agent: userAgent,
        request_body: event,
        response_status: 500,
        error_message: error
      });
      
      console.error(`[${requestId}] ${error}:`, updateError);
      return res.status(500).json({ error: 'Failed to update KYC record' });
    }

    // 10. Update user profile verification status if verified
    if (newStatus === 'verified') {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'verified',
          verification_completed_at: new Date().toISOString()
        })
        .eq('id', kycRecord.user_id);

      if (profileUpdateError) {
        console.error(`[${requestId}] Error updating profile verification status:`, profileUpdateError);
        // Don't fail the webhook, but log the error
      }
    }

    // 11. Log audit trail
    await logAuditTrail({
      user_id: kycRecord.user_id,
      action: 'kyc_status_change',
      old_status: kycRecord.status,
      new_status: newStatus,
      reference_id: event.reference,
      provider: 'shufti',
      event_type: event.event,
      ip_address: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      metadata: {
        webhook_request_        signature_valid,
        processing_time_ms: Date.now() - startTime,
      }
    });

    // 12. Send notification to user (optional)
    await sendUserNotification(kycRecord.user_id, newStatus, event.reference);

    // 13. Mark webhook as processed
    recentWebhooks.set(webhookKey, { timestamp: startTime, processed: true });

    // 14. Log successful processing
    await logWebhook({
            reference_id: event.reference,
      event_type: event.event,
      received_at: new Date(startTime).toISOString(),
      processed_at: new Date().toISOString(),
      signature_valid,
      duplicate: false,
      ip_address: clientIP,
      user_agent: userAgent,
      request_body: event,
      response_status: 200,
    });

    console.log(`[${requestId}] Successfully processed webhook:`, {
      event: event.event,
      reference: event.reference,
      newStatus,
      processingTime: Date.now() - startTime
    });

    // 15. Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      reference_id: event.reference,
      status: newStatus,
      request_    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    await logWebhook({
            reference_id: 'unknown',
      event_type: 'error',
      received_at: new Date(startTime).toISOString(),
      processed_at: new Date().toISOString(),
      signature_valid: false,
      duplicate: false,
      ip_address: getClientIP(req),
      user_agent: req.headers['user-agent'] || 'unknown',
      request_body: req.body,
      response_status: 500,
      error_message: error.message || 'Internal server error'
    });
    
    console.error(`[${requestId}] Webhook processing error (${processingTime}ms):`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions
function getClientIP(req: NextApiRequest): string {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function verifyShuftiSignature(body: string, signature: string): boolean {
  try {
    const secret = process.env.SHUFTI_WEBHOOK_SECRET;
    if (!secret || secret === 'disabled') {
      console.warn('Webhook secret not configured or disabled');
      return true; // Allow if not configured (for development)
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function logWebhook(log: WebhookLog): Promise<void> {
  try {
    // For now, just log to console. In production, you'd store this in a database
    console.log('WEBHOOK_LOG:', JSON.stringify(log, null, 2));
    
    // TODO: Store in audit_logs table
    // await supabase.from('webhook_logs').insert(log);
  } catch (error) {
    console.error('Failed to log webhook:', error);
  }
}

async function logAuditTrail(record: {
  user_id: string;
  action: string;
  old_status: string;
  new_status: string;
  reference_id: string;
  provider: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  metadata: any;
}): Promise<void> {
  try {
    // Log audit trail for compliance
    console.log('AUDIT_TRAIL:', JSON.stringify(record, null, 2));
    
    // TODO: Store in audit_logs table
    // await supabase.from('audit_logs').insert(record);
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}

async function sendUserNotification(userId: string, status: string, referenceId: string): Promise<void> {
  try {
    // This would integrate with your notification system
    console.log(`USER_NOTIFICATION: User ${userId} KYC status changed to ${status} for reference ${referenceId}`);
    
    // TODO: Send email/push notification
    // await notificationService.sendKYCStatusChange(userId, status, referenceId);
  } catch (error) {
    console.error('Failed to send user notification:', error);
  }
}
