import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@/types/payment";
import { formatCurrency, getFeeComparison } from "@/services/feeCalculationService";
import { Building2, CreditCard, Loader2, ChevronRight, Info, TrendingUp, Wallet } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RentSmoothingContentProps {
  paymentMethods: PaymentMethod[];
  onPay: (amount: number, methodId: string, metadata?: { landlordId?: string; propertyId?: string }) => void;
  isProcessing?: boolean;
}

export default function RentSmoothingContent({
  paymentMethods,
  onPay,
  isProcessing = false
}: RentSmoothingContentProps) {
  const [amount, setAmount] = useState<string>("500");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [smoothingPeriod, setSmoothingPeriod] = useState<string>("monthly");

  useEffect(() => {
    const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
    if (defaultMethod) {
      setSelectedMethodId(defaultMethod.id);
    }
  }, [paymentMethods]);

  const numAmount = parseFloat(amount) || 0;
  const feeInfo = getFeeComparison(numAmount);
  const totalAmount = numAmount + (numAmount * 0.01) + 0.25;

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

  const handlePay = () => {
    if (numAmount > 0 && selectedMethodId) {
      onPay(numAmount, selectedMethodId);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`h-20 w-20 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-purple-100`}>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3 capitalize">
            Rent Smoothing
          </h2>
          <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">
            Enter details below to proceed
          </p>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-purple-600 uppercase tracking-wider">
            Smoothing Amount
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

        {/* Period Selector */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-purple-600 uppercase tracking-wider">
            Smoothing Period
          </label>
          <Select value={smoothingPeriod} onValueChange={setSmoothingPeriod}>
            <SelectTrigger className="w-full py-7 px-5 border-2 border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-all font-semibold">
              <SelectValue placeholder="Select period">
                {smoothingPeriod && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-slate-900">{smoothingPeriod}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-slate-100 shadow-xl">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-purple-600 uppercase tracking-wider">
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
                  <p>Rent smoothing helps manage irregular income with predictable monthly payments</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </div>
          </div>
          
          <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
            <SelectTrigger className="w-full py-7 px-5 border-2 border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-all font-semibold">
              <SelectValue placeholder="Select a payment method">
                {selectedMethod && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-purple-100">
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
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{method.bank_name} ••••{method.last4}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        Smoothing Payment
                      </span>
                    </div>
                    {method.is_default && (
                      <Badge variant="secondary" className="ml-auto font-bold text-[10px] bg-purple-50 text-purple-600 border-none">DEFAULT</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            style={{
              background: 'linear-gradient(to right, #8B5CF6, #7C3AED)', 
              color: 'white'
            }}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ) : (
              <span className="flex items-center justify-center">
                Pay {formatCurrency(totalAmount)}
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
