
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WalletContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
      <p className="text-muted-foreground">Connect your bank account and manage your finances.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Connect Bank Account</CardTitle>
          <CardDescription>Securely link your financial information</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This feature allows you to connect your bank account to facilitate payments and financial transactions within the app.</p>
        </CardContent>
      </Card>
    </div>
  );
}
