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
      "rounded-3xl shadow-sm border-border/20 bg-background/95 backdrop-blur-sm",
      "hover:shadow-lg active:scale-[0.98] transition-all duration-300",
      "touch-manipulation", // Optimizes touch interactions
      compact && "p-0",
      className
    )}>
      {title && (
        <CardHeader className={cn(
          "pb-4 px-6 pt-6",
          compact && "pb-3 px-4 pt-4"
        )}>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className={cn(
              "flex items-center gap-4 text-foreground font-bold",
              compact ? "text-xl" : "text-2xl"
            )}>
              {icon && (
                <div className={cn(
                  "p-3 bg-primary/10 rounded-2xl flex-shrink-0",
                  compact && "p-2 rounded-xl"
                )}>
                  {icon}
                </div>
              )}
              <span className="truncate">{title}</span>
            </CardTitle>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        "px-6 pb-6",
        compact && "px-4 pb-4",
        !title && "pt-6"
      )}>
        {children}
      </CardContent>
    </Card>
  );
}