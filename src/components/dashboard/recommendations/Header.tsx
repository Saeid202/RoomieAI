
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onRefreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

export function Header({ onRefreshProfile, isAuthenticated }: HeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
      {isAuthenticated && (
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              2
            </Badge>
          </Button>
          
          <Button 
            onClick={onRefreshProfile}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh Profile</span>
          </Button>
        </div>
      )}
    </div>
  );
}
