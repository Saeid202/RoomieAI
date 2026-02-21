import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, AlertCircle, Info, Zap } from 'lucide-react';
import { LandlordDebitCardDetails } from '@/types/payment';

interface LandlordDebitCardFormProps {
  onSubmit: (details: LandlordDebitCardDetails) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LandlordDebitCardForm({
  onSubmit,
  onCancel,
  isLoading = false
}: LandlordDebitCardFormProps) {
  const [formData, setFormData] = useState<LandlordDebitCardDetails>({
    cardholderName: '',
    cardNumber: '',
    expMonth: new Date().getMonth() + 1,
    expYear: new Date().getFullYear(),
    cvc: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Basic card number validation (remove spaces, check length)
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!formData.expMonth || formData.expMonth < 1 || formData.expMonth > 12) {
      newErrors.expMonth = 'Invalid month';
    }

    const currentYear = new Date().getFullYear();
    if (!formData.expYear || formData.expYear < currentYear) {
      newErrors.expYear = 'Card is expired';
    }

    if (!formData.cvc || formData.cvc.length < 3 || formData.cvc.length > 4) {
      newErrors.cvc = 'Invalid CVC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Remove spaces from card number before submitting
      const cleanedData = {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, '')
      };
      onSubmit(cleanedData);
    }
  };

  const handleInputChange = (field: keyof LandlordDebitCardDetails, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Debit Card Details
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Instant
                </Badge>
              </CardTitle>
              <CardDescription>
                Enter your debit card for instant payouts (~30 minutes)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Instant payouts have a 1% fee. Your card will be verified instantly.
              Only debit cards are supported (not credit cards).
            </AlertDescription>
          </Alert>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">
              Cardholder Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              disabled={isLoading}
            />
            {errors.cardholderName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cardholderName}
              </p>
            )}
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">
              Card Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              disabled={isLoading}
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cardNumber}
              </p>
            )}
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expMonth">
                Month <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expMonth"
                type="number"
                placeholder="MM"
                min="1"
                max="12"
                value={formData.expMonth}
                onChange={(e) => handleInputChange('expMonth', parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
              {errors.expMonth && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expMonth}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expYear">
                Year <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expYear"
                type="number"
                placeholder="YYYY"
                min={new Date().getFullYear()}
                value={formData.expYear}
                onChange={(e) => handleInputChange('expYear', parseInt(e.target.value) || new Date().getFullYear())}
                disabled={isLoading}
              />
              {errors.expYear && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expYear}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvc">
                CVC <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cvc"
                type="password"
                placeholder="123"
                maxLength={4}
                value={formData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
              />
              {errors.cvc && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cvc}
                </p>
              )}
            </div>
          </div>

          {/* Fee Warning */}
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              <strong>Fee Notice:</strong> Instant payouts cost 1% per transaction. 
              For a $2,000 payout, you'll receive $1,980 ($20 fee).
            </AlertDescription>
          </Alert>

          {/* Security Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your card information is encrypted and securely processed by Stripe. 
              We never store your full card number.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Connecting...' : 'Connect Debit Card'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
