
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  isPermanentResident: z.enum(["yes", "no"]),
  originCountry: z.string().min(1, "Please select your country of origin"),
  canadaStatus: z.string().min(1, "Please select your status in Canada"),
  eligibleForPR: z.enum(["yes", "no", "maybe"]),
  canadianFamilyMembers: z.enum(["yes", "no"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ResidenceCitizenshipForm() {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPermanentResident: "no",
      originCountry: "",
      canadaStatus: "",
      eligibleForPR: "maybe",
      canadianFamilyMembers: "no",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("Form submitted:", values);
    toast({
      title: "Information saved",
      description: "Your residence and citizenship information has been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residence & Citizenship</CardTitle>
        <CardDescription>
          Please provide information about your citizenship and residence status.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isPermanentResident"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you a citizen or permanent resident?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
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
              name="originCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where are you from?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canadaStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your status in Canada?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="permanent_resident">Permanent Resident</SelectItem>
                      <SelectItem value="work_permit">Work Permit</SelectItem>
                      <SelectItem value="study_permit">Study Permit</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eligibleForPR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Are you eligible to apply for permanent residence in the next two years?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="maybe">Maybe / Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canadianFamilyMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have any family members who are Canadian citizens or permanent residents?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
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
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Information</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
