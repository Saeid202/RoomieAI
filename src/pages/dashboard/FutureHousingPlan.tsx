
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

export default function FutureHousingPlan() {
  const [plans, setPlans] = useState([]);
  const [showRoommates, setShowRoommates] = useState(false);
  const [roommateMatches, setRoommateMatches] = useState([]);
  const { toast } = useToast();

  const onSubmit = (data) => {
    const newPlan = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    setPlans([...plans, newPlan]);

    const profileData: ProfileFormValues = {
      moveInDate: new Date(data.movingDate),
      preferredLocation: data.desiredLocation,
      budgetRange: [Number(data.budget) - 200, Number(data.budget) + 200],
      housingType: data.housingType, // Changed from propertyType to housingType to match the ProfileFormValues type
      additionalNotes: data.additionalRequirements,
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

    try {
      const matches = findMatches(profileData);
      setRoommateMatches(matches);
      setShowRoommates(true);
      toast({
        title: "Plan created!",
        description: "We've found some potential roommates based on your preferences.",
      });
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        title: "Error",
        description: "Failed to find roommate matches. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center">
              Housing Plan Details
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-roomie-purple hover:bg-roomie-purple/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Housing Plan</DialogTitle>
                  </DialogHeader>
                  <HousingPlanForm onSubmit={onSubmit} />
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
                <Dialog>
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
              <HousingPlanList plans={plans} />
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
