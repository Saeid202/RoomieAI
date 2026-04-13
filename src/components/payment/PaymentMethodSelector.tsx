import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  CreditCard,
  Building2,
  Info,
  DollarSign
} from 'lucide-react';
import { PaymentMethodType } from '@/types/payment';
import { getFeeComparison, formatCurrency } from '@/services/feeCalculationService';

interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  amount,
  selectedMethod,
  onMethodChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const feeComparison = getFeeComparison(amount);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select Payment Method</h2>
        <p className="text-gray-600 text-sm">
          Choose how you'd like to pay your rent
        </p>
      </div>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as PaymentMethodType)}
        disabled={disabled}
        className="space-y-4"
      >
        {/* Card Payment Option */}
        <div
          className={`relative flex items-start space-x-4 rounded-lg border-2 p-4 transition-all ${
            selectedMethod === 'card'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && onMethodChange('card')}
        >
          <RadioGroupItem value="card" id="card" className="mt-1" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="card" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Credit or Debit Card
                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">Instant</Badge>
              </Label>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Processes immediately</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Fee: {formatCurrency(feeComparison.card.fee)} ({feeComparison.card.percentage} + {feeComparison.card.fixed})</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <span>Total: {formatCurrency(feeComparison.card.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAD Payment Option */}
        <div
          className={`relative flex items-start space-x-4 rounded-lg border-2 p-4 transition-all ${
            selectedMethod === 'acss_debit'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && onMethodChange('acss_debit')}
        >
          <RadioGroupItem value="acss_debit" id="acss_debit" className="mt-1" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="acss_debit" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                <Building2 className="h-5 w-5 text-green-600" />
                Canadian Bank Account (PAD)
                <Badge variant="default" className="ml-2 bg-green-600 hover:bg-green-700">Save {formatCurrency(feeComparison.savings)}</Badge>
              </Label>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Takes 3-5 business days to clear</span>
              </div>
              <div className="flex items-center gap-2 group relative">
                <DollarSign className="h-4 w-4" />
                <span>Fee: {formatCurrency(feeComparison.pad.fee)} ({feeComparison.pad.percentage} + {feeComparison.pad.fixed})</span>
                <div className="absolute -top-8 left-0 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="font-medium mb-1">Fee Breakdown:</div>
                  <div className="space-y-1 text-xs">
                    <div>• Base fee: CA$5.00</div>
                    <div>• Additional: {amount > 500 ? `${((feeComparison.pad.percentage as number || 0) * 100).toFixed(0)}% of amount over $500` : '0%'}</div>
                    <div>• Maximum: CA$40.00</div>
                    <div className="pt-1 border-t border-gray-600"></div>
                    <div className="mt-1">
                      <div className="font-semibold">Examples:</div>
                      <div>• $100 payment: CA$5.00</div>
                      <div>• $500 payment: CA$5.00</div>
                      <div>• $1,000 payment: CA$10.00</div>
                      <div>• $3,000 payment: CA$35.00</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Total: {formatCurrency(feeComparison.pad.total)}</span>
              </div>
            </div>

            {selectedMethod === 'acss_debit' && (
              <div className="mt-3 rounded-md bg-green-100 p-3 text-sm text-green-800">
                <p className="font-medium">💰 You'll save {formatCurrency(feeComparison.savings)} with this payment method!</p>
                <p className="mt-1 text-xs">Pre-Authorized Debit (PAD) offers the lowest fees for rent payments.</p>
              </div>
            )}
          </div>
        </div>
      </RadioGroup>

      {/* Dynamic Fee Comparison - Shows selected method details */}
      <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Fee Comparison</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Rent Amount:</span>
            <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
          </div>
          
          {selectedMethod === 'card' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Card Fee (2.9% + $0.30):</span>
                <span className="font-medium text-blue-600">{formatCurrency(feeComparison.card.fee)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-blue-600">{formatCurrency(feeComparison.card.total)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">PAD Fee (1% + $0.25):</span>
                <span className="font-medium text-green-600">{formatCurrency(feeComparison.pad.fee)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-green-600">{formatCurrency(feeComparison.pad.total)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
