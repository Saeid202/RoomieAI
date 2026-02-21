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
import { usePlanAheadMatches } from "@/hooks/usePlanAheadMatches";
import PlanAheadMatchesList from "@/components/dashboard/plan-ahead/PlanAheadMatchesList";

export default function PlanAheadMatchingPage() {
  useEffect(() => {
    document.title = "Plan Ahead Matching | Roomi AI";
  }, []);

  const { matches, loading: matchesLoading, hasMatches } = usePlanAheadMatches();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg orange-purple-gradient">
            <Bot className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gradient">
              Roomi AI • Plan Ahead
            </h1>
            <p className="text-sm text-muted-foreground">Find your perfect move and roommate</p>
          </div>
        </div>
      </header>

      {/* Horizontal Plan Your Move Section */}
      <section className="mb-8">
        <Card className="border-orange-200/30 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-gradient">Plan your move</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tell Roomi AI your preferences. We'll surface great roommate and
              property matches below.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <PlanAheadForm />
          </CardContent>
        </Card>
      </section>

      {/* AI Matches Section */}
      <main className="space-y-6">
        <Card className="border-purple-200/30 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-gradient">Your AI Matches</CardTitle>
            <CardDescription className="text-muted-foreground">
              This space will populate with compatible roommates and
              opportunities as you set your preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasMatches ? (
              <PlanAheadMatchesList matches={matches} />
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-medium text-foreground">
                  {matchesLoading ? "Loading matches…" : "Start planning to see your matches"}
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Fill out the form above. Roomi AI will analyze your
                  lifestyle, timelines, and preferences to curate ideal
                  matches here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200/30 shadow-lg">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-gradient">How Roomi AI helps</CardTitle>
            <CardDescription className="text-muted-foreground">
              Smart matching designed around your future move
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200/30 bg-white p-4 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-orange-600 mb-3">AI-Powered Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Our algorithm pairs roommates based on lifestyle, values,
                  schedules, and preferences for the perfect match.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/30 bg-white p-4 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-purple-600 mb-3">Smart Move-In Coordination</h3>
                <p className="text-sm text-muted-foreground">
                  Plan your relocation in advance with our Plan Ahead system
                  that matches you with future availability.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/30 bg-white p-4 hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-gradient mb-3">Automated Lease Agreements</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and e-sign legally compliant leases in minutes—no
                  lawyers or paperwork required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
