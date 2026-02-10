import { supabase } from '@/integrations/supabase/client';

// KYC Status Types
export type KYCStatus = 'not_verified' | 'pending' | 'verified' | 'rejected' | 'failed' | 'expired' | 'cancelled';

export interface KYCStatusResponse {
  user_id: string;
  kyc_status: KYCStatus;
  provider: string | null;
  reference_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  verification_data: any;
  rejection_reason: string | null;
  ui_status: string;
  can_retry: boolean;
  next_action: string;
}

export interface KYCStartResponse {
  success: boolean;
  provider: string;
  reference_id: string;
  verification_url?: string;
  redirect_url?: string;
  status: string;
  message: string;
}

export interface KYCUserData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  documentNumber?: string;
  fullAddress?: string;
  country?: string;
}

// KYC Service Class
export class KYCService {
  private static instance: KYCService;

  static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  // Get current KYC status for user
  async getStatus(userToken: string): Promise<KYCStatusResponse> {
    try {
      const response = await fetch('/api/kyc/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  }

  // Start KYC verification
  async startVerification(userToken: string, userData?: KYCUserData): Promise<KYCStartResponse> {
    try {
      const response = await fetch('/api/kyc/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting KYC verification:', error);
      throw error;
    }
  }

  // Check if user can start new verification
  canStartVerification(status: KYCStatus): boolean {
    return ['not_verified', 'rejected', 'failed', 'expired'].includes(status);
  }

  // Get UI-friendly status text
  getUIStatus(status: KYCStatus): string {
    switch (status) {
      case 'not_verified':
        return 'Not Verified';
      case 'pending':
        return 'Pending';
      case 'verified':
        return 'Verified';
      case 'rejected':
      case 'failed':
      case 'expired':
        return 'Action Required';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Not Verified';
    }
  }

  // Get next action button text
  getNextAction(status: KYCStatus): string {
    switch (status) {
      case 'not_verified':
        return 'Verify Now';
      case 'pending':
        return 'Continue';
      case 'rejected':
      case 'failed':
      case 'expired':
        return 'Retry';
      case 'verified':
        return 'View Details';
      case 'cancelled':
        return 'Verify Now';
      default:
        return 'Verify Now';
    }
  }

  // Get status badge color
  getStatusBadgeColor(status: KYCStatus): string {
    switch (status) {
      case 'not_verified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'failed':
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  }

  // Get status indicator color
  getStatusIndicatorColor(status: KYCStatus): string {
    switch (status) {
      case 'not_verified':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-blue-500';
      case 'verified':
        return 'bg-green-500';
      case 'rejected':
      case 'failed':
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  }

  // Format verification date
  formatVerificationDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Get verification benefits
  getVerificationBenefits(): string[] {
    return [
      'Get a "Verified" badge on your profile',
      'Increase trust with potential roommates',
      'Priority placement in search results',
      'Access to premium matching features',
    ];
  }

  // Check if verification is required for features
  isVerificationRequired(feature: string): boolean {
    const premiumFeatures = ['premium_matching', 'priority_listings', 'verified_badge'];
    return premiumFeatures.includes(feature);
  }
}

// Export singleton instance
export const kycService = KYCService.getInstance();
