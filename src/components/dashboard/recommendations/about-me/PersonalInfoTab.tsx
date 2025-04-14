
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { BasicInformationSection } from "@/components/profile/BasicInformationSection";

interface PersonalInfoTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function PersonalInfoTab({ form }: PersonalInfoTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Tell us about yourself! 😊</h3>
      <p className="text-muted-foreground">Let's get to know the amazing human behind the screen! No pressure, we're just nosy. 🧐</p>
      <BasicInformationSection form={form} />
    </div>
  );
}
