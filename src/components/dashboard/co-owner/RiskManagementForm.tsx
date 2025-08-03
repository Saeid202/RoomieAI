
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

const riskManagementSchema = z.object({
  contingencyPlan: z.enum(["yes", "no"]),
  reserveFund: z.enum(["yes", "no"]),
  disputeHandling: z.enum(["Mediation", "Legal Action", "Buyout clause"]),
  legalAgreement: z.enum(["yes", "no"]),
});

type RiskManagementFormValues = z.infer<typeof riskManagementSchema>;

export function RiskManagementForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<RiskManagementFormValues>({
    resolver: zodResolver(riskManagementSchema),
    defaultValues: {
      contingencyPlan: "yes",
      reserveFund: "yes",
      disputeHandling: "Mediation",
      legalAgreement: "yes",
    },
  });

  const onSubmit = async (data: RiskManagementFormValues) => {
    setLoading(true);
    try {
      // Here you would save the form data to your database
      console.log("Form data to save:", data);
      
      toast({
        title: "Success",
        description: "Risk management preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving risk management:", error);
      toast({
        title: "Error",
        description: "Failed to save risk management preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Risk Management & Legal Considerations</h2>
        <p className="text-muted-foreground">
          Please provide information about how you prefer to manage risks and legal aspects of co-ownership.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="contingencyPlan"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Do you have a contingency plan in case you are unable to make mortgage payments?
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

          <FormField
            control={form.control}
            name="reserveFund"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Would you be comfortable contributing to a reserve fund for emergency expenses related to the property?
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

          <FormField
            control={form.control}
            name="disputeHandling"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How do you prefer handling disputes among co-owners?
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mediation">Mediation</SelectItem>
                    <SelectItem value="Legal Action">Legal Action</SelectItem>
                    <SelectItem value="Buyout clause">Buyout clause</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legalAgreement"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Would you be open to signing a legal agreement outlining co-ownership responsibilities?
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
            {loading ? "Saving..." : "Save Risk Management Preferences"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
