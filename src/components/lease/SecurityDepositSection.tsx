import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, DollarSign, Info, CheckCircle2, Loader2, Building2, CreditCard } from 'lucide-react';
import { formatCurrency, getFeeComparison } from '@/services/feeCalculationService';
import { toast } from 'sonner';
import { PaymentMethodType, PaymentMethod } from '@/types/payment';

interface SecurityDepositSectionProps {
  leaseId: string;
  monthlyRent: number;
  onPaymentSuccess?: () => void;
  paymentMethods?: PaymentMethod[];
}

type DepositStatus = 'pending' | 'partial' | 'complete';

interface DepositState {
  amount: number;
  status: DepositStatus;
  totalPaid: number;
  suggestedAmount: number;
}

export default function SecurityDepositSection({ 
  leaseId, 
  monthlyRent, 
  onPaymentSuccess,
  paymentMethods = []
}: SecurityDepositSectionProps) {
  // Mock data for now - will be replaced with API calls
  const [deposit, setDeposit] = useState<DepositState>({
    amount: monthlyRent * 1.5, // Suggested: 1.5 months rent
    status: 'pending', // Always start as pending to show payment form
    totalPaid: 0,
    suggestedAmount: monthlyRent * 1.5
  });

  // Use real payment methods when available, fallback to mock for testing
  const mockPaymentMethods: PaymentMethod[] = paymentMethods.length > 0 ? paymentMethods : [
    {
      id: 'mock-pad-1',
      user_id: 'mock-user',
      payment_type: 'acss_debit',
      stripe_payment_method_id: 'pm_mock_pad_123',
      bank_name: 'Test Bank',
      last4: '6789',
      mandate_id: 'mandate_mock_123',
      mandate_status: 'active',
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-card-1',
      user_id: 'mock-user',
      payment_type: 'card',
      stripe_payment_method_id: 'pm_mock_card_456',
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025,
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const [isProcessing, setIsProcessing] = useState(false);
  const [inputAmount, setInputAmount] = useState(deposit.amount.toString());
  const [showHelp, setShowHelp] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('acss_debit');

  // Calculate suggested deposit (1-2 months rent)
  const calculateSuggestedAmount = () => {
    const min = monthlyRent;
    const max = monthlyRent * 2;
    return Math.round((min + max) / 2 * 100) / 100;
  };

  // Get available payment methods based on user's connected methods
  const getAvailablePaymentMethods = () => {
    const methods: { type: PaymentMethodType; name: string; icon: React.ReactNode; description: string; processingTime: string }[] = [];
    
    // Use real payment methods from props
    const availableMethods = mockPaymentMethods;
    
    // Check if user has PAD payment methods
    const hasPad = availableMethods.some(m => m.payment_type === 'acss_debit');
    if (hasPad) {
      methods.push({
        type: 'acss_debit',
        name: 'Canadian Bank Account (PAD)',
        icon: <Building2 className="h-4 w-4" />,
        description: 'Low fees for bank transfers',
        processingTime: '3-5 business days'
      });
    }
    
    // Check if user has card payment methods (Affirm)
    const hasCard = availableMethods.some(m => m.payment_type === 'card');
    if (hasCard) {
      methods.push({
        type: 'card',
        name: 'Affirm - Buy Now Pay Later',
        icon: (
          <div className="h-4 w-4 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded">
            A
          </div>
        ),
        description: 'Pay in installments with no hidden fees',
        processingTime: 'Instant approval'
      });
    }
    
    console.log('Available methods:', methods);
    console.log('Real payment methods:', availableMethods);
    console.log('Selected method:', selectedPaymentMethod);
    
    return methods;
  };

  // Get fee comparison for selected method
  const getFeeInfo = () => {
    const feeComparison = getFeeComparison(deposit.amount);
    return selectedPaymentMethod === 'card' ? feeComparison.card : feeComparison.pad;
  };

  // Get default payment method
  const getDefaultPaymentMethod = () => {
    if (mockPaymentMethods.length === 0) return null;
    return mockPaymentMethods.find(m => m.is_default) || mockPaymentMethods[0];
  };

  // Set default payment method on component mount only
  useEffect(() => {
    const defaultMethod = getDefaultPaymentMethod();
    if (defaultMethod) {
      setSelectedPaymentMethod(defaultMethod.payment_type);
    }
  }, []); // Empty dependency array - only run once on mount

  // Handle amount input
  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setInputAmount(cleanValue);
    
    // Update deposit amount
    const numValue = parseFloat(cleanValue) || 0;
    if (numValue >= 0 && numValue <= 10000) { // Reasonable limits
      setDeposit(prev => ({ ...prev, amount: numValue }));
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (deposit.amount <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    setIsProcessing(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update status temporarily for demo
      setDeposit(prev => ({
        ...prev,
        status: 'complete',
        totalPaid: prev.amount
      }));
      
      toast.success('Security deposit payment processed successfully!');
      onPaymentSuccess?.();
      
      // Reset to pending after 3 seconds for continued testing
      setTimeout(() => {
        setDeposit(prev => ({
          ...prev,
          status: 'pending',
          totalPaid: 0
        }));
      }, 3000);
      
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Status badge styling
  const getStatusBadge = () => {
    switch (deposit.status) {
      case 'complete':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            Partially Paid
          </Badge>
        );
      default:
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            Pending
          </Badge>
        );
    }
  };

  // If deposit is complete, show simple status
  if (deposit.status === 'complete') {
    return (
      <Card className="border-roomie-purple/20 bg-gradient-to-r from-roomie-purple/5 to-roomie-orange/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-roomie-purple to-roomie-orange flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-900 text-sm">Security Deposit</p>
                {getStatusBadge()}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-bold text-slate-900">{formatCurrency(deposit.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-green-600">Fully Paid</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-roomie-purple/20 bg-gradient-to-r from-roomie-purple/5 to-roomie-orange/5 shadow-sm">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-roomie-purple to-roomie-orange flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-900 text-sm">Security Deposit</p>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              One-time payment as agreed with your landlord
            </p>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex-shrink-0 h-6 w-6 rounded-full bg-roomie-purple/10 flex items-center justify-center text-roomie-purple hover:bg-roomie-purple/20 transition-colors"
          >
            <Info className="h-3 w-3" />
          </button>
        </div>

        {/* Help Text */}
        {showHelp && (
          <Alert className="bg-roomie-purple/10 border-roomie-purple/20 mb-4">
            <Info className="h-4 w-4 text-roomie-purple" />
            <AlertDescription className="text-roomie-purple text-sm">
              Security deposits are typically 1-2 months' rent. The exact amount should be confirmed with your landlord. This is a one-time payment refundable at lease end (subject to terms).
            </AlertDescription>
          </Alert>
        )}

        {/* Amount Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={inputAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="pl-9 h-10 bg-white border-roomie-purple/20 focus:border-roomie-purple focus:ring-roomie-purple/20"
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={() => setInputAmount(calculateSuggestedAmount().toString())}
              variant="outline"
              size="sm"
              className="border-roomie-purple/30 text-roomie-purple hover:bg-roomie-purple/5"
              disabled={isProcessing}
            >
              Suggest
            </Button>
          </div>

          {/* Suggested Amount Note */}
          <p className="text-xs text-slate-500 text-center">
            Suggested: {formatCurrency(calculateSuggestedAmount())} (1.5 months' rent)
          </p>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Payment Method</p>
            {/* Debug info */}
            <div className="text-xs text-slate-400">
              Available methods: {getAvailablePaymentMethods().length}
            </div>
            <div className="space-y-2">
                {getAvailablePaymentMethods().map((method) => (
                  <button
                    key={method.type}
                    onClick={() => {
                      console.log('Clicked method:', method.type);
                      setSelectedPaymentMethod(method.type);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      selectedPaymentMethod === method.type
                        ? 'border-roomie-purple bg-roomie-purple/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        selectedPaymentMethod === method.type
                          ? 'bg-roomie-purple text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900">{method.name}</p>
                        <p className="text-xs text-slate-500">{method.description} · {method.processingTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(getFeeInfo().total)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Fee: {formatCurrency(getFeeInfo().fee)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          {/* No Payment Methods Message */}
          {getAvailablePaymentMethods().length === 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-800" />
              <AlertDescription className="text-amber-800 text-sm">
                No payment methods connected. Please add a payment method first.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || deposit.amount <= 0 || getAvailablePaymentMethods().length === 0}
            className="w-full bg-gradient-to-r from-roomie-purple to-roomie-orange hover:from-roomie-purple-dark hover:to-roomie-orange-dark text-white font-bold transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Pay Security Deposit {deposit.amount > 0 && formatCurrency(getFeeInfo().total)}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
