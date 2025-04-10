
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LegalAssistant() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Legal Assistant</h1>
      <p className="text-muted-foreground">Get legal guidance and assistance for housing matters.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Ask Legal Questions</CardTitle>
          <CardDescription>Get AI-powered legal guidance</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is where you can ask questions and get AI-powered legal guidance related to housing, rentals, and co-ownership.</p>
        </CardContent>
      </Card>
    </div>
  );
}
