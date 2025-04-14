
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LifestyleHabitsSection } from "@/components/profile/LifestyleHabitsSection";
import { WorkSleepScheduleSection } from "@/components/profile/WorkSleepScheduleSection";
import { hobbiesList } from "@/utils/formSteps";
import { useFormUtilities } from "@/hooks/useFormUtilities";

interface LifestyleTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function LifestyleTab({ form }: LifestyleTabProps) {
  const { handleHobbyToggle } = useFormUtilities(form);
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Living La Vida Loca? 🎭</h3>
      <p className="text-muted-foreground">Early bird or night owl? Party animal or Netflix champion? Spill the beans! 🦉</p>
      <Tabs defaultValue="lifestyle">
        <TabsList>
          <TabsTrigger value="lifestyle">Lifestyle & Habits</TabsTrigger>
          <TabsTrigger value="schedule">Work & Sleep</TabsTrigger>
        </TabsList>
        <TabsContent value="lifestyle">
          <LifestyleHabitsSection 
            form={form} 
            handleHobbyToggle={handleHobbyToggle} 
            hobbiesList={hobbiesList} 
          />
        </TabsContent>
        <TabsContent value="schedule">
          <WorkSleepScheduleSection form={form} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
