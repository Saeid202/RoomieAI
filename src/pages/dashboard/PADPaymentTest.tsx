import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";

export default function PADPaymentTest() {
  // Mock rental data for testing
  const mockRental = {
    id: "test-rental-1",
    monthlyRent: 2000,
    dueDate: "2027-03-01",
    landlordId: "test-landlord",
    propertyAddress: "123 Test Street, Toronto, ON"
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Canadian PAD Payment Test</CardTitle>
          <CardDescription>
            Test the Canadian Pre-Authorized Debit payment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RentPaymentFlow rental={mockRental} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test Bank Account Details</CardTitle>
          <CardDescription>Use these Stripe test credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Successful Payment:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Account Holder Name: Test User</li>
              <li>Institution Number: 000</li>
              <li>Transit Number: 00022</li>
              <li>Account Number: 000123456789</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Failed Payment (Insufficient Funds):</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Account Number: 000111111116</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
