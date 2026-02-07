import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubFeatureButtonProps {
  emoji: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function SubFeatureButton({ 
  emoji, 
  label, 
  onClick, 
  className 
}: SubFeatureButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "justify-start h-auto py-2 px-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors group",
        className
      )}
    >
      <span className="mr-2 text-base">{emoji}</span>
      <span>{label}</span>
    </Button>
  );
}
