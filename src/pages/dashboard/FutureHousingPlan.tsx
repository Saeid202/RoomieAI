
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { findMatches } from "@/utils/matchingAlgorithm";
import { ProfileFormValues } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { HousingPlanForm } from "@/components/dashboard/housing-plan/HousingPlanForm";
import { HousingPlanList } from "@/components/dashboard/housing-plan/HousingPlanList";
import { RoommateMatches } from "@/components/dashboard/housing-plan/RoommateMatches";
import { useHousingPlans, HousingPlan } from "@/hooks/useHousingPlans";
import { useAuth } from "@/hooks/useAuth";

export default function FutureHousingPlan() {
  const [showRoommates, setShowRoommates] = useState(false);
  const [roommateMatches, setRoommateMatches] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<HousingPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { plans, isLoading, error, createPlan, updatePlan } = useHousingPlans();
  const { user } = useAuth();

  console.log("Auth user:", user);
  console.log("Housing plans:", plans);
  console.log("Loading state:", isLoading);
  console.log("Error:", error);

  const onSubmit = async (data: any) => {
    try {
      if (selectedPlan) {
        console.log("Updating plan:", selectedPlan.id, data);
        await updatePlan.mutateAsync({
          id: selectedPlan.id,
          moving_date: data.movingDate,
          desired_location: data.desiredLocation,
          budget: Number(data.budget),
          housing_type: data.housingType,
          additional_requirements: data.additionalRequirements
        });
      } else {
        console.log("Creating new plan with data:", data);
        await createPlan.mutateAsync({
          moving_date: data.movingDate,
          desired_location: data.desiredLocation,
          budget: Number(data.budget),
          housing_type: data.housingType,
          additional_requirements: data.additionalRequirements
        });
      }

      setIsFormOpen(false);

      const profileData: ProfileFormValues = {
        moveInDate: new Date(data.movingDate),
        preferredLocation: data.desiredLocation,
        budgetRange: [Number(data.budget) - 200, Number(data.budget) + 200],
        housingType: data.housingType,
        additionalComments: data.additionalRequirements,
        fullName: "",
        age: "",
        gender: "prefer-not-to-say",
        occupation: "",
        cleanliness: "somewhatTidy",
        hasPets: false,
        smoking: false,
        guestsOver: "occasionally",
        dailyRoutine: "mixed",
        workSchedule: "9AM-5PM",
        hobbies: [],
        importantRoommateTraits: []
      };

      const matches = findMatches(profileData);
      setRoommateMatches(matches);
      setShowRoommates(true);
      toast({
        title: selectedPlan ? "Plan updated!" : "Plan created!",
        description: "We've found some potential roommates based on your preferences.",
      });
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save housing plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: HousingPlan) => {
    console.log("Editing plan:", plan);
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent border-roomie-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Failed to load housing plans. Please try again later.</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
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
                  <HousingPlanForm onSubmit={onSubmit} initialData={selectedPlan} />
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">
                  You haven't created any housing plans yet. Use this section to plan and track your future housing needs and preferences.
                </p>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-roomie-purple hover:bg-roomie-purple/90">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Housing Plan</DialogTitle>
                    </DialogHeader>
                    <HousingPlanForm onSubmit={onSubmit} />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <HousingPlanList plans={plans} onEdit={handleEdit} />
            )}
          </CardContent>
        </Card>

        {showRoommates && roommateMatches.length > 0 && (
          <RoommateMatches matches={roommateMatches} />
        )}
      </div>
    </div>
  );
}
