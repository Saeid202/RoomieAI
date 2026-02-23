import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DigitalWallet() {
  const { user } = useAuth();
  
  // For testing: Use current user as landlord so payment appears in landlord dashboard
  // In production, fetch actual property and landlord from lease/rental agreement
  const mockPropertyId = "test-property-001";
  const mockLandlordId = user?.id || ""; // Use your own ID to see payment in landlord view
  const mockRentAmount = 2000;
  const mockDueDate = "2027-03-01";

  const handlePaymentComplete = (paymentId: string) => {
    console.log('Payment completed:', paymentId);
    // In production, refresh payment history or navigate to confirmation page
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-full px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Digital Wallet</h1>
        <p className="text-gray-600 mt-2">
          Manage your rent payments with Canadian Pre-Authorized Debit (PAD)
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-800" />
        <AlertDescription className="text-blue-800">
          Save money with Canadian PAD! Pay only 1% + $0.25 per transaction instead of 2.9% + $0.30 with cards.
          That's ~$38 savings per month on $2,000 rent.
        </AlertDescription>
      </Alert>

      {/* Payment Flow */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Pay Your Rent</CardTitle>
          <CardDescription className="text-gray-600">
            Choose your payment method and complete your rent payment securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RentPaymentFlow 
            userId={user.id}
            propertyId={mockPropertyId}
            landlordId={mockLandlordId}
            rentAmount={mockRentAmount}
            dueDate={mockDueDate}
            onPaymentComplete={handlePaymentComplete}
          />
        </CardContent>
      </Card>

      {/* Test Credentials Card */}
      <Card className="border-dashed bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-700">Test Mode - Stripe Test Credentials</CardTitle>
          <CardDescription className="text-xs text-gray-600">
            Use these test bank account details for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-700">✅ Successful Payment</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                <li>Account Holder: Test User</li>
                <li>Institution: 000</li>
                <li>Transit: 00022</li>
                <li>Account: 000123456789</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-red-700">❌ Failed Payment Tests</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                <li>Insufficient Funds: 000111111116</li>
                <li>Account Closed: 000222222227</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
