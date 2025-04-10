
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({
  email,
  setEmail,
  isLoading,
  onSubmit,
  onBackToLogin
}: ForgotPasswordFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-email" className="font-medium">Email</Label>
        <Input 
          id="forgot-email" 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-1/2 h-11"
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          Back to Login
        </Button>
        <Button 
          type="submit" 
          className="w-1/2 h-11 bg-roomie-purple hover:bg-roomie-dark text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>
    </form>
  );
};
