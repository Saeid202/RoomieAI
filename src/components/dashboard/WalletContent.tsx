
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPreference } from "./types";

export function WalletContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your finances and transactions.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Your current balance and recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This feature is coming soon. You'll be able to track your payments, deposits, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
