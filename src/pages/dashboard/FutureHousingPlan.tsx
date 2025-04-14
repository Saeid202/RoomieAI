
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

const housingPlanSchema = z.object({
  movingDate: z.string().optional(),
  desiredLocation: z.string().optional(),
  budget: z.string().optional(),
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
      additionalRequirements: ''
    }
  });

  const onSubmit = (data) => {
    // TODO: Implement saving logic
    console.log(data);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Future Housing Plan</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Housing Plan Details
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create New Plan</Button>
              </DialogTrigger>
              <DialogContent>
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
                          <FormLabel>Moving Date</FormLabel>
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
                          <FormLabel>Desired Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Budget</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
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
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Save Plan</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use this section to plan and track your future housing needs and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
