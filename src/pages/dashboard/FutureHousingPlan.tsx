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
import { PlusCircle, Calendar, MapPin, DollarSign, Home } from "lucide-react";

const housingPlanSchema = z.object({
  movingDate: z.string().min(1, "Moving date is required"),
  desiredLocation: z.string().min(1, "Location is required"),
  budget: z.string().min(1, "Budget is required"),
  housingType: z.string().min(1, "Housing type is required"),
  additionalRequirements: z.string().optional()
});

export default function FutureHousingPlan() {
  const [plans, setPlans] = useState([]);
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
    console.log("New plan created:", newPlan);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      
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
    </div>
  );
}
