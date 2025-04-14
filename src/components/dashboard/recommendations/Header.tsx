
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToastNotifications } from "@/hooks/useToastNotifications";

interface HeaderProps {
  onRefreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

export function Header({ onRefreshProfile, isAuthenticated }: HeaderProps) {
  const { showSuccess } = useToastNotifications();

  const handleNotificationClick = () => {
    showSuccess(
      "Notifications", 
      "You have 2 new notifications"
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <h1 className="text-3xl font-bold tracking-tight">Find My Ideal Roommate</h1>
      {isAuthenticated && (
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            aria-label="Notifications"
            onClick={handleNotificationClick}
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
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Profile</span>
          </Button>
        </div>
      )}
    </div>
  );
}
