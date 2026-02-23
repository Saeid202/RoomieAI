import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, DollarSign, TrendingUp, Wallet, ArrowUpRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { 
  getLandlordPayments, 
  calculatePaymentSummary,
  getPaymentStatusDisplay,
  getPaymentMethodDisplay,
  calculateExpectedPayoutDate,
  type LandlordPayment 
} from "@/services/landlordPaymentService";
import { formatCurrency } from "@/services/feeCalculationService";
import { PayoutMethodSetupModal } from "@/components/landlord/PayoutMethodSetupModal";

export default function LandlordPayments() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<LandlordPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getLandlordPayments(user.id);
        setPayments(data);
      } catch (err: any) {
        console.error('Error loading payments:', err);
        setError(err.message || 'Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Please log in to view payments.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-full px-6 py-8">
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const summary = calculatePaymentSummary(payments);

  const handlePayoutSuccess = () => {
    // Refresh payments after payout method is connected
    if (user) {
      getLandlordPayments(user.id).then(setPayments);
    }
  };

  // Empty state - no payments yet
  if (payments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-full px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Payment Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Track and manage rent payments from your tenants
            </p>
          </div>

          {/* Setup Alert */}
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-slate-700">
              Connect your bank account to receive automatic payouts when tenants pay rent. 
              PAD payments take 8-10 business days, card payments take 2-3 days.
            </AlertDescription>
          </Alert>

          {/* Balance Cards - Left Aligned */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Available Balance
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary.available_balance)}</div>
                <p className="text-sm text-slate-500 mt-1">Ready for payout</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Pending
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary.pending_balance)}</div>
                <p className="text-sm text-slate-500 mt-1">Processing payments</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    This Month
                  </CardTitle>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary.total_this_month)}</div>
                <p className="text-sm text-slate-500 mt-1">Total received</p>
              </CardContent>
            </Card>
          </div>

          {/* Empty State Card */}
          <Card className="border-2 border-dashed border-slate-300 bg-white shadow-sm mb-8">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 mb-6">
                <DollarSign className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Payments Yet</h3>
              <p className="text-slate-600 mb-8 max-w-md text-base">
                When tenants pay rent, you'll see their payments here. Payments are automatically 
                transferred to your connected bank account.
              </p>
              <Button 
                onClick={() => setShowPayoutModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Connect Payout Method
              </Button>
            </CardContent>
          </Card>

          {/* Payout Setup Modal */}
          <PayoutMethodSetupModal
            open={showPayoutModal}
            onOpenChange={setShowPayoutModal}
            onSuccess={handlePayoutSuccess}
          />

          {/* Info Cards - Left Aligned */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-lg font-semibold text-slate-900">How Payouts Work</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                    <p className="text-slate-700">Tenants pay rent through the platform</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <p className="text-slate-700">Payments are processed securely via Stripe</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">3</span>
                    </div>
                    <p className="text-slate-700">Funds are automatically transferred to your bank</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">4</span>
                    </div>
                    <p className="text-slate-700">You receive email notifications for each payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-lg font-semibold text-slate-900">Payment Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">PAD (Bank Transfer)</p>
                      <p className="text-sm text-slate-600">8-10 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Credit/Debit Card</p>
                      <p className="text-sm text-slate-600">2-3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Platform Fee</p>
                      <p className="text-sm text-slate-600">Deducted automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">No Action Required</p>
                      <p className="text-sm text-slate-600">Everything is automated</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render payments
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-full px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payment Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Track and manage rent payments from your tenants
          </p>
        </div>

        {/* Setup Alert */}
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-slate-700">
            Payments are automatically transferred to your connected bank account. 
            PAD payments take 8-10 business days, card payments take 2-3 days.
          </AlertDescription>
        </Alert>

        {/* Balance Cards - Left Aligned */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Available Balance
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary.available_balance)}</div>
              <p className="text-sm text-slate-500 mt-1">Ready for payout</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Pending
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary.pending_balance)}</div>
              <p className="text-sm text-slate-500 mt-1">Processing payments</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  This Month
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary.total_this_month)}</div>
              <p className="text-sm text-slate-500 mt-1">Total received</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="border-slate-200 shadow-sm mb-8">
          <CardHeader className="border-b border-slate-100 bg-slate-50">
            <CardTitle className="text-xl font-semibold text-slate-900">Payment History</CardTitle>
            <CardDescription className="text-slate-600">Recent rent payments from your tenants</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {payments.map((payment) => {
                const statusDisplay = getPaymentStatusDisplay(payment.status);
                const paymentMethod = getPaymentMethodDisplay(payment.payment_method_type);
                const expectedPayout = calculateExpectedPayoutDate(
                  payment.created_at,
                  payment.payment_method_type,
                  payment.expected_clear_date
                );
                const paidDate = new Date(payment.created_at).toLocaleDateString();

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all bg-white"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-slate-900 text-lg">{payment.tenant_name}</p>
                        <Badge 
                          variant={statusDisplay.variant}
                          className="font-medium"
                        >
                          {statusDisplay.label}
                        </Badge>
                        <Badge variant="outline" className="border-slate-300 text-slate-700">
                          {paymentMethod}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{payment.property_address}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          Paid: {paidDate} • 
                          {payment.status === 'processing' || payment.status === 'initiated'
                            ? ` Expected payout: ${expectedPayout}`
                            : payment.payment_cleared_at
                            ? ` Paid out: ${new Date(payment.payment_cleared_at).toLocaleDateString()}`
                            : ` Expected payout: ${expectedPayout}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <p className="font-bold text-2xl text-slate-900">{formatCurrency(payment.net_amount)}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Rent: {formatCurrency(payment.amount)} - Fee: {formatCurrency(payment.transaction_fee)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Cards - Left Aligned */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-semibold text-slate-900">How Payouts Work</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <p className="text-slate-700">Tenants pay rent through the platform</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <p className="text-slate-700">Payments are processed securely via Stripe</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <p className="text-slate-700">Funds are automatically transferred to your bank</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">4</span>
                  </div>
                  <p className="text-slate-700">You receive email notifications for each payment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg font-semibold text-slate-900">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">PAD (Bank Transfer)</p>
                    <p className="text-sm text-slate-600">8-10 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Credit/Debit Card</p>
                    <p className="text-sm text-slate-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">Platform Fee</p>
                    <p className="text-sm text-slate-600">Deducted automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">No Action Required</p>
                    <p className="text-sm text-slate-600">Everything is automated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
