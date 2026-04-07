import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, CreditCard, Clock, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getUserPaymentMethods, deletePaymentMethod } from "@/services/padPaymentService";
import { PaymentMethod } from "@/types/payment";
import { toast } from "sonner";

type PaymentTab = "rent" | "mortgage";

export function WalletContent() {
  const { user } = useAuth();
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentTab>("rent");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(true);

  // Demo data - replace with actual data from your database
  const rentAmount = 2000;
  const dueDate = new Date(new Date().setDate(1)).toISOString().split('T')[0]; // First of month
  const propertyId = "demo-property-id"; // Replace with actual property ID
  const landlordId = "demo-landlord-id"; // Replace with actual landlord ID

  useEffect(() => {
    fetchPaymentMethods();
  }, [user?.id]);

  const fetchPaymentMethods = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const methods = await getUserPaymentMethods(user.id);
      setPaymentMethods(methods);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setDeletingMethodId(methodId);
    try {
      await deletePaymentMethod(methodId);
      toast.success('Payment method removed successfully');
      fetchPaymentMethods();
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingMethodId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access your wallet</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (showPaymentFlow && user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connect Bank Account</h1>
            <p className="text-muted-foreground mt-1">Set up Pre-Authorized Debit for easy rent payments</p>
          </div>
          <Button variant="outline" onClick={() => setShowPaymentFlow(false)}>
            Back
          </Button>
        </div>

        <RentPaymentFlow
          userId={user.id}
          propertyId=""
          landlordId=""
          rentAmount={0}
          dueDate=""
          onPaymentComplete={() => {
            setShowPaymentFlow(false);
            fetchPaymentMethods();
          }}
          onCancel={() => setShowPaymentFlow(false)}
          connectOnly={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your rent payments with Canadian Pre-Authorized Debit (PAD)</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("rent")}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === "rent"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pay Your Rent
        </button>
        <button
          onClick={() => setActiveTab("mortgage")}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === "mortgage"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pay Your Mortgage
        </button>
      </div>

      {/* Pay Your Rent Tab Content */}
      {activeTab === "rent" && (
        <div className="space-y-6">
          {/* Payment Methods Card - Collapsible */}
          {paymentMethods.length > 0 && (
            <Card>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  setIsPaymentMethodsOpen(!isPaymentMethodsOpen);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>Your connected bank accounts</CardDescription>
                    </div>
                  </div>
                  {isPaymentMethodsOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </CardHeader>
              {isPaymentMethodsOpen && (
                <CardContent className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium">{method.bank_name}</p>
                        <p className="text-sm text-gray-600">••••{method.last4}</p>
                        {method.is_default && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePaymentMethod(method.id);
                        }}
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
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPaymentFlow(true)}
                  >
                    Add Another Account
                  </Button>
                </CardContent>
              )}
            </Card>
          )}

          {paymentMethods.length === 0 && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  No Payment Methods
                </CardTitle>
                <CardDescription>Connect a bank account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowPaymentFlow(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Connect Bank Account
                </Button>
              </CardContent>
            </Card>
          )}
          {/* Rent Payment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Rent Payment
              </CardTitle>
              <CardDescription>Pay your monthly rent with low fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Monthly Rent</p>
                  <p className="text-2xl font-bold">${rentAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{new Date(dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <CreditCard className="h-4 w-4" />
                    Card Payment
                  </div>
                  <p className="text-lg font-semibold">$58.30 fee</p>
                  <p className="text-xs text-gray-500">2.9% + $0.30</p>
                </div>
                <div className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                    <Clock className="h-4 w-4" />
                    Bank Account (PAD)
                  </div>
                  <p className="text-lg font-semibold text-green-700">$20.25 fee</p>
                  <p className="text-xs text-green-600">Save $38.05!</p>
                </div>
              </div>

              <Button 
                onClick={() => setShowPaymentFlow(true)}
                className="w-full"
                size="lg"
              >
                Pay Rent Now
              </Button>
            </CardContent>
          </Card>
          
          {/* Financial Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No payment history yet. Make your first payment to see it here.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pay Your Mortgage Tab Content */}
      {activeTab === "mortgage" && (
        <div className="space-y-6">
          {/* PAD Payment Method Info */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Clock className="h-5 w-5" />
                Pre-Authorized Debit (PAD)
              </CardTitle>
              <CardDescription className="text-green-800">
                The only payment method available for mortgage payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">Low Fees</p>
                    <p className="text-sm text-green-800">Only 1% + $0.25 per transaction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">Automatic Payments</p>
                    <p className="text-sm text-green-800">Set up recurring payments for your mortgage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">Secure & Reliable</p>
                    <p className="text-sm text-green-800">Canadian banking standard for payments</p>
                  </div>
                </div>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-green-900">Your Connected Bank Accounts:</p>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-white">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{method.bank_name}</p>
                        <p className="text-sm text-gray-600">••••{method.last4}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_default && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                            Default
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
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
                    className="w-full bg-green-600 hover:bg-green-700 mt-4"
                    size="lg"
                  >
                    Make Mortgage Payment
                  </Button>
                </div>
              ) : (
                <div className="mt-6 p-4 border border-green-200 rounded-lg bg-white">
                  <p className="text-sm text-gray-600 mb-3">No bank account connected yet. Connect one to start making mortgage payments.</p>
                  <Button 
                    onClick={() => setShowPaymentFlow(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Connect Bank Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
