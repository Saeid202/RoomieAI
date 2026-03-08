import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Loader2, RefreshCw, Building2, Plus, CreditCard, CheckCircle2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserPaymentMethods, createRentPaymentIntent, recordRentPayment, deletePaymentMethod } from "@/services/padPaymentService";
import { PaymentMethod } from "@/types/payment";
import { formatCurrency } from "@/services/feeCalculationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

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
          console.log('✅ No active lease found');
        } else {
          console.error('❌ Unexpected error:', fetchError);
          throw fetchError;
        }
        return;
      }

      if (data) {
        console.log('📝 Active lease found:', data);
        setActiveLease(data);
      }
    } catch (err: any) {
      console.error('❌ Error fetching lease:', err);
      toast.error('Failed to load lease information');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user?.id) return;

    try {
      const methods = await getUserPaymentMethods(user.id);
      setPaymentMethods(methods);
      console.log('💳 Payment methods loaded:', methods);
    } catch (err: any) {
      console.error('❌ Error fetching payment methods:', err);
      toast.error('Failed to load payment methods');
    }
  };

  useEffect(() => {
    fetchActiveLease();
    fetchPaymentMethods();
  }, [user?.id]);

  const handleBankConnected = () => {
    console.log('✅ Bank account connected successfully');
    setShowConnectModal(false);
    fetchPaymentMethods(); // Refresh payment methods
    toast.success('Bank account connected! You can now make payments.');
  };

  const handleDeletePaymentMethod = async (method: PaymentMethod) => {
    setMethodToDelete(method);
  };

  const confirmDeletePaymentMethod = async () => {
    if (!methodToDelete) return;

    setDeletingMethodId(methodToDelete.id);
    try {
      await deletePaymentMethod(methodToDelete.id);
      toast.success('Payment method removed successfully');
      fetchPaymentMethods(); // Refresh the list
      setMethodToDelete(null);
    } catch (err: any) {
      console.error('❌ Error deleting payment method:', err);
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingMethodId(null);
    }
  };

  const handleMakePayment = async () => {
    console.log('🔵 handleMakePayment called', {
      userId: user?.id,
      paymentMethodsCount: paymentMethods.length,
      paymentAmount
    });

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (paymentMethods.length === 0) {
      toast.error('No payment method found. Please connect a bank account first.');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 0.5) {
      toast.error('Please enter a valid amount (minimum $0.50 CAD)');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
      
      console.log('💳 Using payment method:', {
        id: defaultMethod.id,
        type: defaultMethod.payment_type,
        bankName: defaultMethod.bank_name
      });

      // Create payment intent (independent of lease/rent)
      console.log('🔄 Creating payment intent...');
      const { paymentIntentId } = await createRentPaymentIntent(
        amount,
        defaultMethod.payment_type,
        defaultMethod.id,
        activeLease ? {
          tenantId: user.id,
          landlordId: activeLease.landlord_id,
          propertyId: activeLease.property_id,
          dueDate: calculateNextPaymentDate(activeLease.lease_start_date)
        } : undefined // No metadata if no lease
      );

      console.log('✅ Payment intent created:', paymentIntentId);

      // Optionally record payment if lease exists
      if (activeLease) {
        console.log('💾 Recording payment...');
        await recordRentPayment({
          amount,
          paymentMethodType: defaultMethod.payment_type,
          paymentMethodId: defaultMethod.id,
          stripePaymentIntentId: paymentIntentId,
          stripeMandateId: defaultMethod.mandate_id,
          propertyId: activeLease.property_id,
          tenantId: user.id,
          landlordId: activeLease.landlord_id,
          dueDate: calculateNextPaymentDate(activeLease.lease_start_date)
        });
        console.log('✅ Payment recorded successfully');
      }

      toast.success('Payment initiated successfully!');
      setShowPaymentForm(false);
      setPaymentAmount('');
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      toast.error(err.message || 'Payment failed. Check console for details.');
    } finally {
      setIsProcessingPayment(false);
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

  // Show payment methods and payment form (Uber/Airbnb model)
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
            toast.info('Refreshing...');
            fetchActiveLease();
            fetchPaymentMethods();
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
        {/* Saved Payment Methods */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Payment Methods</CardTitle>
            <CardDescription className="text-gray-600">
              Manage your saved payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">No payment methods connected yet</p>
                <Button onClick={() => setShowConnectModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Bank Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      {method.payment_type === 'acss_debit' ? (
                        <Building2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.bank_name || 'Bank Account'} (••••{method.last4 || method.stripe_payment_method_id?.slice(-4)})
                        </p>
                        <p className="text-sm text-gray-600">
                          {method.payment_type === 'acss_debit' ? 'Pre-Authorized Debit' : 'Card'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.is_default && (
                        <Badge className="bg-green-600">Default</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method)}
                        disabled={deletingMethodId === method.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingMethodId === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  onClick={() => setShowConnectModal(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Make Payment Section - Only show if payment method exists */}
        {paymentMethods.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Make a Payment</CardTitle>
              <CardDescription className="text-gray-600">
                Enter the amount you want to pay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPaymentForm ? (
                <Button 
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Make Payment
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount (CAD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.50"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      disabled={isProcessingPayment}
                    />
                    <p className="text-xs text-gray-500">Minimum: $0.50 CAD</p>
                    {activeLease && (
                      <p className="text-sm text-gray-600">
                        Monthly rent: {formatCurrency(activeLease.monthly_rent)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleMakePayment}
                      disabled={isProcessingPayment || !paymentAmount}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirm Payment
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setPaymentAmount('');
                      }}
                      disabled={isProcessingPayment}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                    <li>Transit: 11000</li>
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

      {/* Connect Bank Account Modal */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect Bank Account</DialogTitle>
            <DialogDescription>
              Set up Pre-Authorized Debit for easy rent payments
            </DialogDescription>
          </DialogHeader>
          <RentPaymentFlow 
            userId={user?.id || ''}
            propertyId={activeLease?.property_id || ''}
            landlordId={activeLease?.landlord_id || ''}
            rentAmount={0} // Not needed for just connecting
            dueDate=""
            onBankConnected={handleBankConnected}
            onCancel={() => setShowConnectModal(false)}
            connectOnly={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Payment Method Confirmation */}
      <AlertDialog open={!!methodToDelete} onOpenChange={(open) => !open && setMethodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {methodToDelete?.bank_name || 'this payment method'} (••••{methodToDelete?.last4 || methodToDelete?.stripe_payment_method_id?.slice(-4)})?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePaymentMethod}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

