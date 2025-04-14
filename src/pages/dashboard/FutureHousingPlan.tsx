import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Calendar, MapPin, DollarSign, Home, Users } from "lucide-react";
import { findMatches } from "@/utils/matchingAlgorithm";
import { ProfileFormValues } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

const housingPlanSchema = z.object({
  movingDate: z.string().min(1, "Moving date is required"),
  desiredLocation: z.string().min(1, "Location is required"),
  budget: z.string().min(1, "Budget is required"),
  housingType: z.string().min(1, "Housing type is required"),
  additionalRequirements: z.string().optional()
});

export default function FutureHousingPlan() {
  const [plans, setPlans] = useState([]);
  const [showRoommates, setShowRoommates] = useState(false);
  const [roommateMatches, setRoommateMatches] = useState([]);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(housingPlanSchema),
    defaultValues: {
      movingDate: '',
      desiredLocation: '',
      budget: '',
      housingType: '',
      additionalRequirements: ''
    }
  });

  const onSubmit = (data) => {
    const newPlan = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    setPlans([...plans, newPlan]);
    form.reset();

    const profileData: ProfileFormValues = {
      moveInDate: new Date(data.movingDate),
      preferredLocation: data.desiredLocation,
      budgetRange: [Number(data.budget) - 200, Number(data.budget) + 200],
      propertyType: data.housingType,
      additionalNotes: data.additionalRequirements,
      fullName: "",
      age: "",
      gender: "prefer-not-to-say",
      occupation: "",
      cleanliness: "somewhatTidy",
      hasPets: false,
      smoking: false,
      guestsOver: "occasionally",
      dailyRoutine: "normal",
      workSchedule: "9AM-5PM",
      hobbies: [],
      importantRoommateTraits: []
    };

    try {
      const matches = findMatches(profileData);
      setRoommateMatches(matches);
      setShowRoommates(true);
      toast({
        title: "Plan created!",
        description: "We've found some potential roommates based on your preferences.",
      });
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        title: "Error",
        description: "Failed to find roommate matches. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center">
              Housing Plan Details
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-roomie-purple hover:bg-roomie-purple/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Housing Plan</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="movingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              Moving Date
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="desiredLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
                              Desired Location
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4" />
                              Monthly Budget
                            </FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="housingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Home className="mr-2 h-4 w-4" />
                              Housing Type
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select housing type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="condo">Condo</SelectItem>
                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                <SelectItem value="room">Room in shared housing</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="additionalRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Requirements</FormLabel>
                            <FormControl>
                              <Textarea placeholder="e.g., near public transport, pet-friendly, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-roomie-purple hover:bg-roomie-purple/90">Save Plan</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => (
                  <Card key={plan.id} className="bg-white shadow hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plan.desiredLocation}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          Moving date: {new Date(plan.movingDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                          Budget: ${plan.budget}/month
                        </p>
                        <p className="text-sm flex items-center">
                          <Home className="mr-2 h-4 w-4 text-gray-500" />
                          Housing type: {plan.housingType}
                        </p>
                        {plan.additionalRequirements && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Notes:</span> {plan.additionalRequirements}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">
                  You haven't created any housing plans yet. Use this section to plan and track your future housing needs and preferences.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-roomie-purple hover:bg-roomie-purple/90">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Housing Plan</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="movingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                Moving Date
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="desiredLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4" />
                                Desired Location
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., New York, NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Monthly Budget
                              </FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="2000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="housingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Home className="mr-2 h-4 w-4" />
                                Housing Type
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select housing type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="apartment">Apartment</SelectItem>
                                  <SelectItem value="house">House</SelectItem>
                                  <SelectItem value="condo">Condo</SelectItem>
                                  <SelectItem value="townhouse">Townhouse</SelectItem>
                                  <SelectItem value="room">Room in shared housing</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="additionalRequirements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Requirements</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g., near public transport, pet-friendly, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-roomie-purple hover:bg-roomie-purple/90">Save Plan</Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {showRoommates && roommateMatches.length > 0 && (
          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Potential Roommates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roommateMatches.slice(0, 3).map((match) => (
                  <Card key={match.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{match.name}</h3>
                        <p className="text-sm text-muted-foreground">{match.occupation}</p>
                      </div>
                      <span className="bg-roomie-purple text-white px-2 py-1 rounded-full text-xs">
                        {Math.round(match.compatibilityScore)}% Match
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Moving: {new Date(match.movingDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget: ${match.budget[0]} - ${match.budget[1]}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {match.location}
                      </p>
                    </div>
                  </Card>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard/roommate-recommendations'}
                >
                  View All Matches
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
