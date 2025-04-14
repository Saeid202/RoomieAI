
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, DollarSign, Home } from "lucide-react";

const housingPlanSchema = z.object({
  movingDate: z.string().min(1, "Moving date is required"),
  desiredLocation: z.string().min(1, "Location is required"),
  budget: z.string().min(1, "Budget is required"),
  housingType: z.string().min(1, "Housing type is required"),
  additionalRequirements: z.string().optional()
});

type HousingPlanFormProps = {
  onSubmit: (data: z.infer<typeof housingPlanSchema>) => void;
};

export function HousingPlanForm({ onSubmit }: HousingPlanFormProps) {
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

  return (
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
  );
}
