import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@/types/payment";
import { formatCurrency, getFeeComparison } from "@/services/feeCalculationService";
import { Building2, CreditCard, Loader2, ChevronRight, Info } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SimplePaymentFormProps {
  type: "rent" | "mortgage";
  defaultAmount: number;
  paymentMethods: PaymentMethod[];
  onPay: (amount: number, methodId: string, metadata?: { landlordId?: string; propertyId?: string }) => void;
  metadata?: { landlordId?: string; propertyId?: string };
  isProcessing?: boolean;
}

export function SimplePaymentForm({
  type,
  defaultAmount,
  paymentMethods,
  onPay,
  metadata,
  isProcessing = false
}: SimplePaymentFormProps) {
  const [amount, setAmount] = useState<string>(defaultAmount.toString());
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");

  useEffect(() => {
    setAmount(defaultAmount.toString());
  }, [defaultAmount]);

  useEffect(() => {
    const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
    if (defaultMethod) {
      setSelectedMethodId(defaultMethod.id);
    }
  }, [paymentMethods]);

  const numAmount = parseFloat(amount) || 0;
  const feeInfo = getFeeComparison(numAmount);
  
  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
  const totalAmount = type === "rent" 
    ? (selectedMethod ? (numAmount + (numAmount * 0.01) + 0.25) : numAmount) // Simple PAD fee for now if bank, needs actual logic
    : numAmount + (numAmount * 0.01) + 0.25; // Mortgage is always PAD

  const handlePay = () => {
    if (numAmount > 0 && selectedMethodId) {
      onPay(numAmount, selectedMethodId, metadata);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-8">
        {/* Amount Input Section */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Amount to Pay
          </label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-400 group-focus-within:text-purple-600 transition-colors">
              $
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12 py-10 text-5xl font-black border-2 border-slate-100 focus-visible:ring-purple-500 focus-visible:border-purple-500 rounded-xl transition-all shadow-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Payment Method
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-purple-600 hover:text-purple-700">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mortgage payments are only available via Pre-Authorized Debit (PAD)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
            <SelectTrigger className="w-full py-7 px-5 border-2 border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-all font-semibold">
              <SelectValue placeholder="Select a payment method">
                {selectedMethod && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-slate-900">{selectedMethod.bank_name} ••••{selectedMethod.last4}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-slate-100 shadow-xl">
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id} className="py-3 px-4 focus:bg-purple-50 focus:text-purple-700">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{method.bank_name} ••••{method.last4}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">PAD Payment</span>
                    </div>
                    {method.is_default && <Badge variant="secondary" className="ml-auto bg-purple-50 text-purple-600 border-none font-bold text-[10px]">DEFAULT</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary and Action */}
        <div className="pt-4 space-y-6">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 font-medium">Processing Fee</span>
              <span className="text-slate-900 font-bold">{formatCurrency(numAmount * 0.01 + 0.25)}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-purple-400" />
              Standard 1% + $0.25 PAD Processing Fee
            </p>
          </div>

          <Button 
            onClick={handlePay}
            disabled={isProcessing || numAmount <= 0 || !selectedMethodId}
            className="w-full py-8 text-xl font-black rounded-xl shadow-lg shadow-purple-100 transition-all active:scale-[0.98]"
            style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)', color: 'white'}}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ) : (
              <span className="flex items-center justify-center">
                Pay {formatCurrency(numAmount + numAmount * 0.01 + 0.25)}
                <ChevronRight className="ml-2 h-6 w-6" />
              </span>
            )}
          </Button>
          
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider max-w-[280px] mx-auto">
            Authorized Pre-Authorized Debit (PAD) transaction secured by bank-level encryption
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
