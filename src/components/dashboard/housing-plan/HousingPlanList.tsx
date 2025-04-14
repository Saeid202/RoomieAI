
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Home } from "lucide-react";

type HousingPlan = {
  id: string;
  movingDate: string;
  desiredLocation: string;
  budget: string;
  housingType: string;
  additionalRequirements?: string;
  createdAt: string;
};

type HousingPlanListProps = {
  plans: HousingPlan[];
};

export function HousingPlanList({ plans }: HousingPlanListProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="bg-white shadow hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{plan.desiredLocation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Moving date: {new Date(plan.movingDate).toLocaleDateString()}
              </p>
              <p className="text-sm flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                Budget: ${plan.budget}/month
              </p>
              <p className="text-sm flex items-center">
                <Home className="mr-2 h-4 w-4 text-gray-500" />
                Housing type: {plan.housingType}
              </p>
              {plan.additionalRequirements && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Notes:</span> {plan.additionalRequirements}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
