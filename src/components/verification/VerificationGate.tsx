import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { kycService } from '@/services/kycService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VerificationGateProps {
  children: React.ReactNode;
  feature?: string;
  redirectTo?: string;
}

export function VerificationGate({ children, feature = "this feature", redirectTo = '/dashboard/profile' }: VerificationGateProps) {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [showGate, setShowGate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && session) {
      checkVerificationStatus();
    }
  }, [user, session]);

  const checkVerificationStatus = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      
      // Try session storage first for faster loading
      const cachedStatus = sessionStorage.getItem('kyc_status');
      if (cachedStatus) {
        const parsed = JSON.parse(cachedStatus);
        setKycStatus(parsed);
        setShowGate(parsed.kyc_status !== 'verified');
        setIsLoading(false);
        return; // Exit early if we have cached data
      }

      // Fetch fresh status
      const statusData = await kycService.getStatus(session.access_token);
      setKycStatus(statusData);
      setShowGate(statusData.kyc_status !== 'verified');
      setIsLoading(false);
      
      // Update cache
      sessionStorage.setItem('kyc_status', JSON.stringify(statusData));
      
    } catch (error) {
      console.error('Error checking verification status:', error);
      // Default to showing gate if we can't verify
      setShowGate(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToProfile = () => {
    navigate(redirectTo);
  };

  const handleStartVerification = async () => {
    try {
      const result = await kycService.startVerification(session?.access_token || '');
      
      if (result.verification_url) {
        window.location.href = result.verification_url;
      } else {
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      navigate(redirectTo);
    }
  };

  const handleDismiss = () => {
    setShowGate(false);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>{children}</div>;
  }

  if (showGate && kycStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-purple-900">
              Identity Verification Required
            </CardTitle>
            <CardDescription>
              You need to verify your identity to access {feature}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Verification Required</h4>
                  <p className="text-sm text-yellow-700">
                    To ensure the safety and security of our community, we require all users to complete identity verification before accessing certain features.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Button 
                onClick={handleStartVerification}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Start Verification
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div>{children}</div>;
}
