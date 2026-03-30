import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Wallet, Clock, Building2, CheckCircle2, ChevronRight } from "lucide-react";
import {
  getLandlordPayments,
  calculatePaymentSummary,
  getPaymentStatusDisplay,
  getPaymentMethodDisplay,
  calculateExpectedPayoutDate,
  type LandlordPayment
} from "@/services/landlordPaymentService";
import { formatCurrency } from "@/services/feeCalculationService";
import { getPayoutStatus, type PayoutStatus } from "@/services/payoutService";

export default function LandlordPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<LandlordPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatus | null>(null);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    Promise.all([
      getLandlordPayments(user.id),
      getPayoutStatus(user.id),
    ])
      .then(([p, s]) => { setPayments(p); setPayoutStatus(s); })
      .catch(e => setError(e.message || 'Failed to load payments'))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-600">Please log in.</p></div>;

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4" />
        <p className="text-slate-600">Loading payments...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="px-6 py-8">
      <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
    </div>
  );

  const summary = calculatePaymentSummary(payments);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payment Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Track and manage rent payments from your tenants</p>
        </div>

        {/* Payout Account Banner */}
        {payoutStatus?.connected ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Payout Account Connected</p>
                <p className="text-green-700 text-xs">
                  {payoutStatus.bank_name && `${payoutStatus.bank_name} · `}
                  {payoutStatus.last4 ? `••••${payoutStatus.last4}` : 'Bank account active'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/landlord/payout-setup')}
              className="text-xs text-green-700 font-medium hover:text-green-900 flex items-center gap-1"
            >
              Update <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Set Up Payouts</p>
                <p className="text-amber-700 text-xs">Connect your bank account to receive rent payments</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/landlord/payout-setup')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              Set Up <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Balance Cards */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {[
            { label: 'Available Balance', value: summary.available_balance, sub: 'Ready for payout', icon: <Wallet className="h-5 w-5 text-white" />, grad: 'from-green-400 to-emerald-500' },
            { label: 'Pending', value: summary.pending_balance, sub: 'Processing payments', icon: <TrendingUp className="h-5 w-5 text-white" />, grad: 'from-amber-400 to-orange-500' },
            { label: 'This Month', value: summary.total_this_month, sub: 'Total received', icon: <DollarSign className="h-5 w-5 text-white" />, grad: 'from-purple-400 to-pink-500' },
          ].map(c => (
            <Card key={c.label} className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{c.label}</CardTitle>
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center`}>{c.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(c.value)}</div>
                <p className="text-sm text-slate-500 mt-1">{c.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment History */}
        {payments.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 mb-6">
                <DollarSign className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Payments Yet</h3>
              <p className="text-slate-600 max-w-md">When tenants pay rent, you'll see their payments here.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-xl font-semibold text-slate-900">Payment History</CardTitle>
              <CardDescription>Recent rent payments from your tenants</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {payments.map(p => {
                const sd = getPaymentStatusDisplay(p.status);
                const pm = getPaymentMethodDisplay(p.payment_method_type);
                const ep = calculateExpectedPayoutDate(p.created_at, p.payment_method_type, p.expected_clear_date);
                return (
                  <div key={p.id} className="flex items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all bg-white">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-slate-900 text-lg">{p.tenant_name}</p>
                        <Badge variant={sd.variant} className="font-medium">{sd.label}</Badge>
                        <Badge variant="outline" className="border-slate-300 text-slate-700">{pm}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{p.property_address}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          Paid: {new Date(p.created_at).toLocaleDateString()} ·{' '}
                          {p.payment_cleared_at
                            ? `Paid out: ${new Date(p.payment_cleared_at).toLocaleDateString()}`
                            : `Expected: ${ep}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <p className="font-bold text-2xl text-slate-900">{formatCurrency(p.net_amount)}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Rent: {formatCurrency(p.amount)} - Fee: {formatCurrency(p.transaction_fee)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
