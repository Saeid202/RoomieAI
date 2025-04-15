
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CleanlinessSection } from "@/components/profile/CleanlinessSection";
import { SocialPreferencesSection } from "@/components/profile/SocialPreferencesSection";
import { CookingMealsSection } from "@/components/profile/CookingMealsSection";

interface SocialCleaningTabProps {
  form: UseFormReturn<ProfileFormValues>;
}

export function SocialCleaningTab({ form }: SocialCleaningTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Clean Freak or Chaos Creator? 🧹</h3>
      <p className="text-muted-foreground">Do you see dust bunnies as pets or enemies? Let's dish the dirt on your cleaning habits! 🧼</p>
      <Tabs defaultValue="cleanliness">
        <TabsList>
          <TabsTrigger value="cleanliness">Cleanliness</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="cooking">Cooking</TabsTrigger>
        </TabsList>
        <TabsContent value="cleanliness">
          <CleanlinessSection form={form} />
        </TabsContent>
        <TabsContent value="social">
          <SocialPreferencesSection form={form} />
        </TabsContent>
        <TabsContent value="cooking">
          <CookingMealsSection form={form} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
