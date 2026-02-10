import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { kycService } from '@/services/kycService';

interface UseVerificationGateReturn {
  isVerified: boolean;
  loading: boolean;
  kycStatus: any;
  requireVerification: (feature?: string) => boolean;
  redirectToProfile: (feature?: string) => void;
}

export function useVerificationGate(): UseVerificationGateReturn {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      checkVerificationStatus();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const checkVerificationStatus = async () => {
    if (!session) return;

    try {
      setLoading(true);
      
      // Try session storage first for faster loading
      const cachedStatus = sessionStorage.getItem('kyc_status');
      if (cachedStatus) {
        const parsed = JSON.parse(cachedStatus);
        setKycStatus(parsed);
      }

      // Fetch fresh status
      const statusData = await kycService.getStatus(session.access_token);
      setKycStatus(statusData);
      
      // Update cache
      sessionStorage.setItem('kyc_status', JSON.stringify(statusData));
      
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = kycStatus?.kyc_status === 'verified';

  const requireVerification = (feature?: string): boolean => {
    if (loading) return false; // Don't block while loading
    if (!isVerified) {
      redirectToProfile(feature);
      return true; // Blocked
    }
    return false; // Not blocked
  };

  const redirectToProfile = (feature?: string) => {
    // Store the attempted action for later
    if (feature) {
      sessionStorage.setItem('verification_required_for', feature);
    }
    navigate('/dashboard/profile');
  };

  return {
    isVerified,
    loading,
    kycStatus,
    requireVerification,
    redirectToProfile,
  };
}
