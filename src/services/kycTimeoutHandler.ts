import { createClient } from '@supabase/supabase-js';
import { KYC_CONFIG, KYC_STATUS } from './kycConfig';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class KYCTimeoutHandler {
  private static instance: KYCTimeoutHandler;
  private timeoutInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): KYCTimeoutHandler {
    if (!KYCTimeoutHandler.instance) {
      KYCTimeoutHandler.instance = new KYCTimeoutHandler();
    }
    return KYCTimeoutHandler.instance;
  }

  startTimeoutMonitoring(): void {
    // Clear any existing interval
    if (this.timeoutInterval) {
      clearInterval(this.timeoutInterval);
    }

    // Check for expired verifications every 5 minutes
    this.timeoutInterval = setInterval(() => {
      this.checkAndExpireVerifications();
    }, 5 * 60 * 1000);

    console.log('KYC timeout monitoring started');
  }

  stopTimeoutMonitoring(): void {
    if (this.timeoutInterval) {
      clearInterval(this.timeoutInterval);
      this.timeoutInterval = null;
      console.log('KYC timeout monitoring stopped');
    }
  }

  private async checkAndExpireVerifications(): Promise<void> {
    try {
      console.log('Checking for expired KYC verifications...');
      
      // Find pending verifications that should be expired
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() - KYC_CONFIG.PENDING_EXPIRATION_MINUTES);

      const { data: expiredVerifications, error: fetchError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('status', KYC_STATUS.PENDING)
        .lt('created_at', expiryTime.toISOString());

      if (fetchError) {
        console.error('Error fetching expired verifications:', fetchError);
        return;
      }

      if (!expiredVerifications || expiredVerifications.length === 0) {
        console.log('No expired verifications found');
        return;
      }

      console.log(`Found ${expiredVerifications.length} expired verifications`);

      // Update each expired verification
      for (const verification of expiredVerifications) {
        await this.expireVerification(verification);
      }

    } catch (error) {
      console.error('Error in timeout monitoring:', error);
    }
  }

  private async expireVerification(verification: any): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Update KYC record
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: KYC_STATUS.EXPIRED,
          verification_data: {
            ...verification.verification_data,
            expired_at: now,
            expiration_reason: 'Verification timeout after ' + KYC_CONFIG.PENDING_EXPIRATION_MINUTES + ' minutes',
            auto_expired: true,
          },
          updated_at: now,
        })
        .eq('id', verification.id);

      if (updateError) {
        console.error(`Error expiring verification ${verification.id}:`, updateError);
        return;
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: KYC_STATUS.EXPIRED,
          verification_completed_at: now,
        })
        .eq('id', verification.user_id);

      if (profileError) {
        console.error(`Error updating profile for expired verification ${verification.id}:`, profileError);
        // Don't return - we still want to log the audit trail
      }

      // Log audit trail
      await this.logAuditTrail({
        user_id: verification.user_id,
        action: 'kyc_auto_expire',
        old_status: KYC_STATUS.PENDING,
        new_status: KYC_STATUS.EXPIRED,
        reference_id: verification.reference_id,
        provider: verification.provider,
        event_type: 'auto_expire',
        ip_address: 'system',
        user_agent: 'timeout-handler',
        timestamp: now,
        metadata: {
          original_created_at: verification.created_at,
          timeout_duration_minutes: KYC_CONFIG.PENDING_EXPIRATION_MINUTES,
          verification_id: verification.id,
        }
      });

      // Send notification to user
      await this.sendExpirationNotification(verification.user_id, verification.reference_id);

      console.log(`Successfully expired verification ${verification.id} for user ${verification.user_id}`);

    } catch (error) {
      console.error(`Error expiring verification ${verification.id}:`, error);
    }
  }

  private async logAuditTrail(record: {
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
      console.log('AUDIT_TRAIL:', JSON.stringify(record, null, 2));
      
      // TODO: Store in audit_logs table
      // await supabase.from('audit_logs').insert(record);
    } catch (error) {
      console.error('Failed to log audit trail:', error);
    }
  }

  private async sendExpirationNotification(userId: string, referenceId: string): Promise<void> {
    try {
      console.log(`EXPIRATION_NOTIFICATION: User ${userId} verification expired for reference ${referenceId}`);
      
      // TODO: Send email/push notification
      // await notificationService.sendVerificationExpired(userId, referenceId);
    } catch (error) {
      console.error('Failed to send expiration notification:', error);
    }
  }

  // Manual check for a specific verification
  async checkVerificationExpiration(verificationId: string): Promise<boolean> {
    try {
      const { data: verification, error: fetchError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('id', verificationId)
        .single();

      if (fetchError || !verification) {
        console.error('Error fetching verification:', fetchError);
        return false;
      }

      if (verification.status !== KYC_STATUS.PENDING) {
        return false; // Not pending, no need to check
      }

      const createdTime = new Date(verification.created_at);
      const expiryTime = new Date(createdTime.getTime() + (KYC_CONFIG.PENDING_EXPIRATION_MINUTES * 60 * 1000));
      const now = new Date();

      if (now > expiryTime) {
        await this.expireVerification(verification);
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error checking verification expiration:', error);
      return false;
    }
  }
}

// Singleton instance
export const kycTimeoutHandler = KYCTimeoutHandler.getInstance();
