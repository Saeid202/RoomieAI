
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CoOwnerRecommendations() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Co-Owner Investment Recommendations</h1>
      
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Recommended Co-Owners</CardTitle>
          <CardDescription>People who match your investment preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Recommendations Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Based on your co-owner profile, we'll show potential investment partners here.
              Please complete your profile to see matches.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
