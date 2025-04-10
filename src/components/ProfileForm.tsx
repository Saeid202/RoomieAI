
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

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
  
  // Reduce total steps from 9 to 5
  const totalSteps = 5;
  
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

  const getCompletedSections = () => {
    const sections = [
      { id: 1, name: "Personal Info" },
      { id: 2, name: "Housing" },
      { id: 3, name: "Lifestyle" },
      { id: 4, name: "Social & Cleaning" },
      { id: 5, name: "Roommate Preferences" }
    ];
    
    return sections.map(section => ({
      ...section,
      completed: section.id < step
    }));
  };

  return (
    <section id="profile-form" className="py-10 bg-roomie-light w-full">
      <div className="container mx-auto px-4 max-w-none">
        <Card className="mx-auto shadow-lg w-full max-w-6xl">
          <CardHeader>
            <FormStepHeader 
              step={step} 
              totalSteps={totalSteps} 
              onStepClick={goToStep} 
            />
            
            {/* Add completed sections summary */}
            <div className="flex flex-wrap gap-2 mt-4">
              {getCompletedSections().map(section => (
                <div 
                  key={section.id}
                  onClick={() => section.completed && goToStep(section.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors
                    ${section.completed 
                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                      : section.id === step 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-gray-100 text-gray-500"}`}
                >
                  {section.completed && <CheckCircle2 size={14} />}
                  {section.name}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="min-h-[450px] flex items-center">
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
