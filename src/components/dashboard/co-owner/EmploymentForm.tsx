
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
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

// Define employment status options
const EMPLOYMENT_STATUS = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  SELF_EMPLOYED: "self_employed",
  UNEMPLOYED: "unemployed",
  RETIRED: "retired",
} as const;

// Base schema for all employment statuses
const baseSchema = z.object({
  employmentStatus: z.enum([
    EMPLOYMENT_STATUS.FULL_TIME,
    EMPLOYMENT_STATUS.PART_TIME,
    EMPLOYMENT_STATUS.SELF_EMPLOYED,
    EMPLOYMENT_STATUS.UNEMPLOYED,
    EMPLOYMENT_STATUS.RETIRED,
  ]),
});

// Schema for employed people (full-time or part-time)
const employedSchema = baseSchema.extend({
  jobTitle: z.string().min(1, "Job title is required"),
  employmentDuration: z.string().min(1, "Employment duration is required"),
  employerName: z.string().min(1, "Employer name is required"),
  industry: z.string().min(1, "Industry is required"),
  careerChanges: z.enum(["yes", "no", "maybe"]),
});

// Schema for self-employed people
const selfEmployedSchema = baseSchema.extend({
  businessType: z.string().min(1, "Business type is required"),
  businessDuration: z.string().min(1, "Business duration is required"),
});

// Combined schema with conditional validation
const formSchema = z.discriminatedUnion("employmentStatus", [
  employedSchema.extend({
    employmentStatus: z.literal(EMPLOYMENT_STATUS.FULL_TIME),
  }),
  employedSchema.extend({
    employmentStatus: z.literal(EMPLOYMENT_STATUS.PART_TIME),
  }),
  selfEmployedSchema.extend({
    employmentStatus: z.literal(EMPLOYMENT_STATUS.SELF_EMPLOYED),
  }),
  baseSchema.extend({
    employmentStatus: z.literal(EMPLOYMENT_STATUS.UNEMPLOYED),
  }),
  baseSchema.extend({
    employmentStatus: z.literal(EMPLOYMENT_STATUS.RETIRED),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

export function EmploymentForm() {
  const { toast } = useToast();
  const [employmentStatus, setEmploymentStatus] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      employmentStatus: EMPLOYMENT_STATUS.FULL_TIME,
    } as any,
  });

  // Watch for changes to the employment status field
  const watchEmploymentStatus = form.watch("employmentStatus");
  
  // Update the local state when employment status changes
  if (watchEmploymentStatus !== employmentStatus) {
    setEmploymentStatus(watchEmploymentStatus);
  }

  const onSubmit = (values: FormValues) => {
    console.log("Form submitted:", values);
    toast({
      title: "Information saved",
      description: "Your employment information has been saved.",
    });
  };

  const isEmployed = 
    employmentStatus === EMPLOYMENT_STATUS.FULL_TIME || 
    employmentStatus === EMPLOYMENT_STATUS.PART_TIME;
  
  const isSelfEmployed = employmentStatus === EMPLOYMENT_STATUS.SELF_EMPLOYED;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment</CardTitle>
        <CardDescription>
          Please provide information about your current employment situation.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your current employment status?</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.reset({
                        employmentStatus: value as any,
                      });
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your employment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EMPLOYMENT_STATUS.FULL_TIME}>Full Time</SelectItem>
                      <SelectItem value={EMPLOYMENT_STATUS.PART_TIME}>Part Time</SelectItem>
                      <SelectItem value={EMPLOYMENT_STATUS.SELF_EMPLOYED}>Self Employed</SelectItem>
                      <SelectItem value={EMPLOYMENT_STATUS.UNEMPLOYED}>Unemployed</SelectItem>
                      <SelectItem value={EMPLOYMENT_STATUS.RETIRED}>Retired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEmployed && (
              <>
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your current job title?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employmentDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long have you been employed at your current job?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 3 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is the name of your employer?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your industry of work?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="careerChanges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you foresee any major career changes in the next 2 years?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </>
            )}

            {isSelfEmployed && (
              <>
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What business are you involved in?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Consulting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long have you been in this business?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5 years" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(employmentStatus === EMPLOYMENT_STATUS.UNEMPLOYED || employmentStatus === EMPLOYMENT_STATUS.RETIRED) && (
              <p className="text-muted-foreground text-sm">
                Thank you for providing your employment status. No additional employment information is needed.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Information</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
