
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { findMatches } from "@/utils/matchingAlgorithm";
import { ProfileFormValues, profileSchema } from "@/types/profile";
import { MatchResultsDisplay } from "./profile/MatchResultsDisplay";
import { FormStepHeader } from "./profile/FormStepHeader";
import { StepContent } from "./profile/StepContent";
import { FormButtons } from "./profile/FormButtons";
import { useFormNavigation } from "@/hooks/useFormNavigation";
import { useFormUtilities } from "@/hooks/useFormUtilities";

const ProfileForm = () => {
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  
  const totalSteps = 9;
  
  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      phoneNumber: "",
      email: "",
      linkedinProfile: "",
      preferredLocation: "",
      budgetRange: [800, 1500],
      moveInDate: new Date(),
      housingType: "apartment",
      livingSpace: "privateRoom",
      smoking: false,
      livesWithSmokers: false,
      hasPets: false,
      petPreference: "noPets",
      workLocation: "office",
      dailyRoutine: "morning",
      hobbies: [],
      workSchedule: "",
      sleepSchedule: "",
      overnightGuests: "occasionally",
      cleanliness: "somewhatTidy",
      cleaningFrequency: "weekly",
      socialLevel: "balanced",
      guestsOver: "occasionally",
      familyOver: "occasionally",
      atmosphere: "balanced",
      hostingFriends: "occasionally",
      diet: "omnivore",
      cookingSharing: "share",
      stayDuration: "oneYear",
      leaseTerm: "longTerm",
      roommateGenderPreference: "noPreference",
      roommateAgePreference: "similar",
      roommateLifestylePreference: "similar",
      importantRoommateTraits: [],
    },
  });
  
  const { step, nextStep, prevStep, goToStep } = useFormNavigation(form, totalSteps);
  const { handleHobbyToggle, handleTraitToggle } = useFormUtilities(form);
  
  const onSubmit = (data: ProfileFormValues) => {
    console.log("Form submitted:", data);
    const matches = findMatches(data);
    setMatchResults(matches);
    setShowResults(true);
  };

  if (showResults) {
    return <MatchResultsDisplay matchResults={matchResults} onBackToProfile={() => setShowResults(false)} />;
  }

  return (
    <section id="profile-form" className="py-20 bg-roomie-light w-full">
      <div className="container mx-auto px-4 max-w-none">
        <Card className="mx-auto shadow-lg w-full max-w-6xl">
          <CardHeader>
            <FormStepHeader 
              step={step} 
              totalSteps={totalSteps} 
              onStepClick={goToStep} 
            />
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="min-h-[500px] flex items-center">
                <div className="w-full">
                  <StepContent
                    form={form}
                    step={step}
                    handleHobbyToggle={handleHobbyToggle}
                    handleTraitToggle={handleTraitToggle}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <FormButtons
                  step={step}
                  totalSteps={totalSteps}
                  onPrev={prevStep}
                  onNext={nextStep}
                  isSubmitStep={step === totalSteps}
                />
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
};

export default ProfileForm;

