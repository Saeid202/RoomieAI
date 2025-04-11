
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const financialSituationSchema = z.object({
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  monthlyExpenses: z.string().min(1, "Monthly expenses is required"),
  incomeStability: z.enum(["stable", "unstable"]),
  otherIncomeSources: z.enum(["yes", "no"]),
  otherIncomeDetails: z.string().optional(),
  hasDebts: z.enum(["yes", "no"]),
  debtsDetails: z.string().optional(),
});

type FinancialSituationFormValues = z.infer<typeof financialSituationSchema>;

export function FinancialSituationForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FinancialSituationFormValues>({
    resolver: zodResolver(financialSituationSchema),
    defaultValues: {
      monthlyIncome: "",
      monthlyExpenses: "",
      incomeStability: "stable",
      otherIncomeSources: "no",
      otherIncomeDetails: "",
      hasDebts: "no",
      debtsDetails: "",
    },
  });

  const otherIncomeSources = form.watch("otherIncomeSources");
  const hasDebts = form.watch("hasDebts");

  const onSubmit = async (data: FinancialSituationFormValues) => {
    setLoading(true);
    try {
      // Here you would save the form data to your database
      console.log("Form data to save:", data);
      
      toast({
        title: "Success",
        description: "Financial situation details saved successfully",
      });
    } catch (error) {
      console.error("Error saving financial situation:", error);
      toast({
        title: "Error",
        description: "Failed to save financial situation details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Financial Situation</h2>
        <p className="text-muted-foreground">
          Please provide information about your current financial status.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How much is your monthly income?</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your monthly income" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How much are your monthly expenses?</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your monthly expenses" 
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
            name="incomeStability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How stable is your income?</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="unstable">Unstable</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherIncomeSources"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Except your primary source of income, do you have any other source of income?
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

          {otherIncomeSources === "yes" && (
            <FormField
              control={form.control}
              name="otherIncomeDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please elaborate more:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain your additional income sources"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="hasDebts"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Do you have any outstanding debts or liabilities?
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

          {hasDebts === "yes" && (
            <FormField
              control={form.control}
              name="debtsDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please specify:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about your debts or liabilities"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Financial Information"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
