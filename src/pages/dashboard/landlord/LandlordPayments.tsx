import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, DollarSign, TrendingUp, Wallet, Clock, Building2, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, ArrowRight, X, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import {
  getLandlordPayments,
  calculatePaymentSummary,
  getPaymentStatusDisplay,
  getPaymentMethodDisplay,
  calculateExpectedPayoutDate,
  type LandlordPayment
} from "@/services/landlordPaymentService";
import { formatCurrency } from "@/services/feeCalculationService";
import {
  getStripeConnectStatus,
  refreshStripeConnectStatus,
  getStripeLoginLink,
  attachBankAccount,
  type StripeConnectStatus,
  type StripeOnboardingStatus
} from "@/services/stripeConnectService";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// ── Bank Account Connection Card ─────────────────────────────────────────────

function statusConfig(status: StripeOnboardingStatus) {
  switch (status) {
    case 'ready':
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        badge: <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Connected</Badge>,
        title: 'Bank Account Connected',
        description: 'Your Stripe account is active. Payouts are enabled and will be deposited automatically.',
        cardClass: 'border-emerald-200 bg-emerald-50/40',
      };
    case 'in_progress':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        badge: <Badge className="bg-amber-100 text-amber-700 border-amber-200">In Progress</Badge>,
        title: 'Finish Setting Up Your Bank Account',
        description: 'Your Stripe onboarding is incomplete. Click below to continue and enable payouts.',
        cardClass: 'border-amber-200 bg-amber-50/40',
      };
    case 'restricted':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        badge: <Badge className="bg-red-100 text-red-700 border-red-200">Action Required</Badge>,
        title: 'Account Restricted — Action Required',
        description: 'Stripe requires additional information to enable payouts. Click below to resolve.',
        cardClass: 'border-red-200 bg-red-50/40',
      };
    default:
      return {
        icon: <Building2 className="h-5 w-5 text-purple-600" />,
        badge: <Badge className="bg-slate-100 text-slate-600 border-slate-200">Not Connected</Badge>,
        title: 'Connect Your Bank Account',
        description: 'Connect your bank account via Stripe to receive automatic payouts when tenants pay rent.',
        cardClass: 'border-purple-200 bg-purple-50/40',
      };
  }
}

interface BankAccountCardProps {
  connectStatus: StripeConnectStatus | null;
  loadingConnect: boolean;
  onConnect: () => void;
  onRefresh: () => void;
  onManage: () => void;
  showEmbedded: boolean;
  onCloseEmbedded: () => void;
  onOnboardingComplete: () => void;
}

function BankAccountForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    account_holder_name: '',
    transit_number: '',
    institution_number: '',
    account_number: '',
    account_number_confirm: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.account_number !== form.account_number_confirm) {
      toast.error('Account numbers do not match');
      return;
    }
    if (form.transit_number.length !== 5) {
      toast.error('Transit number must be 5 digits');
      return;
    }
    if (form.institution_number.length !== 3) {
      toast.error('Institution number must be 3 digits');
      return;
    }
    setSubmitting(true);
    try {
      await attachBankAccount({
        account_holder_name: form.account_holder_name,
        transit_number: form.transit_number,
        institution_number: form.institution_number,
        account_number: form.account_number,
      });
      toast.success('Bank account connected successfully');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect bank account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Canadian bank diagram hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <p className="font-semibold mb-1">Where to find your banking info:</p>
        <p>On a cheque: <span className="font-mono">Transit (5 digits) — Institution (3 digits) — Account number</span></p>
        <p className="mt-1">Example: <span className="font-mono">12345 — 004 — 1234567</span></p>
      </div>

      <div>
        <Label htmlFor="holder">Account Holder Name</Label>
        <Input
          id="holder"
          placeholder="Full legal name"
          value={form.account_holder_name}
          onChange={e => set('account_holder_name', e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="transit">Transit Number</Label>
          <Input
            id="transit"
            placeholder="5 digits"
            maxLength={5}
            value={form.transit_number}
            onChange={e => set('transit_number', e.target.value.replace(/\D/g, ''))}
            required
            className="mt-1 font-mono"
          />
        </div>
        <div>
          <Label htmlFor="institution">Institution Number</Label>
          <Input
            id="institution"
            placeholder="3 digits"
            maxLength={3}
            value={form.institution_number}
            onChange={e => set('institution_number', e.target.value.replace(/\D/g, ''))}
            required
            className="mt-1 font-mono"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="account">Account Number</Label>
        <Input
          id="account"
          placeholder="7–12 digits"
          value={form.account_number}
          onChange={e => set('account_number', e.target.value.replace(/\D/g, ''))}
          required
          className="mt-1 font-mono"
        />
      </div>

      <div>
        <Label htmlFor="account_confirm">Confirm Account Number</Label>
        <Input
          id="account_confirm"
          placeholder="Re-enter account number"
          value={form.account_number_confirm}
          onChange={e => set('account_number_confirm', e.target.value.replace(/\D/g, ''))}
          required
          className="mt-1 font-mono"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {submitting ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Connecting...</>
          ) : (
            <><Landmark className="h-4 w-4 mr-2" />Connect Bank Account</>
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Your banking information is encrypted and processed securely via Stripe.
      </p>
    </form>
  );
}

function BankAccountCard({ connectStatus, loadingConnect, onConnect, onRefresh, onManage, showEmbedded, onCloseEmbedded, onOnboardingComplete }: BankAccountCardProps) {
  const status = connectStatus?.onboarding_status ?? 'not_started';
  const cfg = statusConfig(status);

  return (
    <>
      <Card className={`border-2 shadow-sm mb-6 ${cfg.cardClass}`}>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{cfg.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900">{cfg.title}</p>
                  {cfg.badge}
                </div>
                <p className="text-sm text-slate-600 max-w-lg">{cfg.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {status === 'ready' ? (
                <>
                  <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingConnect} className="gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingConnect ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={onManage} disabled={loadingConnect} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Manage in Stripe
                  </Button>
                </>
              ) : (
                <>
                  {connectStatus?.stripe_account_id && (
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={loadingConnect} className="gap-1.5">
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingConnect ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onConnect}
                    disabled={loadingConnect}
                    className="gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {loadingConnect ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    {status === 'not_started' ? 'Connect Bank Account' : 'Continue Setup'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Native Bank Account Form Modal */}
      {showEmbedded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Connect Your Bank Account</h2>
                  <p className="text-xs text-slate-500">Canadian bank accounts only (CAD)</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onCloseEmbedded} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <BankAccountForm onSuccess={onOnboardingComplete} onCancel={onCloseEmbedded} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LandlordPayments() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<LandlordPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(null);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [showEmbedded, setShowEmbedded] = useState(false);

  const fetchConnectStatus = useCallback(async (forceRefresh = false) => {
    try {
      const status = forceRefresh
        ? await refreshStripeConnectStatus()
        : await getStripeConnectStatus();
      setConnectStatus(status);
    } catch (err) {
      console.error('Error fetching connect status:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const load = async () => {
      try {
        setIsLoading(true);
        const [data] = await Promise.all([
          getLandlordPayments(user.id),
          fetchConnectStatus(),
        ]);
        setPayments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user, fetchConnectStatus]);

  // Handle return from Stripe onboarding (keep for backward compat with any existing sessions)
  useEffect(() => {
    const onboarding = searchParams.get('onboarding');
    if (onboarding === 'complete') {
      toast.success('Bank account connected! Refreshing status...');
      fetchConnectStatus(true);
    } else if (onboarding === 'refresh') {
      toast.info('Session expired. Please try again.');
    }
  }, [searchParams, fetchConnectStatus]);

  const handleConnect = () => {
    setShowEmbedded(true);
  };

  const handleOnboardingComplete = async () => {
    setShowEmbedded(false);
    toast.success('Setup complete! Refreshing your account status...');
    await fetchConnectStatus(true);
  };

  const handleManage = async () => {
    setLoadingConnect(true);
    try {
      const url = await getStripeLoginLink();
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Failed to open Stripe dashboard');
    } finally {
      setLoadingConnect(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingConnect(true);
    try {
      await fetchConnectStatus(true);
      toast.success('Account status refreshed');
    } catch {
      toast.error('Failed to refresh status');
    } finally {
      setLoadingConnect(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Please log in to view payments.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full px-6 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const summary = calculatePaymentSummary(payments);

  const sharedBankCard = (
    <BankAccountCard
      connectStatus={connectStatus}
      loadingConnect={loadingConnect}
      onConnect={handleConnect}
      onRefresh={handleRefresh}
      onManage={handleManage}
      showEmbedded={showEmbedded}
      onCloseEmbedded={() => setShowEmbedded(false)}
      onOnboardingComplete={handleOnboardingComplete}
    />
  );

  const balanceCards = (
    <div className="grid gap-6 lg:grid-cols-3 mb-8">
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Available Balance</CardTitle>
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
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending</CardTitle>
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
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">This Month</CardTitle>
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payment Dashboard
          </h1>
          <p className="text-slate-600 mt-2">Track and manage rent payments from your tenants</p>
        </div>

        {/* Bank Account Connection — always visible */}
        {sharedBankCard}

        {/* Balance Cards */}
        {balanceCards}

        {payments.length === 0 ? (
          <>
            <Card className="border-2 border-dashed border-slate-300 bg-white shadow-sm mb-8">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 mb-6">
                  <DollarSign className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Payments Yet</h3>
                <p className="text-slate-600 max-w-md text-base">
                  When tenants pay rent, you'll see their payments here. Payments are automatically
                  transferred to your connected bank account.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-900">How Payouts Work</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {['Tenants pay rent through the platform', 'Payments are processed securely via Stripe', 'Funds are automatically transferred to your bank', 'You receive email notifications for each payment'].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">{i + 1}</span>
                      </div>
                      <p className="text-slate-700">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-900">Payment Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div><p className="font-medium text-slate-900">PAD (Bank Transfer)</p><p className="text-sm text-slate-600">8-10 business days</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div><p className="font-medium text-slate-900">Credit/Debit Card</p><p className="text-sm text-slate-600">2-3 business days</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div><p className="font-medium text-slate-900">Platform Fee</p><p className="text-sm text-slate-600">Deducted automatically</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div><p className="font-medium text-slate-900">No Action Required</p><p className="text-sm text-slate-600">Everything is automated</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-slate-200 shadow-sm">
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
                          <Badge variant={statusDisplay.variant} className="font-medium">{statusDisplay.label}</Badge>
                          <Badge variant="outline" className="border-slate-300 text-slate-700">{paymentMethod}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{payment.property_address}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span>
                            Paid: {paidDate} •{' '}
                            {payment.status === 'processing' || payment.status === 'initiated'
                              ? `Expected payout: ${expectedPayout}`
                              : payment.payment_cleared_at
                              ? `Paid out: ${new Date(payment.payment_cleared_at).toLocaleDateString()}`
                              : `Expected payout: ${expectedPayout}`}
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
        )}
      </div>
    </div>
  );
}
