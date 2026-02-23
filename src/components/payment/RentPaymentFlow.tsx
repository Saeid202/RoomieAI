import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  CreditCard,
  Building2
} from 'lucide-react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PadBankConnection } from './PadBankConnection';
import { PaymentMethodType, BankAccountDetails } from '@/types/payment';
import { 
  createPadPaymentMethod,
  savePaymentMethod,
  createRentPaymentIntent,
  recordRentPayment
} from '@/services/padPaymentService';
import { formatCurrency, calculateExpectedClearDate } from '@/services/feeCalculationService';
import { toast } from 'sonner';

interface RentPaymentFlowProps {
  userId: string;
  propertyId: string;
  landlordId: string;
  rentAmount: number;
  dueDate: string;
  onPaymentComplete?: (paymentId: string) => void;
  onCancel?: () => void;
}

type PaymentStep = 'select-method' | 'connect-bank' | 'confirm' | 'processing' | 'complete';

export function RentPaymentFlow({
  userId,
  propertyId,
  landlordId,
  rentAmount,
  dueDate,
  onPaymentComplete,
  onCancel
}: RentPaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select-method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('card');
  const [bankDetails, setBankDetails] = useState<BankAccountDetails | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleMethodChange = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleContinueFromMethodSelection = () => {
    if (selectedMethod === 'acss_debit') {
      setCurrentStep('connect-bank');
    } else {
      // For card payments, go directly to confirmation
      setCurrentStep('confirm');
    }
  };

  const handleBankConnected = async (details: BankAccountDetails) => {
    setBankDetails(details);
    setIsProcessing(true);
    setError(null);

    try {
      // Create Stripe payment method for PAD
      const { paymentMethodId: stripePaymentMethodId, mandateId } = await createPadPaymentMethod(details);

      // Save to database
      const dbPaymentMethodId = await savePaymentMethod(
        userId,
        'acss_debit',
        stripePaymentMethodId,
        {
          mandateId,
          mandateStatus: 'active',
          bankName: details.bankName,
          transitNumber: details.transitNumber,
          institutionNumber: details.institutionNumber
        }
      );

      setPaymentMethodId(dbPaymentMethodId);
      setCurrentStep('confirm');
      toast.success('Bank account connected successfully!');
    } catch (err: any) {
      console.error('Error connecting bank:', err);
      setError(err.message || 'Failed to connect bank account');
      toast.error('Failed to connect bank account');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethodId) {
      setError('No payment method selected');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCurrentStep('processing');

    try {
      // Create payment intent
      const { paymentIntentId, clientSecret } = await createRentPaymentIntent(
        rentAmount,
        selectedMethod,
        paymentMethodId,
        {
          tenantId: userId,
          landlordId,
          propertyId,
          dueDate
        }
      );

      // Record payment in database
      const recordedPaymentId = await recordRentPayment({
        propertyId,
        tenantId: userId,
        landlordId,
        amount: rentAmount,
        dueDate,
        paymentMethodType: selectedMethod,
        paymentMethodId,
        stripePaymentIntentId: paymentIntentId,
        stripeMandateId: bankDetails ? undefined : undefined // Add mandate ID if PAD
      });

      setPaymentId(recordedPaymentId);
      setCurrentStep('complete');
      toast.success('Payment initiated successfully!');
      
      if (onPaymentComplete) {
        onPaymentComplete(recordedPaymentId);
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
      setCurrentStep('confirm');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select-method':
        return (
          <div className="space-y-6">
            <PaymentMethodSelector
              amount={rentAmount}
              selectedMethod={selectedMethod}
              onMethodChange={handleMethodChange}
            />
            
            <div className="flex gap-3">
              <Button
                onClick={handleContinueFromMethodSelection}
                className="flex-1"
              >
                Continue
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        );

      case 'connect-bank':
        return (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep('select-method')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payment Methods
            </Button>
            
            <PadBankConnection
              onBankConnected={handleBankConnected}
              onCancel={() => setCurrentStep('select-method')}
              isLoading={isProcessing}
            />
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Confirm Payment</CardTitle>
                <CardDescription className="text-gray-600">Review your payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(rentAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <Badge variant={selectedMethod === 'acss_debit' ? 'default' : 'secondary'} className={selectedMethod === 'acss_debit' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-100 text-gray-700'}>
                      {selectedMethod === 'acss_debit' ? (
                        <><Building2 className="mr-1 h-3 w-3" /> Bank Account (PAD)</>
                      ) : (
                        <><CreditCard className="mr-1 h-3 w-3" /> Card</>
                      )}
                    </Badge>
                  </div>

                  {selectedMethod === 'acss_debit' && bankDetails && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium text-gray-900">
                        {bankDetails.bankName || 'Canadian Bank'} (****{bankDetails.accountNumber.slice(-4)})
                      </span>
                    </div>
                  )}

                  <Separator className="bg-gray-200" />

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="flex items-center gap-1 text-sm text-gray-900">
                      <Clock className="h-4 w-4" />
                      {selectedMethod === 'acss_debit' ? '3-5 business days' : 'Instant'}
                    </span>
                  </div>

                  {selectedMethod === 'acss_debit' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Clear Date:</span>
                      <span className="font-medium text-gray-900">
                        {calculateExpectedClearDate(5).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-800" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
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
                    onClick={() => setCurrentStep(selectedMethod === 'acss_debit' ? 'connect-bank' : 'select-method')}
                    disabled={isProcessing}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'processing':
        return (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Processing Payment...</h3>
                <p className="text-gray-600">Please wait while we process your payment</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'complete':
        return (
          <Card className="bg-white shadow-sm">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
                <h3 className="text-2xl font-bold text-green-700">Payment Initiated!</h3>
                
                {selectedMethod === 'acss_debit' ? (
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Your rent payment has been initiated via Pre-Authorized Debit.
                    </p>
                    <p className="text-sm text-gray-600">
                      The payment will clear in 3-5 business days. You'll receive a notification once it's complete.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Expected Clear Date:</strong> {calculateExpectedClearDate(5).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Your rent payment has been processed successfully.
                  </p>
                )}

                <Button onClick={() => window.location.reload()} className="mt-6 bg-blue-600 hover:bg-blue-700">
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderStepContent()}
    </div>
  );
}
