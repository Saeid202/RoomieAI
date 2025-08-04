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
    tight: "space-y-4",
    normal: "space-y-6", 
    loose: "space-y-8"
  };

  return (
    <section className={cn(
      "w-full px-4 md:px-0",
      spacingMap[spacing],
      className
    )}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground mt-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}