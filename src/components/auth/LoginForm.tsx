
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
  onForgotPassword
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // DEBUG: This should be visible
  console.log("LoginForm rendering with showPassword:", showPassword);

  return (
    <form onSubmit={onSubmit} className="space-y-8 mt-8 p-6 border-2 border-blue-500 bg-blue-50">
      <div className="space-y-4">
        <Label htmlFor="email" className="font-medium text-xl text-blue-700">Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="h-16 text-xl px-4 border-2 border-blue-400"
        />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="font-medium text-lg">Password</Label>
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto text-sm text-roomie-purple"
            onClick={onForgotPassword}
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input 
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-16 pr-20 text-xl px-4 border-2 border-blue-400"
          />
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="absolute right-1 top-1 h-14 w-14 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-lg border-2 border-red-700"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ zIndex: 50 }}
          >
            {showPassword ? (
              <EyeOff className="h-8 w-8 text-white" />
            ) : (
              <Eye className="h-8 w-8 text-white" />
            )}
          </Button>
        </div>
      </div>
      
      {/* TEST EYE ICON - This should always be visible */}
      <div className="mt-4 p-4 bg-yellow-300 border-4 border-yellow-600 rounded-lg">
        <p className="text-lg font-bold text-yellow-900 mb-2">TEST EYE ICON:</p>
        <Button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="bg-purple-600 text-white p-4 rounded-lg"
        >
          {showPassword ? (
            <EyeOff className="h-12 w-12 text-white" />
          ) : (
            <Eye className="h-12 w-12 text-white" />
          )}
        </Button>
        <p className="text-sm text-yellow-800 mt-2">Password is {showPassword ? 'VISIBLE' : 'HIDDEN'}</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-xl border-2 border-green-800"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "LOGIN"}
      </Button>
    </form>
  );
};
