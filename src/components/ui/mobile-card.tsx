import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  compact?: boolean;
}

export function MobileCard({ 
  title, 
  icon, 
  children, 
  className, 
  headerAction,
  compact = false 
}: MobileCardProps) {
  return (
    <Card className={cn(
      "rounded-2xl shadow-sm border-border/50 bg-background/95 backdrop-blur-sm",
      "hover:shadow-md transition-all duration-300",
      compact && "p-0",
      className
    )}>
      {title && (
        <CardHeader className={cn(
          "pb-4",
          compact && "pb-2 px-4 pt-4"
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "flex items-center gap-3 text-foreground",
              compact ? "text-lg" : "text-xl"
            )}>
              {icon && (
                <div className="p-2 bg-primary/10 rounded-xl">
                  {icon}
                </div>
              )}
              {title}
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        compact && "px-4 pb-4"
      )}>
        {children}
      </CardContent>
    </Card>
  );
}