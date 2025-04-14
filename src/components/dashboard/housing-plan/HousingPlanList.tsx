
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Home, Pencil } from "lucide-react";
import { HousingPlan } from "@/hooks/useHousingPlans";

type HousingPlanListProps = {
  plans: HousingPlan[];
  onEdit: (plan: HousingPlan) => void;
};

export function HousingPlanList({ plans, onEdit }: HousingPlanListProps) {
  console.log("HousingPlanList render with plans:", plans);
  
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No housing plans found. Create your first plan!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="bg-white shadow hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              {plan.desired_location || 'No location specified'}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(plan)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Moving date: {plan.moving_date ? new Date(plan.moving_date).toLocaleDateString() : 'Not specified'}
              </p>
              <p className="text-sm flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                Budget: ${plan.budget ? plan.budget.toString() : '0'}/month
              </p>
              <p className="text-sm flex items-center">
                <Home className="mr-2 h-4 w-4 text-gray-500" />
                Housing type: {plan.housing_type || 'Not specified'}
              </p>
              {plan.additional_requirements && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Notes:</span> {plan.additional_requirements}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
