
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { BasicInformationSection } from "./BasicInformationSection";
import { HousingPreferencesSection } from "./HousingPreferencesSection";
import { LifestyleHabitsSection } from "./LifestyleHabitsSection";
import { WorkSleepScheduleSection } from "./WorkSleepScheduleSection";
import { CleanlinessSection } from "./CleanlinessSection";
import { SocialPreferencesSection } from "./SocialPreferencesSection";
import { CookingMealsSection } from "./CookingMealsSection";
import { LeaseTermsSection } from "./LeaseTermsSection";
import { RoommatePreferencesSection } from "./RoommatePreferencesSection";
import { hobbiesList, roommateTraitsList } from "@/utils/formSteps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StepContentProps {
  form: UseFormReturn<ProfileFormValues>;
  step: number;
  handleHobbyToggle: (hobby: string) => void;
  handleTraitToggle: (trait: string) => void;
}

export function StepContent({ 
  form, 
  step, 
  handleHobbyToggle, 
  handleTraitToggle 
}: StepContentProps) {
  const [activeHousingTab, setActiveHousingTab] = useState("housing");
  const [activeLifestyleTab, setActiveLifestyleTab] = useState("lifestyle");
  const [activeCleaningTab, setActiveCleaningTab] = useState("cleanliness");

  return (
    <div className="w-full h-[420px] overflow-y-auto px-2">
      {step === 1 && (
        <div className="w-full space-y-4 py-4">
          <BasicInformationSection form={form} />
        </div>
      )}
      
      {step === 2 && (
        <Tabs 
          value={activeHousingTab} 
          onValueChange={setActiveHousingTab} 
          className="w-full"
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="housing" className="flex-1">Housing Preferences</TabsTrigger>
            <TabsTrigger value="lease" className="flex-1">Lease Terms</TabsTrigger>
          </TabsList>
          <TabsContent value="housing" className="space-y-4">
            <HousingPreferencesSection form={form} />
          </TabsContent>
          <TabsContent value="lease" className="space-y-4">
            <LeaseTermsSection form={form} />
          </TabsContent>
        </Tabs>
      )}
      
      {step === 3 && (
        <Tabs 
          value={activeLifestyleTab} 
          onValueChange={setActiveLifestyleTab} 
          className="w-full"
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="lifestyle" className="flex-1">Lifestyle & Habits</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">Work & Sleep</TabsTrigger>
          </TabsList>
          <TabsContent value="lifestyle" className="space-y-4">
            <LifestyleHabitsSection 
              form={form} 
              handleHobbyToggle={handleHobbyToggle} 
              hobbiesList={hobbiesList} 
            />
          </TabsContent>
          <TabsContent value="schedule" className="space-y-4">
            <WorkSleepScheduleSection form={form} />
          </TabsContent>
        </Tabs>
      )}
      
      {step === 4 && (
        <Tabs 
          value={activeCleaningTab} 
          onValueChange={setActiveCleaningTab} 
          className="w-full"
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="cleanliness" className="flex-1">Cleanliness</TabsTrigger>
            <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
            <TabsTrigger value="cooking" className="flex-1">Cooking</TabsTrigger>
          </TabsList>
          <TabsContent value="cleanliness" className="space-y-4">
            <CleanlinessSection form={form} />
          </TabsContent>
          <TabsContent value="social" className="space-y-4">
            <SocialPreferencesSection form={form} />
          </TabsContent>
          <TabsContent value="cooking" className="space-y-4">
            <CookingMealsSection form={form} />
          </TabsContent>
        </Tabs>
      )}
      
      {step === 5 && (
        <div className="w-full space-y-4 py-4">
          <RoommatePreferencesSection 
            form={form} 
            handleTraitToggle={handleTraitToggle} 
            traitsList={roommateTraitsList} 
          />
        </div>
      )}
    </div>
  );
}

