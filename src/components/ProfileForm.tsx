
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { findMatches } from "@/utils/matchingAlgorithm";
import { ProfileFormValues, profileSchema } from "@/types/profile";

// Import section components
import { BasicInformationSection } from "./profile/BasicInformationSection";
import { HousingPreferencesSection } from "./profile/HousingPreferencesSection";
import { LifestyleHabitsSection } from "./profile/LifestyleHabitsSection";
import { WorkSleepScheduleSection } from "./profile/WorkSleepScheduleSection";
import { CleanlinessSection } from "./profile/CleanlinessSection";
import { SocialPreferencesSection } from "./profile/SocialPreferencesSection";
import { CookingMealsSection } from "./profile/CookingMealsSection";
import { LeaseTermsSection } from "./profile/LeaseTermsSection";
import { MatchResultsDisplay } from "./profile/MatchResultsDisplay";
import { FormStepHeader } from "./profile/FormStepHeader";

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  
  const totalSteps = 8;
  
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
    },
  });
  
  const nextStep = () => {
    // Validate current step before moving forward
    const currentStepFields = getFieldsForStep(step);
    const isValid = currentStepFields.every(field => 
      !form.formState.errors[field as keyof ProfileFormValues]
    );
    
    if (isValid && step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Trigger validation to show errors
      form.trigger(currentStepFields as any);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const onSubmit = (data: ProfileFormValues) => {
    console.log("Form submitted:", data);
    const matches = findMatches(data);
    setMatchResults(matches);
    setShowResults(true);
  };
  
  // Get fields to validate for each step
  const getFieldsForStep = (currentStep: number): string[] => {
    switch (currentStep) {
      case 1: // Basic Information
        return ["fullName", "age", "gender", "phoneNumber", "email", "linkedinProfile"];
      case 2: // Housing Preferences
        return ["preferredLocation", "budgetRange", "moveInDate", "housingType", "livingSpace"];
      case 3: // Lifestyle & Habits
        return ["smoking", "livesWithSmokers", "hasPets", "petPreference", "workLocation", "dailyRoutine", "hobbies"];
      case 4: // Work/Sleep Schedule
        return ["workSchedule", "sleepSchedule", "overnightGuests"];
      case 5: // Cleanliness & Organization
        return ["cleanliness", "cleaningFrequency"];
      case 6: // Social Preferences
        return ["socialLevel", "guestsOver", "familyOver", "atmosphere", "hostingFriends"];
      case 7: // Cooking & Meals
        return ["diet", "cookingSharing"];
      case 8: // Lease Terms
        return ["stayDuration", "leaseTerm"];
      default:
        return [];
    }
  };
  
  const hobbiesList = [
    "Reading", "Gaming", "Cooking", "Hiking", "Movies", 
    "Music", "Art", "Sports", "Photography", "Yoga", 
    "Crafting", "Gardening", "Writing", "Dancing", "Meditation"
  ];
  
  // Helper for handling hobbies selection
  const handleHobbyToggle = (hobby: string) => {
    const current = form.getValues("hobbies");
    if (current.includes(hobby)) {
      form.setValue("hobbies", current.filter(h => h !== hobby));
    } else {
      form.setValue("hobbies", [...current, hobby]);
    }
  };

  if (showResults) {
    return <MatchResultsDisplay matchResults={matchResults} onBackToProfile={() => setShowResults(false)} />;
  }

  return (
    <section id="profile-form" className="py-20 bg-roomie-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Roommate</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Tell us about yourself and what you're looking for in a roommate.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <FormStepHeader step={step} totalSteps={totalSteps} />
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <BasicInformationSection form={form} />
                )}
                
                {step === 2 && (
                  <HousingPreferencesSection form={form} />
                )}
                
                {step === 3 && (
                  <LifestyleHabitsSection 
                    form={form} 
                    handleHobbyToggle={handleHobbyToggle} 
                    hobbiesList={hobbiesList} 
                  />
                )}
                
                {step === 4 && (
                  <WorkSleepScheduleSection form={form} />
                )}
                
                {step === 5 && (
                  <CleanlinessSection form={form} />
                )}
                
                {step === 6 && (
                  <SocialPreferencesSection form={form} />
                )}
                
                {step === 7 && (
                  <CookingMealsSection form={form} />
                )}
                
                {step === 8 && (
                  <LeaseTermsSection form={form} />
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < totalSteps ? (
                  <Button type="button" className="bg-roomie-purple hover:bg-roomie-dark" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" className="bg-roomie-purple hover:bg-roomie-dark">
                    Find Matches
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
};

export default ProfileForm;
