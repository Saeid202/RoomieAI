import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { kycService, KYCStatusResponse, KYCStartResponse } from '@/services/kycService';

interface UseKYCVerificationReturn {
  status: KYCStatusResponse | null;
  loading: boolean;
  error: string | null;
  isStarting: boolean;
  canStartVerification: boolean;
  startVerification: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useKYCVerification(): UseKYCVerificationReturn {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<KYCStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch KYC status on component mount
  useEffect(() => {
    if (user && session) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const fetchStatus = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);
      
      const statusData = await kycService.getStatus(session.access_token);
      setStatus(statusData);
      
      // Store status in session storage for page refresh persistence
      sessionStorage.setItem('kyc_status', JSON.stringify(statusData));
      
    } catch (err: any) {
      console.error('Error fetching KYC status:', err);
      setError('Failed to load verification status');
      
      // Try to load from session storage as fallback
      const cachedStatus = sessionStorage.getItem('kyc_status');
      if (cachedStatus) {
        try {
          setStatus(JSON.parse(cachedStatus));
        } catch (parseError) {
          console.error('Error parsing cached KYC status:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const startVerification = async () => {
    if (!session || !status) return;

    try {
      setIsStarting(true);
      setError(null);

      const result = await kycService.startVerification(session.access_token);
      
      // Redirect to verification URL if provided
      if (result.verification_url) {
        window.location.href = result.verification_url;
      } else {
        // Refresh status if no redirect URL
        await fetchStatus();
      }
      
    } catch (err: any) {
      console.error('Error starting verification:', err);
      setError(err.message || 'Failed to start verification');
    } finally {
      setIsStarting(false);
    }
  };

  const refreshStatus = async () => {
    await fetchStatus();
  };

  const canStartVerification = status ? kycService.canStartVerification(status.kyc_status) : false;

  return {
    status,
    loading,
    error,
    isStarting,
    canStartVerification,
    startVerification,
    refreshStatus,
  };
}
