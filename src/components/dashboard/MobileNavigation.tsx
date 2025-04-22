
import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageSquare, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
            isActive('/dashboard') && !isActive('/profile') ? "text-roomie-purple" : "text-gray-500"
          )}
        >
          <Home size={24} />
          <span className="mt-1">Home</span>
        </Link>
        <Link 
          to="/dashboard/profile" 
          className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/profile') ? "text-roomie-purple" : "text-gray-500"
          )}
        >
          <User size={24} />
          <span className="mt-1">Profile</span>
        </Link>
        <Link 
          to="/dashboard/chats" 
          className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/chats') ? "text-roomie-purple" : "text-gray-500"
          )}
        >
          <MessageSquare size={24} />
          <span className="mt-1">Chats</span>
        </Link>
        <Link 
          to="/dashboard/wallet" 
          className={cn(
            "flex flex-col items-center justify-center flex-1 min-w-0 text-sm",
            isActive('/wallet') ? "text-roomie-purple" : "text-gray-500"
          )}
        >
          <Wallet size={24} />
          <span className="mt-1">Wallet</span>
        </Link>
      </div>
    </nav>
  );
}
