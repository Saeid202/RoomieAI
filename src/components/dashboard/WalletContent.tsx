
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, CreditCard, Clock } from "lucide-react";

export function WalletContent() {
  const { user } = useAuth();
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // Demo data - replace with actual data from your database
  const rentAmount = 2000;
  const dueDate = new Date(new Date().setDate(1)).toISOString().split('T')[0]; // First of month
  const propertyId = "demo-property-id"; // Replace with actual property ID
  const landlordId = "demo-landlord-id"; // Replace with actual landlord ID

  if (showPaymentFlow && user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pay Rent</h1>
            <p className="text-muted-foreground mt-1">Choose your payment method and complete your rent payment</p>
          </div>
        </div>

        <RentPaymentFlow
          userId={user.id}
          propertyId={propertyId}
          landlordId={landlordId}
          rentAmount={rentAmount}
          dueDate={dueDate}
          onPaymentComplete={(paymentId) => {
            console.log('Payment completed:', paymentId);
            setShowPaymentFlow(false);
          }}
          onCancel={() => setShowPaymentFlow(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your finances and transactions.</p>
        </div>
      </div>

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
  );
}
