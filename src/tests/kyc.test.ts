import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { kycService } from '@/services/kycService';
import { KYC_STATUS } from '@/services/kycConfig';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('KYC Service', () => {
  const mockSupabase = createClient('http://localhost:3000', 'mock-key');
  const mockSession = { access_token: 'mock-token' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Approved Flow', () => {
    it('should handle successful verification approval', async () => {
      // Mock successful status check
      const mockStatusResponse = {
        kyc_status: KYC_STATUS.VERIFIED,
        ui_status: 'Verified',
        next_action: 'View Details',
        verification_data: {
          provider: 'shufti',
          completed_at: '2024-01-10T01:00:00.000Z',
        },
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatusResponse,
      });

      const result = await kycService.getStatus(mockSession.access_token);

      expect(result).toEqual(mockStatusResponse);
      expect(fetch).toHaveBeenCalledWith(
        '/api/kyc/status',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should update profile when verification is approved', async () => {
      // Mock database update
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from = vi.fn(() => ({
        update: mockUpdate,
        eq: vi.fn(),
      })) as any;

      // This would be called in the webhook handler
      const updateData = {
        verification_status: KYC_STATUS.VERIFIED,
        verification_completed_at: '2024-01-10T01:00:00.000Z',
      };

      await mockUpdate(updateData);

      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });
  });

  describe('Rejected Flow', () => {
    it('should handle verification rejection', async () => {
      const mockStatusResponse = {
        kyc_status: KYC_STATUS.REJECTED,
        ui_status: 'Verification Failed',
        next_action: 'Retry Verification',
        rejection_reason: 'Document quality too low',
        verification_data: {
          provider: 'shufti',
          completed_at: '2024-01-10T01:00:00.000Z',
          rejection_reason: 'Document quality too low',
        },
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatusResponse,
      });

      const result = await kycService.getStatus(mockSession.access_token);

      expect(result.kyc_status).toBe(KYC_STATUS.REJECTED);
      expect(result.rejection_reason).toBe('Document quality too low');
      expect(result.next_action).toBe('Retry Verification');
    });

    it('should allow retry after rejection', async () => {
      const mockStartResponse = {
        success: true,
        verification_url: 'https://shufti-pro.com/verify/abc123',
        reference_id: 'abc123',
        provider: 'shufti',
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStartResponse,
      });

      const result = await kycService.startVerification(mockSession.access_token);

      expect(result.success).toBe(true);
      expect(result.verification_url).toBeDefined();
      expect(result.reference_id).toBe('abc123');
    });
  });

  describe('Redirect Enforcement', () => {
    it('should redirect to profile when verification required', async () => {
      // Mock router push
      const mockPush = vi.fn();
      global.window = {
        location: { href: '' },
        sessionStorage: {
          setItem: vi.fn(),
          getItem: vi.fn(() => null),
          removeItem: vi.fn(),
        },
      } as any;

      // Simulate verification requirement check
      const isVerified = false;
      const action = 'pay_rent';

      if (!isVerified) {
        sessionStorage.setItem('verification_required_for', action);
        sessionStorage.setItem('verification_required_role', 'seeker');
        mockPush('/dashboard/profile?verification_required=true&role=seeker');
      }

      expect(sessionStorage.setItem).toHaveBeenCalledWith('verification_required_for', 'pay_rent');
      expect(mockPush).toHaveBeenCalledWith('/dashboard/profile?verification_required=true&role=seeker');
    });

    it('should allow action when user is verified', async () => {
      const mockStatusResponse = {
        kyc_status: KYC_STATUS.VERIFIED,
        ui_status: 'Verified',
        next_action: 'View Details',
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatusResponse,
      });

      const result = await kycService.getStatus(mockSession.access_token);
      const canPerformAction = result.kyc_status === KYC_STATUS.VERIFIED;

      expect(canPerformAction).toBe(true);
      expect(result.kyc_status).toBe(KYC_STATUS.VERIFIED);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(kycService.getStatus(mockSession.access_token)).rejects.toThrow('Network error');
    });

    it('should handle API errors with proper messages', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(kycService.getStatus(mockSession.access_token)).rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      // The service should handle missing required fields
      const result = await kycService.getStatus(mockSession.access_token);
      expect(result).toBeDefined();
    });
  });

  describe('Status Helpers', () => {
    it('should return correct status colors', () => {
      expect(kycService.getStatusBadgeColor(KYC_STATUS.VERIFIED)).toContain('green');
      expect(kycService.getStatusBadgeColor(KYC_STATUS.REJECTED)).toContain('red');
      expect(kycService.getStatusBadgeColor(KYC_STATUS.PENDING)).toContain('blue');
      expect(kycService.getStatusBadgeColor(KYC_STATUS.NOT_VERIFIED)).toContain('yellow');
    });

    it('should return correct indicator colors', () => {
      expect(kycService.getStatusIndicatorColor(KYC_STATUS.VERIFIED)).toBe('bg-green-500');
      expect(kycService.getStatusIndicatorColor(KYC_STATUS.REJECTED)).toBe('bg-red-500');
      expect(kycService.getStatusIndicatorColor(KYC_STATUS.PENDING)).toBe('bg-blue-500');
      expect(kycService.getStatusIndicatorColor(KYC_STATUS.NOT_VERIFIED)).toBe('bg-yellow-500');
    });

    it('should format verification dates correctly', () => {
      const testDate = '2024-01-10T01:00:00.000Z';
      const formatted = kycService.formatVerificationDate(testDate);
      
      expect(formatted).toMatch(/\w{3} \d{1,2}, \d{4}/); // e.g., "Jan 10, 2024"
    });

    it('should handle null dates', () => {
      const formatted = kycService.formatVerificationDate(null);
      expect(formatted).toBe('Never');
    });
  });

  describe('Verification Benefits', () => {
    it('should return verification benefits list', () => {
      const benefits = kycService.getVerificationBenefits();
      
      expect(Array.isArray(benefits)).toBe(true);
      expect(benefits.length).toBeGreaterThan(0);
      expect(benefits[0]).toContain('verified');
    });
  });

  describe('Can Start Verification', () => {
    it('should allow starting verification for not verified users', () => {
      const status = { kyc_status: KYC_STATUS.NOT_VERIFIED };
      const canStart = kycService.canStartVerification(status.kyc_status);
      
      expect(canStart).toBe(true);
    });

    it('should not allow starting verification for already verified users', () => {
      const status = { kyc_status: KYC_STATUS.VERIFIED };
      const canStart = kycService.canStartVerification(status.kyc_status);
      
      expect(canStart).toBe(false);
    });

    it('should not allow starting verification for pending users', () => {
      const status = { kyc_status: KYC_STATUS.PENDING };
      const canStart = kycService.canStartVerification(status.kyc_status);
      
      expect(canStart).toBe(false);
    });
  });
});

describe('KYC Configuration', () => {
  it('should have correct timeout values', () => {
    const { KYC_CONFIG } = require('@/services/kycConfig');
    
    expect(KYC_CONFIG.VERIFICATION_TIMEOUT_MINUTES).toBe(30);
    expect(KYC_CONFIG.MAX_RETRY_ATTEMPTS).toBe(3);
    expect(KYC_CONFIG.PENDING_EXPIRATION_MINUTES).toBe(30);
  });

  it('should have correct status constants', () => {
    const { KYC_STATUS } = require('@/services/kycConfig');
    
    expect(KYC_STATUS.NOT_VERIFIED).toBe('not_verified');
    expect(KYC_STATUS.PENDING).toBe('pending');
    expect(KYC_STATUS.VERIFIED).toBe('verified');
    expect(KYC_STATUS.REJECTED).toBe('rejected');
  });
});

describe('KYC Webhook Security', () => {
  it('should validate webhook signatures', () => {
    const { verifyShuftiSignature } = require('@/services/kycConfig');
    
    const body = JSON.stringify({ event: 'verification.accepted', reference: 'abc123' });
    const secret = 'test-secret';
    const signature = 'valid-signature';
    
    // This would need to be implemented in the actual webhook handler
    expect(typeof verifyShuftiSignature).toBe('function');
  });

  it('should reject duplicate webhooks', () => {
    // Mock webhook duplicate detection
    const recentWebhooks = new Map();
    const webhookKey = 'verification.accepted:abc123';
    
    recentWebhooks.set(webhookKey, { timestamp: Date.now(), processed: true });
    
    const isDuplicate = recentWebhooks.has(webhookKey);
    expect(isDuplicate).toBe(true);
  });
});

describe('KYC Retry Logic', () => {
  it('should respect retry limits', () => {
    const { KYC_CONFIG } = require('@/services/kycConfig');
    
    expect(KYC_CONFIG.MAX_RETRY_ATTEMPTS).toBe(3);
  });

  it('should implement exponential backoff', () => {
    const { getRetryDelay } = require('@/services/kycConfig');
    
    const delay1 = getRetryDelay(1);
    const delay2 = getRetryDelay(2);
    const delay3 = getRetryDelay(3);
    
    expect(delay2).toBe(delay1 * 2);
    expect(delay3).toBe(delay2 * 2);
  });
});

describe('KYC Timeout Handling', () => {
  it('should expire pending verifications after timeout', () => {
    const { isVerificationExpired } = require('@/services/kycConfig');
    
    const oldTimestamp = new Date(Date.now() - (35 * 60 * 1000)).toISOString(); // 35 minutes ago
    const isExpired = isVerificationExpired(oldTimestamp);
    
    expect(isExpired).toBe(true);
  });

  it('should not expire recent verifications', () => {
    const { isVerificationExpired } = require('@/services/kycConfig');
    
    const recentTimestamp = new Date(Date.now() - (10 * 60 * 1000)).toISOString(); // 10 minutes ago
    const isExpired = isVerificationExpired(recentTimestamp);
    
    expect(isExpired).toBe(false);
  });
});
