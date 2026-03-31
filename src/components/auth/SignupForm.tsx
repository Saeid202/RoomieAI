
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/contexts/RoleContext";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["seeker", "landlord", "renovator", "mortgage_broker", "lawyer", "lender"], {
    required_error: "Please select a role",
  }),
});

export type SignupFormValues = z.infer<typeof formSchema>;

interface SignupFormProps {
  onSubmit: (values: SignupFormValues) => Promise<void>;
  isLoading: boolean;
}

export const SignupForm = ({ onSubmit, isLoading }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "seeker",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm">Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} className="h-9 text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} className="h-9 text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="h-9 pr-9 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-9 px-2 py-1 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-gray-500" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="font-medium text-sm">I am a:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1.5"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="seeker" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-xs">
                      Seeker - Looking for rent
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="landlord" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-xs">
                      Landlord - Manage properties
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="renovator" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-xs">
                      Renovator - Find jobs
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mortgage_broker" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-xs">
                      Mortgage Broker
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lawyer" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-xs">
                      Lawyer - Legal services
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lender" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-xs">
                      Lender - Financing
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-9 bg-roomie-purple hover:bg-roomie-dark text-white font-medium text-sm"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};
