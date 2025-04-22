
import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageSquare, Building, Gavel, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNavigation() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => path.includes(route);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/dashboard') && !path.includes('/legal') && !path.includes('/rent') && !path.includes('/buy') ? "text-roomie-purple" : "text-gray-500"
          )}
        >
          <Home size={24} />
          <span className="mt-1">Home</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/legal') ? "text-roomie-purple" : "text-gray-500"
          )}>
            <Gavel size={24} />
            <span className="mt-1">Legal AI</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/legal">AI Legal Assistant</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/buy') ? "text-roomie-purple" : "text-gray-500"
          )}>
            <Building size={24} />
            <span className="mt-1">Buy & Co-Own</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile/co-owner">Create Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/co-owner-recommendations">Co-owners</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/buy">Buy</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/rent') || isActive('/roommate') ? "text-roomie-purple" : "text-gray-500"
          )}>
            <User size={24} />
            <span className="mt-1">Rent & Roommate</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile/roommate">Find Roommate</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/rent-opportunities">Find Rent</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
