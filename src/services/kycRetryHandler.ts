import { createClient } from '@supabase/supabase-js';
import { KYC_CONFIG, KYC_STATUS, RETRY_STATUS } from './kycConfig';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RetryAttempt {
  id: string;
  verification_id: string;
  attempt_number: number;
  attempted_at: string;
  error_message?: string;
  error_type?: string;
  provider_response?: any;
  next_retry_at?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface RetryResult {
  success: boolean;
  canRetry: boolean;
  retryStatus: string;
  delayMs?: number;
  nextRetryAt?: string;
  error?: string;
  attemptCount?: number;
}

export class KYCRetryHandler {
  private static instance: KYCRetryHandler;

  private constructor() {}

  static getInstance(): KYCRetryHandler {
    if (!KYCRetryHandler.instance) {
      KYCRetryHandler.instance = new KYCRetryHandler();
    }
    return KYCRetryHandler.instance;
  }

  async canRetryVerification(verificationId: string): Promise<RetryResult> {
    try {
      // Get verification details
      const { data: verification, error: fetchError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('id', verificationId)
        .single();

      if (fetchError || !verification) {
        return {
          success: false,
          canRetry: false,
          retryStatus: RETRY_STATUS.BLOCKED,
          error: 'Verification not found',
        };
      }

      // Check if status allows retry
      if (!this.isRetryableStatus(verification.status)) {
        return {
          success: true,
          canRetry: false,
          retryStatus: RETRY_STATUS.BLOCKED,
          error: `Cannot retry verification with status: ${verification.status}`,
          attemptCount: verification.retry_count || 0,
        };
      }

      // Check retry count limit
      const retryCount = verification.retry_count || 0;
      if (retryCount >= KYC_CONFIG.MAX_RETRY_ATTEMPTS) {
        return {
          success: true,
          canRetry: false,
          retryStatus: RETRY_STATUS.EXHAUSTED,
          error: 'Maximum retry attempts exhausted',
          attemptCount: retryCount,
        };
      }

      // Check retry cooldown
      const lastRetryTime = verification.last_retry_at;
      if (lastRetryTime) {
        const now = new Date();
        const lastRetry = new Date(lastRetryTime);
        const cooldownEnd = new Date(lastRetry.getTime() + (KYC_CONFIG.FAILED_RETRY_COOLDOWN_MINUTES * 60 * 1000));
        
        if (now < cooldownEnd) {
          const delayMs = cooldownEnd.getTime() - now.getTime();
          return {
            success: true,
            canRetry: false,
            retryStatus: RETRY_STATUS.BLOCKED,
            delayMs,
            nextRetryAt: cooldownEnd.toISOString(),
            error: 'Retry cooldown active',
            attemptCount: retryCount,
          };
        }
      }

      // Check rate limiting
      const lastRequestTime = verification.created_at;
      if (this.shouldRateLimit(lastRequestTime)) {
        return {
          success: true,
          canRetry: false,
          retryStatus: RETRY_STATUS.BLOCKED,
          error: 'Rate limited',
          attemptCount: retryCount,
        };
      }

      return {
        success: true,
        canRetry: true,
        retryStatus: RETRY_STATUS.CAN_RETRY,
        attemptCount: retryCount,
      };

    } catch (error: any) {
      return {
        success: false,
        canRetry: false,
        retryStatus: RETRY_STATUS.BLOCKED,
        error: error.message || 'Failed to check retry eligibility',
      };
    }
  }

  async recordRetryAttempt(
    verificationId: string, 
    error?: string, 
    errorType?: string, 
    providerResponse?: any
  ): Promise<RetryResult> {
    try {
      const now = new Date();
      const retryId = crypto.randomUUID();

      // Get current verification
      const { data: verification, error: fetchError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('id', verificationId)
        .single();

      if (fetchError || !verification) {
        return {
          success: false,
          canRetry: false,
          retryStatus: RETRY_STATUS.BLOCKED,
          error: 'Verification not found',
        };
      }

      const retryCount = (verification.retry_count || 0) + 1;

      // Record retry attempt
      const retryRecord: Partial<RetryAttempt> = {
        id: retryId,
        verification_id: verificationId,
        attempt_number: retryCount,
        attempted_at: now.toISOString(),
        error_message: error,
        error_type: errorType,
        provider_response: providerResponse,
        status: 'failed',
      };

      const { error: retryError } = await supabase
        .from('kyc_retry_attempts')
        .insert(retryRecord);

      if (retryError) {
        console.error('Error recording retry attempt:', retryError);
        // Continue anyway - this is not critical
      }

      // Update verification record
      const updateData = {
        retry_count: retryCount,
        last_retry_at: now.toISOString(),
        last_error: error,
        last_error_type: errorType,
        updated_at: now.toISOString(),
        verification_data: {
          ...verification.verification_data,
          retry_attempts: [
            ...(verification.verification_data?.retry_attempts || []),
            {
              attempt_number: retryCount,
              attempted_at: now.toISOString(),
              error_message: error,
              error_type: errorType,
              provider_response: providerResponse,
            }
          ],
        },
      };

      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('id', verificationId);

      if (updateError) {
        return {
          success: false,
          canRetry: false,
          retryStatus: RETRY_STATUS.BLOCKED,
          error: 'Failed to update verification record',
        };
      }

      // Log audit trail
      await this.logAuditTrail({
        user_id: verification.user_id,
        action: 'kyc_retry_attempt',
        old_status: verification.status,
        new_status: verification.status,
        reference_id: verification.reference_id,
        provider: verification.provider,
        event_type: 'retry_attempt',
        ip_address: 'system',
        user_agent: 'retry-handler',
        timestamp: now.toISOString(),
        metadata: {
          retry_attempt_number: retryCount,
          error_message: error,
          error_type: errorType,
          verification_id: verificationId,
        }
      });

      // Check if more retries are available
      const canRetryMore = retryCount < KYC_CONFIG.MAX_RETRY_ATTEMPTS;
      const delayMs = this.getRetryDelay(retryCount);

      return {
        success: true,
        canRetry: canRetryMore,
        retryStatus: canRetryMore ? RETRY_STATUS.CAN_RETRY : RETRY_STATUS.EXHAUSTED,
        delayMs,
        attemptCount: retryCount,
      };

    } catch (error: any) {
      return {
        success: false,
        canRetry: false,
        retryStatus: RETRY_STATUS.BLOCKED,
        error: error.message || 'Failed to record retry attempt',
      };
    }
  }

  async getRetryHistory(verificationId: string): Promise<RetryAttempt[]> {
    try {
      const { data: attempts, error } = await supabase
        .from('kyc_retry_attempts')
        .select('*')
        .eq('verification_id', verificationId)
        .order('attempted_at', { ascending: false });

      if (error) {
        console.error('Error fetching retry history:', error);
        return [];
      }

      return attempts || [];

    } catch (error) {
      console.error('Error getting retry history:', error);
      return [];
    }
  }

  private isRetryableStatus(status: string): boolean {
    const retryableStatuses = [KYC_STATUS.FAILED, KYC_STATUS.REJECTED, KYC_STATUS.EXPIRED];
    return retryableStatuses.includes(status as any);
  }

  private shouldRateLimit(lastRequestTime?: string): boolean {
    if (!lastRequestTime) return false;
    
    const now = new Date();
    const lastRequest = new Date(lastRequestTime);
    const requestWindow = KYC_CONFIG.MAX_VERIFICATION_REQUESTS_PER_HOUR * 60 * 60 * 1000;
    const nextAllowedTime = new Date(lastRequest.getTime() + requestWindow);
    
    return now < nextAllowedTime;
  }

  private getRetryDelay(retryCount: number): number {
    return KYC_CONFIG.RETRY_DELAY_MS * Math.pow(KYC_CONFIG.RETRY_BACKOFF_MULTIPLIER, retryCount - 1);
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
}

// Singleton instance
export const kycRetryHandler = KYCRetryHandler.getInstance();
