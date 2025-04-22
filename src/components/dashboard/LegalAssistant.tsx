
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LegalAssistant() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Legal Assistant</h1>
      <p className="text-muted-foreground">Get legal guidance and assistance for housing matters.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Ask Legal Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
            Coming soon: AI-powered legal guidance for housing, rentals, and co-ownership matters
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
