import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { STRIPE_CONFIG, STRIPE_ELEMENTS_CONFIG, STRIPE_ERROR_MESSAGES } from '@/config/stripe';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
  metadata?: Record<string, string>;
  customerId?: string;
  paymentMethodId?: string;
  mode?: 'payment' | 'setup';
}

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
  metadata?: Record<string, string>;
  customerId?: string;
  paymentMethodId?: string;
  mode?: 'payment' | 'setup';
}

function PaymentForm({
  amount,
  currency = 'cad',
  onSuccess,
  onError,
  isProcessing = false,
  metadata = {},
  customerId,
  paymentMethodId,
  mode = 'payment'
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (mode === 'setup') {
        // Setup Intent for saving payment methods
        const { error: setupError } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard/payments`,
          },
        });

        if (setupError) {
          throw new Error(setupError.message || 'Setup failed');
        }

        result = { setupIntent: { status: 'succeeded' } };
      } else {
        // Payment Intent for actual payments
        const { error: paymentError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard/payments`,
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message || 'Payment failed');
        }

        result = { paymentIntent: { status: 'succeeded' } };
      }

      if (result.paymentIntent?.status === 'succeeded' || result.setupIntent?.status === 'succeeded') {
        setSucceeded(true);
        onSuccess(result.paymentIntent || result.setupIntent);
        toast.success(mode === 'setup' ? 'Payment method saved successfully!' : 'Payment successful!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          {mode === 'setup' ? 'Payment Method Saved!' : 'Payment Successful!'}
        </h3>
        <p className="text-muted-foreground">
          {mode === 'setup' 
            ? 'Your payment method has been saved securely.' 
            : 'Your payment has been processed successfully.'
          }
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Payment Information</label>
          <PaymentElement
            options={{
              layout: 'tabs',
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                  phone: 'auto',
                },
              },
            }}
          />
        </div>

        {mode === 'payment' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount to pay:</span>
              <span className="text-lg font-bold">
                ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
              <span>Platform fee (2.5%):</span>
              <span>${(amount * 0.025 / 100).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isLoading || isProcessing}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {mode === 'setup' ? 'Saving...' : 'Processing...'}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {mode === 'setup' ? 'Save Payment Method' : 'Pay Now'}
          </>
        )}
      </Button>
    </form>
  );
}

export function StripePaymentForm({
  amount,
  currency = 'cad',
  onSuccess,
  onError,
  isProcessing = false,
  metadata = {},
  customerId,
  paymentMethodId,
  mode = 'payment'
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createIntent = async () => {
      try {
        setIsLoading(true);
        
        const endpoint = mode === 'setup' 
          ? '/api/payments/create-setup-intent'
          : '/api/payments/create-intent';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: mode === 'payment' ? amount : undefined,
            currency,
            metadata,
            customerId,
            paymentMethodId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret: secret } = await response.json();
        setClientSecret(secret);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [amount, currency, metadata, customerId, paymentMethodId, mode, onError]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading payment form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Failed to initialize payment form</AlertDescription>
      </Alert>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: STRIPE_ELEMENTS_CONFIG.appearance,
    loader: STRIPE_ELEMENTS_CONFIG.loader,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
        isProcessing={isProcessing}
        metadata={metadata}
        customerId={customerId}
        paymentMethodId={paymentMethodId}
        mode={mode}
      />
    </Elements>
  );
}

// Payment Method Management Component
interface PaymentMethodFormProps {
  onSuccess: (paymentMethod: any) => void;
  onError: (error: string) => void;
  customerId?: string;
}

export function PaymentMethodForm({ onSuccess, onError, customerId }: PaymentMethodFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Add Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StripePaymentForm
          amount={0}
          mode="setup"
          onSuccess={onSuccess}
          onError={onError}
          customerId={customerId}
        />
      </CardContent>
    </Card>
  );
}

// Quick Payment Component
interface QuickPaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  metadata?: Record<string, string>;
  customerId?: string;
}

export function QuickPayment({ 
  amount, 
  currency = 'cad', 
  onSuccess, 
  onError, 
  metadata = {},
  customerId 
}: QuickPaymentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StripePaymentForm
          amount={amount}
          currency={currency}
          onSuccess={onSuccess}
          onError={onError}
          metadata={metadata}
          customerId={customerId}
        />
      </CardContent>
    </Card>
  );
}
