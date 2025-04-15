
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="font-medium">Password</Label>
          <Button 
            type="button" 
            variant="link" 
            className="p-0 h-auto text-xs text-roomie-purple"
            onClick={onForgotPassword}
          >
            Forgot password?
          </Button>
        </div>
        <Input 
          id="password" 
          type="password" 
          placeholder="Enter your password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-11 bg-roomie-purple hover:bg-roomie-dark text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};
