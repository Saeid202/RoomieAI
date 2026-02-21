// =====================================================
// Document Processing Badge Component
// =====================================================
// Purpose: Show processing status for AI document indexing
// =====================================================

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { 
  getDocumentProcessingStatus,
  retryDocumentProcessing 
} from "@/services/aiPropertyAssistantService";
import type { DocumentProcessingStatus } from "@/types/aiPropertyAssistant";
import { toast } from "sonner";

interface DocumentProcessingBadgeProps {
  documentId: string;
  propertyId: string;
  documentUrl: string;
  documentType: string;
  compact?: boolean;
}

export function DocumentProcessingBadge({
  documentId,
  propertyId,
  documentUrl,
  documentType,
  compact = false,
}: DocumentProcessingBadgeProps) {
  const [status, setStatus] = useState<DocumentProcessingStatus | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const processingStatus = await getDocumentProcessingStatus(documentId);
        setStatus(processingStatus);
      } catch (error) {
        console.error("Failed to check processing status:", error);
      }
    };

    checkStatus();

    // Poll every 5 seconds if processing
    const interval = setInterval(() => {
      if (status?.status === "processing" || status?.status === "pending") {
        checkStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documentId, status?.status]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryDocumentProcessing(documentId, propertyId, documentUrl, documentType);
      toast.success("Processing restarted");
      
      // Refresh status
      const newStatus = await getDocumentProcessingStatus(documentId);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to retry processing:", error);
      toast.error("Failed to restart processing");
    } finally {
      setIsRetrying(false);
    }
  };

  if (!status) {
    return (
      <Badge variant="outline" className="text-[10px]">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  }

  if (compact) {
    // Compact version for document slots
    switch (status.status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Ready
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px]">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px]">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  }

  // Full version with details
  return (
    <div className="space-y-2">
      {status.status === "completed" && (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-900">AI Ready</p>
            <p className="text-[10px] text-green-700">
              {status.total_chunks} chunks indexed
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-green-600" />
        </div>
      )}

      {status.status === "processing" && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 shrink-0 animate-spin" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-900">Processing...</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-blue-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(status.processed_chunks / status.total_chunks) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-blue-700 shrink-0">
                {status.processed_chunks}/{status.total_chunks}
              </span>
            </div>
          </div>
        </div>
      )}

      {status.status === "failed" && (
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-900">Processing Failed</p>
            <p className="text-[10px] text-red-700 line-clamp-1">
              {status.error_message || "Unknown error"}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            {isRetrying ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}

      {status.status === "pending" && (
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <Clock className="h-4 w-4 text-slate-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900">Queued</p>
            <p className="text-[10px] text-slate-600">
              Waiting to process...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
