
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium text-sm text-gray-700">Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your full name" 
                  {...field} 
                  className="h-11 text-sm border-gray-300 focus:border-roomie-purple focus:ring-roomie-purple/20" 
                />
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
              <FormLabel className="font-medium text-sm text-gray-700">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  {...field} 
                  className="h-11 text-sm border-gray-300 focus:border-roomie-purple focus:ring-roomie-purple/20" 
                />
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
              <FormLabel className="font-medium text-sm text-gray-700">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password (min. 6 characters)"
                    {...field}
                    className="h-11 pr-11 text-sm border-gray-300 focus:border-roomie-purple focus:ring-roomie-purple/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
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
            <FormItem className="space-y-3">
              <FormLabel className="font-medium text-sm text-gray-700">I am a:</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-2"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="seeker" className="text-roomie-purple" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-sm">
                      Seeker
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="landlord" className="text-roomie-purple" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-sm">
                      Landlord
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="renovator" className="text-roomie-purple" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-sm">
                      Renovator
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mortgage_broker" className="text-roomie-purple" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-sm">
                      Mortgage
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lawyer" className="text-roomie-purple" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-sm">
                      Lawyer
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lender" className="text-roomie-purple" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer text-sm">
                      Lender
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
          className="w-full h-11 bg-roomie-purple hover:bg-roomie-dark text-white font-medium text-sm rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};
