import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActiveLease {
  id: string;
  property_id: string;
  landlord_id: string;
  monthly_rent: number;
  lease_start_date: string;
}

export default function DigitalWallet() {
  const { user } = useAuth();
  const [activeLease, setActiveLease] = useState<ActiveLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate next payment date based on lease start date
  const calculateNextPaymentDate = (leaseStartDate: string): string => {
    const startDate = new Date(leaseStartDate);
    const today = new Date();
    
    // Get the day of month from lease start date
    const paymentDay = startDate.getDate();
    
    // Start with current month
    let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);
    
    // If payment date has passed this month, move to next month
    if (nextPayment <= today) {
      nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
    }
    
    return nextPayment.toISOString().split('T')[0];
  };

  const fetchActiveLease = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching lease contracts for user:', user.id);

      // Fetch active lease contract for the current tenant
      const { data, error: fetchError } = await supabase
        .from('lease_contracts')
        .select('id, property_id, landlord_id, monthly_rent, lease_start_date')
        .eq('tenant_id', user.id)
        .in('status', ['fully_signed', 'executed'])
        .single();

      console.log('📊 Lease query result:', { data, error: fetchError });

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No active lease found
          console.log('✅ No active lease found (expected after withdrawal)');
          setError('No active lease found. Please contact your landlord.');
        } else {
          console.error('❌ Unexpected error:', fetchError);
          throw fetchError;
        }
        return;
      }

      if (!data) {
        console.log('✅ No lease data returned');
        setError('No active lease found. Please contact your landlord.');
        return;
      }

      console.log('📝 Active lease found:', data);
      setActiveLease(data);
    } catch (err: any) {
      console.error('❌ Error fetching lease:', err);
      setError('Failed to load lease information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLease();
  }, [user?.id]);

  const handlePaymentComplete = (paymentId: string) => {
    console.log('Payment completed:', paymentId);
    // Refresh lease data or navigate to confirmation page
  };

  const forceDeleteLease = async () => {
    if (!confirm('⚠️ DEBUG: This will delete your lease contract. Are you sure?')) {
      return;
    }

    try {
      console.log('🗑️ Force deleting lease contract for user:', user?.id);
      
      const { error } = await supabase
        .from('lease_contracts')
        .delete()
        .eq('tenant_id', user?.id);

      if (error) {
        console.error('❌ Error deleting lease:', error);
        toast.error('Failed to delete lease: ' + error.message);
        return;
      }

      console.log('✅ Lease deleted successfully');
      toast.success('Lease contract deleted. Refreshing...');
      
      // Refresh the page
      setTimeout(() => {
        fetchActiveLease();
      }, 500);
    } catch (err: any) {
      console.error('❌ Error:', err);
      toast.error('Failed to delete lease');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-roomie-purple" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-roomie-purple" />
      </div>
    );
  }

  // Always show payment page - allow users to set up payment methods
  return (
    <div className="max-w-full px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Digital Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your rent payments with Canadian Pre-Authorized Debit (PAD)
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            toast.info('Refreshing lease data...');
            fetchActiveLease();
          }}
          disabled={loading}
          className="h-9"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {!activeLease && (
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <Info className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-blue-800">
            No active lease found. You can still set up your payment method to be ready when you have a lease.
          </AlertDescription>
        </Alert>
      )}

      {activeLease && (
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <Info className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-blue-800">
            Save money with Canadian PAD! Pay only 1% + $0.25 per transaction instead of 2.9% + $0.30 with cards.
            {activeLease.monthly_rent >= 1000 && (
              <> That's ~${Math.round((activeLease.monthly_rent * 0.019) - (activeLease.monthly_rent * 0.01))} savings per month on ${activeLease.monthly_rent.toLocaleString()} rent.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Payment Flow - Always show */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">
              {activeLease ? 'Pay Your Rent' : 'Set Up Payment Method'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {activeLease 
                ? 'Choose your payment method and complete your rent payment securely'
                : 'Connect your bank account or card to be ready for rent payments'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RentPaymentFlow 
              userId={user.id}
              propertyId={activeLease?.property_id || ''}
              landlordId={activeLease?.landlord_id || ''}
              rentAmount={activeLease?.monthly_rent || 0}
              dueDate={activeLease ? calculateNextPaymentDate(activeLease.lease_start_date) : ''}
              onPaymentComplete={handlePaymentComplete}
            />
          </CardContent>
        </Card>

        {/* Test Credentials Card - Only show in development with test keys */}
        {process.env.NODE_ENV === 'development' && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && (
          <Card className="border-dashed bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm text-gray-700">Test Mode - Stripe Test Credentials</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                Use these test bank account details for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-green-700">✅ Successful Payment</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>Account Holder: Test User</li>
                    <li>Institution: 000</li>
                    <li>Transit: 00022</li>
                    <li>Account: 000123456789</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-red-700">❌ Failed Payment Tests</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                    <li>Insufficient Funds: 000111111116</li>
                    <li>Account Closed: 000222222227</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

