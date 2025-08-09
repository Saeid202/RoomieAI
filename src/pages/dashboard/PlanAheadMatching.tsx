import React, { useEffect, useState } from "react";
import { Bot, Brain } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlanAheadForm from "@/components/dashboard/plan-ahead/PlanAheadForm";

export default function PlanAheadMatchingPage() {
  useEffect(() => {
    document.title = "Plan Ahead Matching | Roomi AI";
  }, []);

  // Placeholder state for future AI results integration
  const [hasResults] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            Roomi AI • Plan Ahead
          </h1>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sticky compact form in the side column */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Plan your move</CardTitle>
              <CardDescription>
                Tell Roomi AI your preferences. We’ll surface great roommate and
                property matches here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh] pr-2">
                <PlanAheadForm />
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* Spacious canvas for AI results */}
        <section className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your AI Matches</CardTitle>
              <CardDescription>
                This space will populate with compatible roommates and
                opportunities as you set your preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasResults ? (
                // ... keep existing code (results grid rendering when integrated)
                <div className="text-muted-foreground">Results coming soon…</div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-medium text-foreground">
                    Start planning to see your matches
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Fill out the form on the right. Roomi AI will analyze your
                    lifestyle, timelines, and preferences to curate ideal
                    matches here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Roomi AI helps</CardTitle>
              <CardDescription>
                Smart matching designed around your future move
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium text-foreground">AI-Powered Matching</h3>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">
                    Our algorithm pairs roommates based on lifestyle, values,
                    schedules, and preferences for the perfect match.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium text-foreground">Smart Move-In Coordination</h3>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">
                    Plan your relocation in advance with our Plan Ahead system
                    that matches you with future availability.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-medium text-foreground">Automated Lease Agreements</h3>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">
                    Generate and e-sign legally compliant leases in minutes—no
                    lawyers or paperwork required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
