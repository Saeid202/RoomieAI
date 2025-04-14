
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

export function Header({ onRefreshProfile, isAuthenticated }: HeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
      {isAuthenticated && (
        <button 
          onClick={onRefreshProfile}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          Refresh Profile
        </button>
      )}
    </div>
  );
}
