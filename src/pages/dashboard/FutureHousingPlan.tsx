
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { findMatches } from "@/utils/matchingAlgorithm";
import { ProfileFormValues } from "@/types/profile";
import { HousingPlan, useHousingPlans } from "@/hooks/useHousingPlans";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { RoommateMatches } from "./housing-plan/RoommateMatches";
import { AuthError } from "@/components/dashboard/housing-plan/AuthError";
import { LoadingState } from "@/components/dashboard/housing-plan/LoadingState";
import { HousingPlanSection } from "@/components/dashboard/housing-plan/HousingPlanSection";

export default function FutureHousingPlan() {
  const [showRoommates, setShowRoommates] = useState(false);
  const [roommateMatches, setRoommateMatches] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<HousingPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const { plans, isLoading, error, createPlan, updatePlan } = useHousingPlans();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
        await updatePlan.mutateAsync({
          id: selectedPlan.id,
          moving_date: data.movingDate,
          desired_location: data.desiredLocation,
          budget: Number(data.budget),
          housing_type: data.housingType,
          additional_requirements: data.additionalRequirements
        });
      } else {
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

  if ((!authLoading && !user) || (error && String(error).includes("JWT"))) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
        <AuthError />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <HousingPlanSection
          isLoading={isLoading}
          error={error}
          plans={plans}
          onSavePlan={onSubmit}
          selectedPlan={selectedPlan}
          onEdit={handleEdit}
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          setSelectedPlan={setSelectedPlan}
        />

        {showRoommates && roommateMatches.length > 0 && (
          <RoommateMatches matches={roommateMatches} />
        )}
      </div>
    </div>
  );
}
