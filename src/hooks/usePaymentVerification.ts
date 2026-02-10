import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { kycService } from '@/services/kycService';

export function usePaymentVerification() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, [user, session]);

  const checkVerificationStatus = async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try session storage first for faster loading
      const cachedStatus = sessionStorage.getItem('kyc_status');
      if (cachedStatus) {
        const parsed = JSON.parse(cachedStatus);
        setIsVerified(parsed.kyc_status === 'verified');
      }

      // Fetch fresh status
      const statusData = await kycService.getStatus(session.access_token);
      setIsVerified(statusData.kyc_status === 'verified');
      
      // Update cache
      sessionStorage.setItem('kyc_status', JSON.stringify(statusData));
      
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const requireVerification = (action: string = 'Rent payment') => {
    if (loading) return false; // Don't block while loading
    
    if (!isVerified) {
      // Store the attempted action for later
      sessionStorage.setItem('verification_required_for', action);
      
      // Redirect to profile with verification message
      navigate('/dashboard/profile?verification_required=true');
      return true; // Blocked
    }
    
    return false; // Not blocked
  };

  return {
    isVerified,
    loading,
    requireVerification,
  };
}
