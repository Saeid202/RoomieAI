
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, AlertCircle } from "lucide-react";
import { findMatches } from "@/utils/matchingAlgorithm";
import { ProfileFormValues } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { HousingPlanForm } from "@/components/dashboard/housing-plan/HousingPlanForm";
import { HousingPlanList } from "@/components/dashboard/housing-plan/HousingPlanList";
import { RoommateMatches } from "@/components/dashboard/housing-plan/RoommateMatches";
import { useHousingPlans, HousingPlan } from "@/hooks/useHousingPlans";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function FutureHousingPlan() {
  const [showRoommates, setShowRoommates] = useState(false);
  const [roommateMatches, setRoommateMatches] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<HousingPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { plans, isLoading, error, createPlan, updatePlan } = useHousingPlans();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  console.log("FutureHousingPlan component rendering with state:", {
    isAuthenticated: !!user,
    authLoading,
    plansLoading: isLoading,
    plansCount: plans?.length || 0,
    errorMessage: error ? (error instanceof Error ? error.message : String(error)) : null,
    showRoommates,
    isFormOpen,
    hasSelectedPlan: !!selectedPlan,
    currentRoute: window.location.pathname
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to auth page");
      toast({
        title: "Authentication required",
        description: "Please log in to view your housing plans",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, authLoading, navigate, toast]);

  const onSubmit = async (data: any) => {
    try {
      console.log("Form submitted with data:", data);
      
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

      // Create mock data for roommate matching
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

  // Display an authentication error message
  if ((!authLoading && !user) || (error && String(error).includes("JWT"))) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
        <Card className="mb-6 shadow-md">
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                You need to be logged in to view your housing plans.
              </p>
              <Button 
                className="bg-roomie-purple hover:bg-roomie-purple/90 px-6"
                onClick={() => navigate("/auth")}
              >
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-t-transparent border-roomie-purple rounded-full animate-spin"></div>
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
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-t-transparent border-roomie-purple rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">
                <p>Error loading housing plans. Please try again.</p>
                <p className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
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
