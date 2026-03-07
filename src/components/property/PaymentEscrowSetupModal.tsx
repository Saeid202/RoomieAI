import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentEscrowSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    purchasePrice: number;
    onComplete: () => void;
}

export function PaymentEscrowSetupModal({
    isOpen,
    onClose,
    propertyId,
    purchasePrice,
    onComplete
}: PaymentEscrowSetupModalProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'wire' | null>(null);

    const handleComplete = () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Payment & Escrow setup successfully!');
            onComplete();
            onClose();
        }, 1500);
    };

    const earnestMoney = purchasePrice * 0.03; // 3% earnest money example

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        Payment & Escrow Setup
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-800">Earnest Money Deposit (3%)</span>
                            <span className="text-xl font-bold text-green-900">${earnestMoney.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-green-700">
                            <span>Total Purchase Price</span>
                            <span>${purchasePrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Select Initial Payment Method</h3>
                        <p className="text-sm text-gray-600">
                            Choose how you would like to transfer the initial earnest money to the escrow account.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('bank')}
                                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${paymentMethod === 'bank'
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${paymentMethod === 'bank' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                    <Landmark className={`h-6 w-6 ${paymentMethod === 'bank' ? 'text-purple-600' : 'text-gray-600'}`} />
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-gray-900">Bank Transfer</span>
                                    <span className="text-xs text-gray-500">Connect via Plaid</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('wire')}
                                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${paymentMethod === 'wire'
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${paymentMethod === 'wire' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                    <CreditCard className={`h-6 w-6 ${paymentMethod === 'wire' ? 'text-purple-600' : 'text-gray-600'}`} />
                                </div>
                                <div className="text-center">
                                    <span className="block font-bold text-gray-900">Wire Transfer</span>
                                    <span className="text-xs text-gray-500">Manual instructions</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                            Your funds will be held in a secure, third-party escrow account. Payments are only released
                            upon successful completion of all closing conditions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={!paymentMethod || loading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md min-w-[140px]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Complete Setup
                            </div>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}