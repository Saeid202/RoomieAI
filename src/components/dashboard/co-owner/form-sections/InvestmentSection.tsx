
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CoOwnerFormValues } from "../types";

interface SectionProps {
  form: UseFormReturn<CoOwnerFormValues>;
}

export function InvestmentSection({ form }: SectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="investmentCapacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Investment Capacity Range (USD)</FormLabel>
            <FormControl>
              <Slider
                defaultValue={field.value}
                max={1000000}
                min={50000}
                step={10000}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormDescription className="flex justify-between">
              <span>${field.value[0].toLocaleString()}</span>
              <span>${field.value[1].toLocaleString()}</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="investmentTimeline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Timeline</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timeline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-6 months">0-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="1-2 years">1-2 years</SelectItem>
                  <SelectItem value="2+ years">2+ years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Any">Any</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
