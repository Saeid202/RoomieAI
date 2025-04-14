
import { AlertCircle, Lock } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
}

export function EmptyState({ title, description, icon = "alert" }: EmptyStateProps) {
  const getIcon = (): ReactNode => {
    switch (icon) {
      case "lock":
        return <Lock className="h-12 w-12 text-muted-foreground" />;
      case "alert":
      default:
        return <AlertCircle className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-lg border border-dashed">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}
