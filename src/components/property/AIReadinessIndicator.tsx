// =====================================================
// AI Readiness Indicator Component
// =====================================================
// Purpose: Show overall AI readiness status for a property
//          with MANUAL processing trigger
// =====================================================

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Zap,
  Info
} from "lucide-react";
import { 
  checkPropertyAIReadiness,
  processAllPropertyDocuments 
} from "@/services/aiPropertyAssistantService";
import type { PropertyAIReadiness } from "@/types/aiPropertyAssistant";
import { toast } from "sonner";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const checkReadiness = async () => {
    try {
      const status = await checkPropertyAIReadiness(propertyId);
      setReadiness(status);
    } catch (error) {
      console.error("Failed to check AI readiness:", error);
    }
  };

  useEffect(() => {
    const loadReadiness = async () => {
      setIsLoading(true);
      await checkReadiness();
      setIsLoading(false);
    };

    loadReadiness();

    // Poll every 10 seconds if processing
    const interval = setInterval(() => {
      if (readiness && readiness.processingDocuments > 0) {
        checkReadiness();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [propertyId, readiness?.processingDocuments]);

  const handleProcessDocuments = async () => {
    setIsProcessing(true);
    try {
      const result = await processAllPropertyDocuments(propertyId);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh status
        await checkReadiness();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to process documents:", error);
      toast.error("Failed to start processing");
    } finally {
      setIsProcessing(false);
    }
  };

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

  // Button variant - just the "Ask AI" button or process button
  if (variant === "button") {
    if (!readiness.isReady && readiness.pendingDocuments > 0) {
      return (
        <Button
          onClick={handleProcessDocuments}
          disabled={isProcessing}
          className="gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Process for AI
            </>
          )}
        </Button>
      );
    }

    if (readiness.processingDocuments > 0) {
      return (
        <Button
          disabled
          variant="outline"
          className="gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing {readiness.processingDocuments}...
        </Button>
      );
    }

    if (readiness.isReady) {
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

    return null;
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
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
        <Zap className="h-3 w-3 mr-1" />
        Ready to Process
      </Badge>
    );
  }

  // Full variant - detailed card with manual processing button
  return (
    <div className="rounded-2xl border-4 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 flex items-center justify-center shadow-xl">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              AI Property Assistant
            </h3>
            <p className="text-sm text-slate-700 font-medium">
              {readiness.isReady 
                ? "Ready to answer your questions" 
                : readiness.processingDocuments > 0
                ? "Processing documents..."
                : "Documents ready to process"}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center p-3 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
          <p className="text-2xl font-black text-slate-900">{readiness.totalDocuments}</p>
          <p className="text-xs text-slate-600 font-bold">Total</p>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm">
          <p className="text-2xl font-black text-green-700">{readiness.processedDocuments}</p>
          <p className="text-xs text-green-600 font-bold">Ready</p>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-sm">
          <p className="text-2xl font-black text-blue-700">{readiness.processingDocuments}</p>
          <p className="text-xs text-blue-600 font-bold">Processing</p>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 shadow-sm">
          <p className="text-2xl font-black text-purple-700">{readiness.pendingDocuments}</p>
          <p className="text-xs text-purple-600 font-bold">Pending</p>
        </div>
      </div>

      {/* Progress Bar (only show if processing) */}
      {readiness.processingDocuments > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 font-bold">Processing Progress</span>
            <span className="font-black text-slate-900">
              {Math.round((readiness.processedDocuments / readiness.totalDocuments) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 h-3 rounded-full transition-all duration-300 shadow-md"
              style={{
                width: `${(readiness.processedDocuments / readiness.totalDocuments) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status Message & Action Button */}
      {readiness.isReady ? (
        <>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 mb-4 shadow-sm">
            <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
            <p className="text-sm text-green-900 font-bold">
              ✅ All documents indexed! Ask me anything about this property.
            </p>
          </div>
          <Button
            onClick={onOpenChat}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 shadow-lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Open AI Chat
          </Button>
        </>
      ) : readiness.processingDocuments > 0 ? (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-sm">
          <Loader2 className="h-6 w-6 text-blue-600 shrink-0 animate-spin" />
          <p className="text-sm text-blue-900 font-bold">
            Processing {readiness.processingDocuments} document(s)... This usually takes 1-2 minutes.
          </p>
        </div>
      ) : readiness.failedDocuments > 0 ? (
        <>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 mb-4 shadow-sm">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-900 font-bold">
              {readiness.failedDocuments} document(s) failed. You can retry or continue with available documents.
            </p>
          </div>
          <Button
            onClick={handleProcessDocuments}
            disabled={isProcessing}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Starting Processing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Retry Failed Documents
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 mb-4 shadow-sm">
            <Info className="h-6 w-6 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-purple-900 font-bold mb-1">
                Ready to Process Documents
              </p>
              <p className="text-xs text-purple-800 leading-relaxed">
                Click the button below to analyze your documents with AI. This allows you to ask questions about property details, disclosures, and more.
              </p>
            </div>
          </div>
          <Button
            onClick={handleProcessDocuments}
            disabled={isProcessing}
            className="w-full h-14 text-lg font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 shadow-xl hover:shadow-2xl transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Starting Processing...
              </>
            ) : (
              <>
                <Zap className="h-6 w-6 mr-2" />
                Process Documents for AI
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
