
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const investmentPreferencesSchema = z.object({
  investmentReason: z.enum([
    "Capital appreciation", 
    "Passive Income", 
    "Homeownership", 
    "Retirement planning"
  ]),
  propertyType: z.enum([
    "condominium", 
    "townhouse", 
    "Multi-Unit Property"
  ]),
  preferredLocation: z.string().min(1, "Preferred location is required"),
  reinvestmentInterest: z.enum(["yes", "no"]),
  exitStrategy: z.string().min(1, "Exit strategy is required"),
});

type InvestmentPreferencesFormValues = z.infer<typeof investmentPreferencesSchema>;

export function InvestmentPreferencesForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<InvestmentPreferencesFormValues>({
    resolver: zodResolver(investmentPreferencesSchema),
    defaultValues: {
      investmentReason: "Homeownership",
      propertyType: "condominium",
      preferredLocation: "",
      reinvestmentInterest: "yes",
      exitStrategy: "",
    },
  });

  const onSubmit = async (data: InvestmentPreferencesFormValues) => {
    setLoading(true);
    try {
      // Here you would save the form data to your database
      console.log("Form data to save:", data);
      
      toast({
        title: "Success",
        description: "Investment preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving investment preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save investment preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Investment Preferences & Goals</h2>
        <p className="text-muted-foreground">
          Please provide information about your investment preferences and long-term goals.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="investmentReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What is your primary reason for investing in real estate?
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Capital appreciation">Capital appreciation</SelectItem>
                    <SelectItem value="Passive Income">Passive Income</SelectItem>
                    <SelectItem value="Homeownership">Homeownership</SelectItem>
                    <SelectItem value="Retirement planning">Retirement planning</SelectItem>
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
                <FormLabel>
                  What is your preferred property type?
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="condominium">Condominium</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="Multi-Unit Property">Multi-Unit Property</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What is your preferred location for real estate investments?
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter the address or location where you want to live or buy an apartment" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reinvestmentInterest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Would you be interested in reinvesting profits from a property sale into another real estate investment?
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exitStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What is your exit strategy preference?
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Describe your preferred exit strategy" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Investment Preferences"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
