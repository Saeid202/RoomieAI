
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Home, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HousingPlanForm } from "./HousingPlanForm";

type HousingPlan = {
  id: string;
  moving_date: string;
  desired_location: string;
  budget: number;
  housing_type: string;
  additional_requirements?: string;
  created_at: string;
};

type HousingPlanListProps = {
  plans: HousingPlan[];
  onEdit: (plan: HousingPlan) => void;
};

export function HousingPlanList({ plans, onEdit }: HousingPlanListProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="bg-white shadow hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              {plan.desired_location}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Moving date: {new Date(plan.moving_date).toLocaleDateString()}
              </p>
              <p className="text-sm flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                Budget: ${plan.budget}/month
              </p>
              <p className="text-sm flex items-center">
                <Home className="mr-2 h-4 w-4 text-gray-500" />
                Housing type: {plan.housing_type}
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
