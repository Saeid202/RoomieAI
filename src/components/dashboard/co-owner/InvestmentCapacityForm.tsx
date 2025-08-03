
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const investmentCapacitySchema = z.object({
  upfrontCapital: z.string().min(1, "Upfront capital is required"),
  monthlyContribution: z.string().min(1, "Monthly contribution is required"),
  investmentTerm: z.string().min(1, "Investment term is required"),
  riskTolerance: z.enum(["low", "medium", "high"]),
  investmentType: z.enum(["investment property", "property to live in"]),
  coLiving: z.enum(["yes", "no"]),
});

type InvestmentCapacityFormValues = z.infer<typeof investmentCapacitySchema>;

export function InvestmentCapacityForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<InvestmentCapacityFormValues>({
    resolver: zodResolver(investmentCapacitySchema),
    defaultValues: {
      upfrontCapital: "",
      monthlyContribution: "",
      investmentTerm: "5",
      riskTolerance: "medium",
      investmentType: "property to live in",
      coLiving: "no",
    },
  });

  const onSubmit = async (data: InvestmentCapacityFormValues) => {
    setLoading(true);
    try {
      // Here you would save the form data to your database
      console.log("Form data to save:", data);
      
      toast({
        title: "Success",
        description: "Investment capacity details saved successfully",
      });
    } catch (error) {
      console.error("Error saving investment capacity:", error);
      toast({
        title: "Error",
        description: "Failed to save investment capacity details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Savings & Investment Capacity</h2>
        <p className="text-muted-foreground">
          Please provide information about your investment capacity and preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="upfrontCapital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How much capital are you willing to contribute upfront for a joint property investment?
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter the amount (e.g., 50000)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyContribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    How much can you afford to contribute per month for mortgage payments?
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter the monthly amount (e.g., 1500)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="investmentTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How long are you willing to commit to a joint ownership agreement? (years)
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year} {year === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="riskTolerance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What is your risk tolerance for real estate investments?
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="investmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Would you prefer an investment property (for rental income) or a property to live in?
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
                    <SelectItem value="investment property">Investment property</SelectItem>
                    <SelectItem value="property to live in">Property to live in</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coLiving"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Are you open to co-living with other investors?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Yes
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        No
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Investment Capacity"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
