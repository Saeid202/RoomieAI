
import React, { useState } from "react";
import { CalendarIcon, MapPin, Clock, AlertCircle, Zap } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ProfileFormValues } from "@/types/profile";
import { useToastNotifications } from "@/hooks/useToastNotifications";

// Types for future housing plans
interface FutureHousingPlan {
  id: string;
  location: string;
  moveInDate: Date;
  flexibilityDays: number;
  budgetRange: [number, number];
  lookingFor: 'roommate' | 'property' | 'both';
  purpose: string;
  notificationPreference: 'email' | 'app' | 'both';
  status: 'active' | 'pending' | 'completed' | 'archived';
  additionalNotes?: string;
}

// Mock plans for demonstration
const initialPlans: FutureHousingPlan[] = [
  {
    id: "plan-1",
    location: "Toronto",
    moveInDate: new Date(2025, 8, 1), // September 1, 2025
    flexibilityDays: 14,
    budgetRange: [1000, 1800],
    lookingFor: 'both',
    purpose: "University - Fall Semester",
    notificationPreference: 'both',
    status: 'active',
    additionalNotes: "Looking for a place close to University of Toronto"
  }
];

// Mock recommendations based on user profile and housing plan
const mockRecommendations = [
  {
    id: "rec-1",
    type: "roommate",
    title: "Roommate with similar timeline",
    description: "Sarah is also looking to move to Toronto in September 2025 for the university semester",
    confidence: 0.87,
    tags: ["University Student", "Similar Budget", "Compatible Schedule"]
  },
  {
    id: "rec-2",
    type: "property",
    title: "Pre-leasing apartment near UofT",
    description: "Modern apartment with pre-leasing options for September 2025 within walking distance to campus",
    confidence: 0.74,
    tags: ["Close to University", "Within Budget", "Available Sept 2025"]
  },
  {
    id: "rec-3",
    type: "alternative",
    title: "Consider Mississauga",
    description: "More affordable options with transit access to Toronto",
    confidence: 0.65,
    tags: ["Cost Saving", "Alternative Location", "More Availability"]
  }
];

interface FutureHousingPlanSectionProps {
  expandedSections: string[];
  profileData?: Partial<ProfileFormValues> | null;
}

export function FutureHousingPlanSection({ 
  expandedSections,
  profileData
}: FutureHousingPlanSectionProps) {
  const [plans, setPlans] = useState<FutureHousingPlan[]>(initialPlans);
  const [activeTab, setActiveTab] = useState<string>("plans");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const { showSuccess, showPlanMatch } = useToastNotifications();

  // New plan form state
  const [newPlan, setNewPlan] = useState<Partial<FutureHousingPlan>>({
    location: "",
    moveInDate: new Date(),
    flexibilityDays: 7,
    budgetRange: [900, 1500],
    lookingFor: 'both',
    purpose: "",
    notificationPreference: 'both',
    status: 'active'
  });

  // Handle plan creation
  const handleCreatePlan = () => {
    if (!newPlan.location || !newPlan.purpose) {
      return;
    }

    const plan: FutureHousingPlan = {
      id: `plan-${Date.now()}`,
      location: newPlan.location || "",
      moveInDate: newPlan.moveInDate || new Date(),
      flexibilityDays: newPlan.flexibilityDays || 7,
      budgetRange: newPlan.budgetRange || [900, 1500],
      lookingFor: newPlan.lookingFor || 'both',
      purpose: newPlan.purpose || "",
      notificationPreference: newPlan.notificationPreference || 'both',
      status: 'active',
      additionalNotes: newPlan.additionalNotes
    };

    setPlans([...plans, plan]);
    setIsCreatingPlan(false);
    
    // Reset form
    setNewPlan({
      location: "",
      moveInDate: new Date(),
      flexibilityDays: 7,
      budgetRange: [900, 1500],
      lookingFor: 'both',
      purpose: "",
      notificationPreference: 'both',
      status: 'active'
    });

    showSuccess(
      "Housing plan created", 
      "We'll notify you when there are matches for your future housing plan"
    );

    // Show a match notification as a demo after a delay
    setTimeout(() => {
      showPlanMatch(
        "New housing match found!", 
        "We found a potential roommate for your Toronto plan in September 2025."
      );
    }, 5000);
  };

  // Helper for date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <AccordionItem value="future-housing-plan" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="text-xl font-semibold">My Future Housing Plan</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Future Housing Plan</h3>
                {!isCreatingPlan && (
                  <Button onClick={() => setIsCreatingPlan(true)}>
                    Create New Plan
                  </Button>
                )}
              </div>
              
              <p className="text-muted-foreground">
                Plan your future housing needs and get notified when matching roommates or properties become available.
              </p>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="plans">My Plans</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                    <Badge className="ml-2 bg-blue-500" variant="secondary">
                      {recommendations.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="matches">
                    Matches
                    <Badge className="ml-2 bg-green-500" variant="secondary">2</Badge>
                  </TabsTrigger>
                </TabsList>
                
                {/* My Plans Tab */}
                <TabsContent value="plans" className="space-y-4 pt-4">
                  {isCreatingPlan ? (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <h4 className="font-semibold text-lg">Create New Housing Plan</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <div className="flex">
                              <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input 
                                placeholder="Enter city or area"
                                value={newPlan.location || ''}
                                onChange={(e) => setNewPlan({...newPlan, location: e.target.value})}
                                className="rounded-l-none"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Purpose</label>
                            <Input 
                              placeholder="E.g., University, Work, Internship"
                              value={newPlan.purpose || ''}
                              onChange={(e) => setNewPlan({...newPlan, purpose: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Move-in Date</label>
                            <div className="flex items-center space-x-2">
                              <div className="rounded-md border p-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input 
                                type="date"
                                value={newPlan.moveInDate ? newPlan.moveInDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setNewPlan({
                                  ...newPlan, 
                                  moveInDate: new Date(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Date Flexibility (Days)</label>
                            <div className="pt-2 px-2">
                              <Slider
                                defaultValue={[7]}
                                max={30}
                                step={1}
                                value={[newPlan.flexibilityDays || 7]}
                                onValueChange={(value) => setNewPlan({...newPlan, flexibilityDays: value[0]})}
                              />
                              <div className="text-center mt-2">
                                {newPlan.flexibilityDays} days
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Looking For</label>
                            <Select 
                              defaultValue="both"
                              onValueChange={(value) => setNewPlan({
                                ...newPlan, 
                                lookingFor: value as 'roommate' | 'property' | 'both'
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="What are you looking for?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="roommate">Roommate Only</SelectItem>
                                <SelectItem value="property">Property Only</SelectItem>
                                <SelectItem value="both">Both Roommate & Property</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Notifications</label>
                            <Select 
                              defaultValue="both"
                              onValueChange={(value) => setNewPlan({
                                ...newPlan, 
                                notificationPreference: value as 'email' | 'app' | 'both'
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Notification preference" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email Only</SelectItem>
                                <SelectItem value="app">In-App Only</SelectItem>
                                <SelectItem value="both">Email & In-App</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Budget Range</label>
                            <div className="pt-6 px-2">
                              <Slider
                                defaultValue={[900, 1500]}
                                min={500}
                                max={3000}
                                step={50}
                                value={newPlan.budgetRange || [900, 1500]}
                                onValueChange={(value) => setNewPlan({...newPlan, budgetRange: [value[0], value[1]]})}
                              />
                              <div className="flex justify-between mt-2">
                                <span>${newPlan.budgetRange?.[0] || 900}</span>
                                <span>${newPlan.budgetRange?.[1] || 1500}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Additional Notes</label>
                            <textarea
                              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Any specific requirements or preferences"
                              value={newPlan.additionalNotes || ''}
                              onChange={(e) => setNewPlan({...newPlan, additionalNotes: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={() => setIsCreatingPlan(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePlan}>
                            Save Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : plans.length > 0 ? (
                    <div className="space-y-4">
                      {plans.map((plan) => (
                        <Card key={plan.id} className="overflow-hidden">
                          <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between border-b">
                            <div className="flex items-center space-x-3">
                              <Badge 
                                className={
                                  plan.status === 'active' ? 'bg-green-500' : 
                                  plan.status === 'pending' ? 'bg-yellow-500' : 
                                  plan.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                                }
                              >
                                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                              </Badge>
                              <h4 className="font-semibold text-lg">{plan.location}</h4>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 md:mt-0">
                              <span className="text-sm text-muted-foreground">
                                Looking for: {plan.lookingFor === 'both' ? 'Roommate & Property' : plan.lookingFor}
                              </span>
                              <Badge variant="outline" className="rounded-full bg-blue-50">
                                {formatDate(plan.moveInDate)}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Purpose</p>
                                <p className="font-medium">{plan.purpose}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Budget</p>
                                <p className="font-medium">${plan.budgetRange[0]} - ${plan.budgetRange[1]}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Date Flexibility</p>
                                <p className="font-medium">±{plan.flexibilityDays} days around {formatDate(plan.moveInDate)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Notifications</p>
                                <p className="font-medium">{
                                  plan.notificationPreference === 'both' ? 'Email & In-App' : 
                                  plan.notificationPreference === 'email' ? 'Email Only' : 'In-App Only'
                                }</p>
                              </div>
                              {plan.additionalNotes && (
                                <div className="md:col-span-2">
                                  <p className="text-sm text-muted-foreground">Additional Notes</p>
                                  <p className="font-medium">{plan.additionalNotes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="default" size="sm">View Matches</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No housing plans created yet.</p>
                      <Button onClick={() => setIsCreatingPlan(true)} className="mt-4">
                        Create Your First Plan
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4 pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">AI-Powered Recommendations</h4>
                        <p className="text-sm text-blue-700">
                          Based on your housing plans and preferences, we've generated personalized recommendations
                          to help you find the perfect match.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="overflow-hidden border-l-4 border-l-blue-500">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-lg">{rec.title}</h4>
                              <Badge
                                className={rec.type === 'roommate' ? 'bg-purple-500' : 
                                          rec.type === 'property' ? 'bg-green-500' : 'bg-orange-500'}
                              >
                                {rec.type}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Match Confidence
                            </div>
                            <div className="text-xl font-bold text-blue-600">
                              {Math.round(rec.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {rec.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button variant="outline" size="sm">Dismiss</Button>
                          <Button variant="default" size="sm">
                            {rec.type === 'roommate' ? 'View Profile' : 
                             rec.type === 'property' ? 'View Property' : 'Explore Option'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                {/* Matches Tab */}
                <TabsContent value="matches" className="space-y-4 pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">2 Matches Found</h4>
                        <p className="text-sm text-green-700">
                          We've found potential matches for your Toronto housing plan starting September 2025.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Card className="overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-lg">Sarah, 22 - University Student</h4>
                            <Badge className="bg-purple-500">Roommate</Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            Looking for a roommate in Toronto for Fall 2025 semester at University of Toronto.
                            Budget range $900-$1600, clean and quiet.
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Match Score
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            92%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="bg-green-50">Early Bird</Badge>
                        <Badge variant="outline" className="bg-green-50">University Student</Badge>
                        <Badge variant="outline" className="bg-green-50">Similar Timeline</Badge>
                        <Badge variant="outline" className="bg-green-50">Compatible Lifestyle</Badge>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">Skip</Button>
                        <Button variant="default" size="sm">View Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden border-l-4 border-l-green-500">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-lg">Campus View Apartment</h4>
                            <Badge className="bg-green-500">Property</Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            2-bedroom apartment available for September 2025, 10-minute walk to University of Toronto.
                            $1,800/month, utilities included, pre-leasing available.
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Match Score
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            87%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="bg-green-50">Pre-leasing Available</Badge>
                        <Badge variant="outline" className="bg-green-50">Close to University</Badge>
                        <Badge variant="outline" className="bg-green-50">Within Budget</Badge>
                        <Badge variant="outline" className="bg-green-50">Utilities Included</Badge>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">Skip</Button>
                        <Button variant="default" size="sm">View Property</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
