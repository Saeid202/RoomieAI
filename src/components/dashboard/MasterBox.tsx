import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

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
  // Split "1. Profile" into number "01" and label "Profile"
  const match = title.match(/^(\d+)\.\s*(.+)$/);
  const number = match ? String(parseInt(match[1])).padStart(2, "0") : null;
  const label = match ? match[2] : title;

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 border border-gray-200 hover:border-violet-300 bg-white shadow-md hover:shadow-lg relative overflow-hidden h-full min-h-[180px]",
        className
      )}
      onClick={onClick}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full bg-violet-100 group-hover:bg-violet-500 transition-colors duration-200" />

      <CardContent className="p-6 relative z-10 h-full flex flex-col">
        {/* Header row: icon + number/title */}
        <div className="flex items-start gap-4 mb-3">
          <div className="p-3 rounded-xl bg-violet-600 flex-shrink-0 shadow-sm group-hover:bg-violet-700 transition-colors duration-200">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {number && (
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">
                {number}
              </p>
            )}
            <h3 className="text-base font-bold text-gray-900 leading-tight">{label}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-1 line-clamp-2">{description}</p>
          </div>
        </div>

        {children && (
          <div className="mt-2 space-y-1">
            {children}
          </div>
        )}

        {/* Arrow indicator — bottom right */}
        {!children && (
          <div className="mt-auto flex justify-end pt-2">
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 transition-colors duration-200" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
