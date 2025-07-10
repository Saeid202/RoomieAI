import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  spacing?: "tight" | "normal" | "loose";
}

export function MobileSection({ 
  title, 
  subtitle,
  children, 
  className,
  headerAction,
  spacing = "normal"
}: MobileSectionProps) {
  const spacingMap = {
    tight: "space-y-3",
    normal: "space-y-6", 
    loose: "space-y-8"
  };

  return (
    <section className={cn(
      "w-full",
      spacingMap[spacing],
      className
    )}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </section>
  );
}