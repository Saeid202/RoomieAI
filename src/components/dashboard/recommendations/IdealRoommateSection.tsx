
import { Heart, Settings, Sofa, Ban, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { RoommatePreferencesSection } from "@/components/profile/RoommatePreferencesSection";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/types/profile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormUtilities } from "@/hooks/useFormUtilities";
import { roommateTraitsList } from "@/utils/formSteps";

interface IdealRoommateSectionProps {
  expandedSections: string[];
  profileData: Partial<ProfileFormValues> | null;
  activeIdealRoommateTab: string;
  setActiveIdealRoommateTab: (value: string) => void;
  handleSaveProfile: (formData: ProfileFormValues) => void;
}

// Define the tabs for the Ideal Roommate section
const IdealRoommateTabs = [
  { id: "preferences", label: "1️⃣ Preferences", icon: Settings },
  { id: "lifestyle-match", label: "2️⃣ Lifestyle Match", icon: Heart },
  { id: "house-habits", label: "3️⃣ House Habits", icon: Sofa },
  { id: "deal-breakers", label: "4️⃣ Deal Breakers", icon: Ban }
];

export function IdealRoommateSection({ 
  expandedSections, 
  profileData, 
  activeIdealRoommateTab, 
  setActiveIdealRoommateTab,
  handleSaveProfile
}: IdealRoommateSectionProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData || undefined,
  });

  const { handleTraitToggle } = useFormUtilities(form);

  const onSubmit = (data: ProfileFormValues) => {
    handleSaveProfile(data);
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
            <Tabs value={activeIdealRoommateTab} onValueChange={setActiveIdealRoommateTab}>
              <TabsList className="w-full grid grid-cols-4">
                {IdealRoommateTabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="inline md:hidden">{tab.id.split('-')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                  <TabsContent value="preferences">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Your Dream Roomie! 🌈</h3>
                      <p className="text-muted-foreground">Seeking a neat freak? A fellow pizza enthusiast? A plant parent? Let's find your perfect match! 🔍</p>
                      <RoommatePreferencesSection 
                        form={form} 
                        handleTraitToggle={handleTraitToggle} 
                        traitsList={roommateTraitsList} 
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="lifestyle-match">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Lifestyle Twins or Opposites? 🎭</h3>
                      <p className="text-muted-foreground">Does your ideal roomie need to match your wild party schedule or balance it out? No wrong answers! 🎉</p>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Looking for someone who:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="similar-schedule" className="rounded" />
                            <label htmlFor="similar-schedule">Has a similar daily schedule</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="similar-interests" className="rounded" />
                            <label htmlFor="similar-interests">Shares my interests and hobbies</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="work-style" className="rounded" />
                            <label htmlFor="work-style">Has a compatible work style with me</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="house-habits">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">House Rules & Habits! 🏡</h3>
                      <p className="text-muted-foreground">Seeking someone who shares your "dishes don't wash themselves" philosophy? Let's set some ground rules! 📝</p>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Important house rules:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="clean-kitchen" className="rounded" />
                            <label htmlFor="clean-kitchen">Cleans up kitchen after use</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="quiet-hours" className="rounded" />
                            <label htmlFor="quiet-hours">Respects quiet hours</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="shared-groceries" className="rounded" />
                            <label htmlFor="shared-groceries">Willing to share groceries</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="deal-breakers">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Absolutely Not! 🙅‍♂️</h3>
                      <p className="text-muted-foreground">What crosses the line? Midnight drum practice? Pineapple on pizza? We won't judge (much)! 🍍</p>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">My deal breakers:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="smoking" className="rounded" />
                            <label htmlFor="smoking">Smoking indoors</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="loud-music" className="rounded" />
                            <label htmlFor="loud-music">Frequently playing loud music</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="late-payments" className="rounded" />
                            <label htmlFor="late-payments">History of late rent payments</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Preferences</Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
