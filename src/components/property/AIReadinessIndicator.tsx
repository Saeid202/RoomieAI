// =====================================================
// AI Readiness Indicator Component
// =====================================================
// Purpose: Show overall AI readiness status for a property
// =====================================================

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import { checkPropertyAIReadiness } from "@/services/aiPropertyAssistantService";
import type { PropertyAIReadiness } from "@/types/aiPropertyAssistant";

interface AIReadinessIndicatorProps {
  propertyId: string;
  onOpenChat?: () => void;
  variant?: "full" | "compact" | "button";
}

export function AIReadinessIndicator({
  propertyId,
  onOpenChat,
  variant = "full",
}: AIReadinessIndicatorProps) {
  const [readiness, setReadiness] = useState<PropertyAIReadiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkReadiness = async () => {
      setIsLoading(true);
      try {
        const status = await checkPropertyAIReadiness(propertyId);
        setReadiness(status);
      } catch (error) {
        console.error("Failed to check AI readiness:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkReadiness();

    // Poll every 10 seconds if not ready
    const interval = setInterval(() => {
      if (readiness && !readiness.isReady) {
        checkReadiness();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [propertyId, readiness?.isReady]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking AI status...</span>
      </div>
    );
  }

  if (!readiness || readiness.totalDocuments === 0) {
    return null; // No documents uploaded yet
  }

  // Button variant - just the "Ask AI" button
  if (variant === "button") {
    if (!readiness.isReady) {
      return (
        <Button
          disabled
          variant="outline"
          className="gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing Documents...
        </Button>
      );
    }

    return (
      <Button
        onClick={onOpenChat}
        className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        <Sparkles className="h-4 w-4" />
        Ask AI Assistant
      </Button>
    );
  }

  // Compact variant - just a badge
  if (variant === "compact") {
    if (readiness.isReady) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Ready
        </Badge>
      );
    }

    if (readiness.processingDocuments > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing {readiness.processingDocuments}
        </Badge>
      );
    }

    if (readiness.failedDocuments > 0) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <AlertCircle className="h-3 w-3 mr-1" />
          {readiness.failedDocuments} Failed
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Pending
      </Badge>
    );
  }

  // Full variant - detailed card
  return (
    <div className="rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Property Assistant</h3>
            <p className="text-xs text-slate-600">
              {readiness.isReady 
                ? "Ready to answer your questions" 
                : "Processing documents..."}
            </p>
          </div>
        </div>
        
        {readiness.isReady && (
          <Button
            size="sm"
            onClick={onOpenChat}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Ask AI
          </Button>
        )}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
          <p className="text-lg font-bold text-slate-900">{readiness.totalDocuments}</p>
          <p className="text-[10px] text-slate-600">Total</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
          <p className="text-lg font-bold text-green-700">{readiness.processedDocuments}</p>
          <p className="text-[10px] text-green-600">Ready</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-lg font-bold text-blue-700">{readiness.processingDocuments}</p>
          <p className="text-[10px] text-blue-600">Processing</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
          <p className="text-lg font-bold text-red-700">{readiness.failedDocuments}</p>
          <p className="text-[10px] text-red-600">Failed</p>
        </div>
      </div>

      {/* Progress Bar */}
      {!readiness.isReady && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Processing Progress</span>
            <span className="font-semibold text-slate-900">
              {Math.round((readiness.processedDocuments / readiness.totalDocuments) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(readiness.processedDocuments / readiness.totalDocuments) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      {readiness.isReady ? (
        <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-800">
            All documents indexed. Ask me anything about this property!
          </p>
        </div>
      ) : readiness.failedDocuments > 0 ? (
        <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            Some documents failed to process. AI will work with available documents.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 shrink-0 animate-spin" />
          <p className="text-xs text-blue-800">
            Processing documents... This usually takes 1-2 minutes.
          </p>
        </div>
      )}
    </div>
  );
}
