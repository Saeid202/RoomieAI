
import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageSquare, Building, Gavel, Plus } from "lucide-react";
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
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
        <div className="flex items-center justify-around h-16">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex flex-col items-center justify-center flex-1 min-w-0 text-xs",
              isActive('/dashboard') && !path.includes('/legal') ? "text-roomie-purple" : "text-gray-500"
            )}
          >
            <Home size={20} />
            <span className="mt-1">Home</span>
          </Link>

          <Link 
            to="/dashboard/legal-assistant" 
            className={cn(
              "flex flex-col items-center justify-center flex-1 min-w-0 text-xs",
              isActive('/legal-assistant') ? "text-roomie-purple" : "text-gray-500"
            )}
          >
            <Gavel size={20} />
            <span className="mt-1">Legal AI</span>
          </Link>
          
          <Link
            to="/dashboard/create-listing"
            className={cn(
              "flex flex-col items-center justify-center flex-1 min-w-0 text-xs",
              isActive('/create-listing') ? "text-roomie-purple" : "text-gray-500"
            )}
          >
            <Plus size={20} className="p-1 rounded-full bg-roomie-purple text-white" />
            <span className="mt-1">Create</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "flex flex-col items-center justify-center flex-1 min-w-0 text-xs border-0 bg-transparent",
              isActive('/rent') || isActive('/roommate') ? "text-roomie-purple" : "text-gray-500"
            )}>
              <Building size={20} />
              <span className="mt-1">Rent & Room</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/roommate">Find Roommate</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/rent">Find Rent</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/list-room">List Your Room</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link 
            to="/dashboard/profile" 
            className={cn(
              "flex flex-col items-center justify-center flex-1 min-w-0 text-xs",
              isActive('/profile') ? "text-roomie-purple" : "text-gray-500"
            )}
          >
            <User size={20} />
            <span className="mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
