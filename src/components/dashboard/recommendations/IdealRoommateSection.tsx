
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { RoommatePreferencesForm } from "./ideal-roommate/RoommatePreferencesForm";
import { useState, useEffect } from "react";

interface IdealRoommateSectionProps {
  profileData: Partial<ProfileFormValues> | null;
  isLoading?: boolean;
  onSaveProfile?: (formData: ProfileFormValues) => Promise<void>;
}

export function IdealRoommateSection({ 
  profileData,
  isLoading = false,
  onSaveProfile 
}: IdealRoommateSectionProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeIdealRoommateTab, setActiveIdealRoommateTab] = useState("preferences");
  
  // Create a default empty form value to prevent null errors
  const defaultFormValues: Partial<ProfileFormValues> = {
    fullName: "",
    age: "",
    gender: "",
    email: "",
    phoneNumber: "",
    budgetRange: [800, 1500],
    preferredLocation: "",
    moveInDate: new Date(),
    housingType: "apartment",
    livingSpace: "privateRoom",
    smoking: false,
    livesWithSmokers: false,
    hasPets: false,
    petPreference: "noPets",
    workLocation: "remote",
    dailyRoutine: "mixed",
    sleepSchedule: "Regular schedule",
    overnightGuests: "occasionally",
    cleanliness: "somewhatTidy",
    cleaningFrequency: "weekly",
    socialLevel: "balanced",
    guestsOver: "occasionally",
    familyOver: "occasionally",
    atmosphere: "balanced",
    hostingFriends: "occasionally",
    diet: "omnivore",
    cookingSharing: "separate",
    stayDuration: "sixMonths",
    leaseTerm: "longTerm",
    roommateGenderPreference: "noPreference",
    roommateAgePreference: "noAgePreference",
    roommateLifestylePreference: "noLifestylePreference",
    hobbies: [],
    importantRoommateTraits: [],
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...defaultFormValues, ...profileData },
  });

  // Update form when profileData changes
  useEffect(() => {
    if (profileData) {
      // Reset the form with the merged values of defaultFormValues and profileData
      form.reset({ ...defaultFormValues, ...profileData });
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      console.log("Ideal Roommate form data to save:", data);
      
      // Use the parent's save function if available
      if (onSaveProfile) {
        await onSaveProfile(data);
      }
      
      toast({
        title: "Preferences saved",
        description: "Your roommate preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error saving preferences",
        description: "There was a problem saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AccordionItem value="ideal-roommate" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="text-xl font-semibold">My Ideal Roommate</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <RoommatePreferencesForm
              form={form}
              activeTab={activeIdealRoommateTab}
              setActiveTab={setActiveIdealRoommateTab}
              onSubmit={onSubmit}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
