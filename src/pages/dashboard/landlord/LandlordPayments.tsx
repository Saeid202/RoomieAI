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
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view payments.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
      <div className="container mx-auto p-6 max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Payment Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage rent payments from your tenants
          </p>
        </div>

        {/* Setup Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Connect your bank account to receive automatic payouts when tenants pay rent. 
            PAD payments take 8-10 business days, card payments take 2-3 days.
          </AlertDescription>
        </Alert>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.available_balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for payout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.pending_balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">Processing payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total_this_month)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total received</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State Card */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Payments Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              When tenants pay rent, you'll see their payments here. Payments are automatically 
              transferred to your connected bank account.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Properties
              </Button>
              <Button onClick={() => setShowPayoutModal(true)}>
                Connect Payout Method
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payout Setup Modal */}
        <PayoutMethodSetupModal
          open={showPayoutModal}
          onOpenChange={setShowPayoutModal}
          onSuccess={handlePayoutSuccess}
        />

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How Payouts Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Tenants pay rent through the platform</p>
              <p>• Payments are processed securely via Stripe</p>
              <p>• Funds are automatically transferred to your bank</p>
              <p>• You receive email notifications for each payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• PAD (Bank Transfer): 8-10 business days</p>
              <p>• Credit/Debit Card: 2-3 business days</p>
              <p>• Platform fee: Deducted automatically</p>
              <p>• No action required from you</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render payments
  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payment Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage rent payments from your tenants
        </p>
      </div>

      {/* Setup Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Payments are automatically transferred to your connected bank account. 
          PAD payments take 8-10 business days, card payments take 2-3 days.
        </AlertDescription>
      </Alert>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.available_balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.pending_balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_this_month)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total received</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent rent payments from your tenants</CardDescription>
        </CardHeader>
        <CardContent>
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{payment.tenant_name}</p>
                      <Badge variant={statusDisplay.variant}>
                        {statusDisplay.label}
                      </Badge>
                      <Badge variant="outline">{paymentMethod}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.property_address}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
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
                  <div className="text-right ml-4">
                    <p className="font-bold text-lg">{formatCurrency(payment.net_amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Rent: {formatCurrency(payment.amount)} - Fee: {formatCurrency(payment.transaction_fee)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How Payouts Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Tenants pay rent through the platform</p>
            <p>• Payments are processed securely via Stripe</p>
            <p>• Funds are automatically transferred to your bank</p>
            <p>• You receive email notifications for each payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• PAD (Bank Transfer): 8-10 business days</p>
            <p>• Credit/Debit Card: 2-3 business days</p>
            <p>• Platform fee: Deducted automatically</p>
            <p>• No action required from you</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
