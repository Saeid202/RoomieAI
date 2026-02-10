import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { kycService } from '@/services/kycService';
import { KYC_STATUS } from '@/services/kycConfig';
import { supabase } from '@/integrations/supabase/client';

interface VerificationState {
  verificationId?: string;
  referenceId?: string;
  status: string;
  provider?: string;
  startedAt?: string;
  redirectUrl?: string;
  isMidVerification: boolean;
  consentGiven: boolean;
}

interface UseKYCPersistenceReturn {
  verificationState: VerificationState | null;
  loading: boolean;
  saveVerificationState: (state: Partial<VerificationState>) => void;
  clearVerificationState: () => void;
  restoreVerificationState: () => Promise<boolean>;
  isMidVerification: boolean;
  canResumeVerification: boolean;
}

export function useKYCPersistence(): UseKYCPersistenceReturn {
  const { user, session } = useAuth();
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'kyc_verification_state';

  useEffect(() => {
    if (user && session) {
      restoreVerificationState();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const saveVerificationState = (state: Partial<VerificationState>) => {
    try {
      const currentState = verificationState || {};
      const newState = { ...currentState, ...state } as VerificationState;
      
      setVerificationState(newState);
      
      // Save to session storage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      
      // Save to database for cross-device persistence
      if (user && session) {
        saveStateToDatabase(newState);
      }
      
    } catch (error) {
      console.error('Error saving verification state:', error);
    }
  };

  const clearVerificationState = () => {
    try {
      setVerificationState(null);
      sessionStorage.removeItem(STORAGE_KEY);
      
      // Clear from database
      if (user && session) {
        clearStateFromDatabase();
      }
    } catch (error) {
      console.error('Error clearing verification state:', error);
    }
  };

  const restoreVerificationState = async (): Promise<boolean> => {
    try {
      setLoading(true);

      // First try session storage for immediate response
      const sessionState = sessionStorage.getItem(STORAGE_KEY);
      if (sessionState) {
        try {
          const parsed = JSON.parse(sessionState);
          setVerificationState(parsed);
          
          // Validate and clean up the state
          const cleanedState = await validateAndCleanState(parsed);
          if (cleanedState) {
            setVerificationState(cleanedState);
            saveVerificationState(cleanedState);
          }
        } catch (parseError) {
          console.error('Error parsing session state:', parseError);
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }

      // Then try database for cross-device state
      if (user && session) {
        const dbState = await loadStateFromDatabase();
        if (dbState) {
          const cleanedState = await validateAndCleanState(dbState);
          if (cleanedState) {
            setVerificationState(cleanedState);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedState));
          }
        }
      }

      setLoading(false);
      return true;

    } catch (error) {
      console.error('Error restoring verification state:', error);
      setLoading(false);
      return false;
    }
  };

  const validateAndCleanState = async (state: any): Promise<VerificationState | null> => {
    try {
      // Check if state is still valid
      if (!state || !state.status) {
        return null;
      }

      // Check if verification is too old
      if (state.startedAt) {
        const startedTime = new Date(state.startedAt);
        const now = new Date();
        const hoursSinceStart = (now.getTime() - startedTime.getTime()) / (1000 * 60 * 60);
        
        // If more than 2 hours old, clear it
        if (hoursSinceStart > 2) {
          console.log('Verification state too old, clearing');
          return null;
        }
      }

      // Check current status from backend
      if (user && session && state.referenceId) {
        try {
          const currentStatus = await kycService.getStatus(session.access_token);
          
          // If status is final, clear the mid-verification state
          if ([
            KYC_STATUS.VERIFIED,
            KYC_STATUS.REJECTED,
            KYC_STATUS.EXPIRED,
            KYC_STATUS.CANCELLED
          ].includes(currentStatus.kyc_status as any)) {
            console.log('Verification completed, clearing mid-verification state');
            return null;
          }

          // Update state with current status
          return {
            ...state,
            status: currentStatus.kyc_status,
            isMidVerification: currentStatus.kyc_status === KYC_STATUS.PENDING,
          };
        } catch (error) {
          console.error('Error checking current status:', error);
          // Keep existing state but mark as potentially stale
          return {
            ...state,
            isMidVerification: false,
          };
        }
      }

      return {
        ...state,
        isMidVerification: state.status === KYC_STATUS.PENDING,
      };

    } catch (error) {
      console.error('Error validating state:', error);
      return null;
    }
  };

  const saveStateToDatabase = async (state: VerificationState) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          key: 'kyc_verification_state',
          value: JSON.stringify(state),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('key', 'kyc_verification_state');

      if (error) {
        console.error('Error saving state to database:', error);
      }
    } catch (error) {
      console.error('Error saving state to database:', error);
    }
  };

  const loadStateFromDatabase = async (): Promise<VerificationState | null> => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('value, updated_at')
        .eq('user_id', user.id)
        .eq('key', 'kyc_verification_state')
        .single();

      if (error || !data) {
        return null;
      }

      // Check if state is too old
      const updatedTime = new Date(data.updated_at);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - updatedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate > 2) {
        // Clear old state
        await clearStateFromDatabase();
        return null;
      }

      return JSON.parse(data.value);

    } catch (error) {
      console.error('Error loading state from database:', error);
      return null;
    }
  };

  const clearStateFromDatabase = async () => {
    try {
      if (!user) return;

      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('key', 'kyc_verification_state');
    } catch (error) {
      console.error('Error clearing state from database:', error);
    }
  };

  const isMidVerification = verificationState?.isMidVerification || false;
  const canResumeVerification = Boolean(isMidVerification && verificationState?.redirectUrl);

  return {
    verificationState,
    loading,
    saveVerificationState,
    clearVerificationState,
    restoreVerificationState,
    isMidVerification,
    canResumeVerification,
  };
}
