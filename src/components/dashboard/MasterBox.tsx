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
        "group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-primary/60 bg-gradient-to-br from-white via-gray-50 to-white hover:from-primary/8 hover:via-primary/12 hover:to-white relative overflow-hidden h-full min-h-[280px]",
        className
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-6 relative z-10 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/25 transition-all duration-300 group-hover:scale-110 shadow-md">
            <Icon className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary/95 transition-colors leading-tight">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-2">{description}</p>
          </div>
        </div>
        
        {children && (
          <div className="mt-auto space-y-2 pt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
