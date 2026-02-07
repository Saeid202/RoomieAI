import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MasterBoxProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function MasterBox({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  className,
  children 
}: MasterBoxProps) {
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-indigo-500/30 relative overflow-hidden h-full min-h-[160px]",
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-3 relative z-10 h-full flex flex-col">
        <div className="flex items-start gap-2 mb-2">
          <div className="p-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300 group-hover:scale-110 shadow-lg">
            <Icon className="h-5 w-5 text-white group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors leading-tight">{title}</h3>
            <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">{description}</p>
          </div>
        </div>
        
        {children && (
          <div className="mt-auto space-y-1 pt-1">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
