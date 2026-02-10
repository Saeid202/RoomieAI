import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { kycService } from '@/services/kycService';

interface UseRoleBasedVerificationReturn {
  isVerified: boolean;
  loading: boolean;
  kycStatus: any;
  requireVerification: (action: string, userRole?: UserRole) => boolean;
  canPerformAction: (action: string, userRole?: UserRole) => boolean;
  getRequiredActions: (userRole?: UserRole) => string[];
}

export function useRoleBasedVerification(): UseRoleBasedVerificationReturn {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { role } = useRole();
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
      setKycStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = kycStatus?.kyc_status === 'verified';

  // Role-based verification requirements
  const getVerificationRequirements = (userRole?: UserRole): Record<string, boolean> => {
    const currentRole = userRole || role;
    
    switch (currentRole) {
      case 'seeker':
        return {
          'pay_rent': true,           // Required before first rent payment
          'credit_reporting': true,   // Required for credit reporting
          'publish_listing': false,   // Not applicable to seekers
          'receive_payout': false,   // Not applicable to seekers
        };
      
      case 'landlord':
        return {
          'pay_rent': false,          // Not applicable to landlords
          'credit_reporting': false,  // Not applicable to landlords
          'publish_listing': true,    // Required before publishing a listing
          'receive_payout': true,     // Required before receiving payouts
        };
      
      default:
        return {
          'pay_rent': false,
          'credit_reporting': false,
          'publish_listing': false,
          'receive_payout': false,
        };
    }
  };

  const requireVerification = (action: string, userRole?: UserRole): boolean => {
    if (loading) return false; // Don't block while loading
    
    const requirements = getVerificationRequirements(userRole);
    const actionRequired = requirements[action] || false;
    
    if (actionRequired && !isVerified) {
      // Store the attempted action for later
      sessionStorage.setItem('verification_required_for', action);
      sessionStorage.setItem('verification_required_role', userRole || role || 'unknown');
      
      // Redirect to profile with verification message
      navigate('/dashboard/profile?verification_required=true&role=' + (userRole || role || 'unknown'));
      return true; // Blocked
    }
    
    return false; // Not blocked
  };

  const canPerformAction = (action: string, userRole?: UserRole): boolean => {
    if (loading) return false;
    
    const requirements = getVerificationRequirements(userRole);
    const actionRequired = requirements[action] || false;
    
    // Can perform if either:
    // 1. Action doesn't require verification, OR
    // 2. User is verified
    return !actionRequired || isVerified;
  };

  const getRequiredActions = (userRole?: UserRole): string[] => {
    const requirements = getVerificationRequirements(userRole);
    return Object.entries(requirements)
      .filter(([_, required]) => required)
      .map(([action, _]) => action);
  };

  return {
    isVerified,
    loading,
    kycStatus,
    requireVerification,
    canPerformAction,
    getRequiredActions,
  };
}
