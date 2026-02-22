// =====================================================
// Floating AI Button Component
// =====================================================
// Purpose: Always-visible button that follows scroll
//          Opens AI chat modal when clicked
// =====================================================

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { checkPropertyAIReadiness } from "@/services/aiPropertyAssistantService";
import { cn } from "@/lib/utils";

interface FloatingAIButtonProps {
  propertyId: string;
  onOpenChat: () => void;
  className?: string;
}

export function FloatingAIButton({
  propertyId,
  onOpenChat,
  className,
}: FloatingAIButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkReadiness = async () => {
      setIsLoading(true);
      try {
        const status = await checkPropertyAIReadiness(propertyId);
        setIsReady(status.isReady);
        setIsVisible(status.totalDocuments > 0); // Only show if documents exist
      } catch (error) {
        console.error("Failed to check AI readiness:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkReadiness();

    // Poll every 10 seconds if not ready
    const interval = setInterval(() => {
      if (!isReady) {
        checkReadiness();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [propertyId, isReady]);

  // Don't show if no documents or still loading
  if (!isVisible || isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
    >
      <Button
        onClick={onOpenChat}
        disabled={!isReady}
        size="lg"
        className={cn(
          "h-14 px-6 rounded-full shadow-2xl transition-all duration-300",
          isReady
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-indigo-500/50"
            : "bg-slate-400 cursor-not-allowed"
        )}
      >
        {!isReady ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span className="font-semibold">Processing...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            <span className="font-semibold">Ask AI</span>
          </>
        )}
      </Button>

      {/* Pulse animation when ready */}
      {isReady && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-ping opacity-20" />
      )}
    </div>
  );
}
