// =====================================================
// AI Property Badge Component
// =====================================================
// Purpose: Shows "AI Ready" badge on property cards
//          Marketing feature to highlight AI-enabled properties
// =====================================================

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { checkPropertyAIReadiness } from "@/services/aiPropertyAssistantService";

interface AIPropertyBadgeProps {
  propertyId: string;
  variant?: "default" | "compact";
}

export function AIPropertyBadge({
  propertyId,
  variant = "default",
}: AIPropertyBadgeProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(false);

  useEffect(() => {
    const checkReadiness = async () => {
      try {
        const status = await checkPropertyAIReadiness(propertyId);
        setIsReady(status.isReady);
        setHasDocuments(status.totalDocuments > 0);
      } catch (error) {
        console.error("Failed to check AI readiness:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkReadiness();
  }, [propertyId]);

  // Don't show if no documents
  if (!hasDocuments || isLoading) {
    return null;
  }

  if (variant === "compact") {
    return (
      <Badge
        className={
          isReady
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 text-[10px] font-bold shadow-md"
            : "bg-slate-400 text-white text-[10px] font-bold"
        }
      >
        {isReady ? (
          <>
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            AI
          </>
        ) : (
          <>
            <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
            AI
          </>
        )}
      </Badge>
    );
  }

  return (
    <Badge
      className={
        isReady
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-500"
          : "bg-slate-400 text-white text-xs font-bold"
      }
    >
      {isReady ? (
        <>
          <Sparkles className="h-3 w-3 mr-1" />
          AI Ready
        </>
      ) : (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </>
      )}
    </Badge>
  );
}
