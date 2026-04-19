// Bank Management Hub - Unified container for all bank-related services
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, CreditCard, TrendingUp, Shield, CheckCircle2, Trash2, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethod } from "@/types/payment";
import { formatCurrency } from "@/services/feeCalculationService";
import { BankStatementUpload, BankStatementAnalysis } from "./BankStatementUpload";

interface BankManagementHubProps {
  userId: string;
  paymentMethods: PaymentMethod[];
  bankStatementAnalysis?: BankStatementAnalysis | null;
  onAddPaymentMethod?: () => void;
  onDeletePaymentMethod?: (method: PaymentMethod) => void;
  onBankStatementAnalysisComplete?: (analysis: BankStatementAnalysis) => void;
}

export function BankManagementHub({
  userId,
  paymentMethods,
  bankStatementAnalysis,
  onAddPaymentMethod,
  onDeletePaymentMethod,
  onBankStatementAnalysisComplete
}: BankManagementHubProps) {
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];

  return (
    <div className="space-y-4">
      {/* Current PAD Connection */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            Current PAD Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div key={method.id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  method.is_default ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {method.bank_name || 'Bank Account'} 
                        {method.is_default && (
                          <span className="ml-2 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-purple-600 inline mr-1" />
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {method.last4 || method.stripe_payment_method_id?.slice(-4)} 
                        <span className="ml-2 text-green-600">Active for rent payments</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:bg-purple-50"
                    >
                      Manage
                    </Button>
                    {onDeletePaymentMethod && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePaymentMethod(method)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No PAD connection yet</p>
              <Button 
                onClick={onAddPaymentMethod}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" 
                style={{background: 'linear-gradient(to right, #8B5CF6, #FF6B35)'}}
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect Bank for PAD
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method */}
      {paymentMethods.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <Button
              onClick={onAddPaymentMethod}
              variant="outline"
              className="w-full border-2 border-dashed border-purple-200 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Income Analysis */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Income Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Analysis Status */}
            {bankStatementAnalysis ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-900">Analysis Complete</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly income:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(bankStatementAnalysis.monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Daily contribution:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(bankStatementAnalysis.monthlyIncome / 30.4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Confidence:</span>
                    <span className="font-semibold text-slate-900">{Math.round(bankStatementAnalysis.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpload(true)}
                    className={`flex-col h-auto py-3 border-2 border-dashed transition-all ${
                      showUpload
                        ? 'border-purple-400 bg-purple-50 text-purple-700'
                        : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Upload Statement</span>
                    <span className="text-xs text-slate-400">85% accuracy</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-col h-auto py-3 border-2 border-dashed border-slate-300 opacity-50"
                    title="Coming soon"
                  >
                    <Building2 className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Connect Bank</span>
                    <span className="text-xs text-slate-400">95% accuracy</span>
                  </Button>
                </div>

                {/* Inline upload UI */}
                {showUpload && (
                  <BankStatementUpload
                    userId={userId}
                    bankStatementAnalysis={bankStatementAnalysis}
                    onUploadSuccess={(filePath) => console.log('Uploaded:', filePath)}
                    onAnalysisComplete={(analysis) => {
                      onBankStatementAnalysisComplete?.(analysis as any);
                    }}
                  />
                )}

                {!showUpload && (
                  <div className="text-xs text-slate-400 text-center">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Bank-level security and encryption
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
