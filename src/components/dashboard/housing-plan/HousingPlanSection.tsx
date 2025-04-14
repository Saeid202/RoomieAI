
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { HousingPlan } from "@/hooks/useHousingPlans";
import { HousingPlanForm } from "./HousingPlanForm";
import { HousingPlanList } from "./HousingPlanList";
import { LoadingState } from "./LoadingState";

interface HousingPlanSectionProps {
  isLoading: boolean;
  error: unknown;
  plans: HousingPlan[];
  onSavePlan: (data: any) => Promise<void>;
  selectedPlan: HousingPlan | null;
  onEdit: (plan: HousingPlan) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  setSelectedPlan: (plan: HousingPlan | null) => void;
}

export function HousingPlanSection({ 
  isLoading, 
  error, 
  plans, 
  onSavePlan, 
  selectedPlan, 
  onEdit,
  isFormOpen,
  setIsFormOpen,
  setSelectedPlan
}: HousingPlanSectionProps) {
  return (
    <Card className="mb-6 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          Housing Plan Details
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-roomie-purple hover:bg-roomie-purple/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedPlan ? 'Edit Housing Plan' : 'Create Housing Plan'}
                </DialogTitle>
              </DialogHeader>
              <HousingPlanForm onSubmit={onSavePlan} initialData={selectedPlan} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <p>Error loading housing plans. Please try again.</p>
            <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : (
          <HousingPlanList plans={plans} onEdit={onEdit} />
        )}
      </CardContent>
    </Card>
  );
}
