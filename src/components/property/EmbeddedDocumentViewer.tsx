// =====================================================
// Embedded Document Viewer Component
// =====================================================
// Purpose: Display documents (PDF, images) embedded
//          in the page instead of opening in browser
// =====================================================

import { useState, useEffect } from "react";
import React from "react";
import { PDFViewer } from "./PDFViewer";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmbeddedDocumentViewerProps {
  documentUrl: string;
  documentName: string;
  mimeType?: string;
  onClose?: () => void;
  compact?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
  zoom?: number;
}

export function EmbeddedDocumentViewer({
  documentUrl,
  documentName,
  mimeType,
  onClose,
  compact = false,
  scrollRef,
  zoom,
}: EmbeddedDocumentViewerProps) {
  const [documentType, setDocumentType] = useState<"pdf" | "image" | "unknown">("unknown");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine document type
  useEffect(() => {
    const determinType = () => {
      // Check MIME type first
      if (mimeType) {
        if (mimeType.includes("pdf")) {
          setDocumentType("pdf");
          return;
        }
        if (mimeType.includes("image")) {
          setDocumentType("image");
          return;
        }
      }

      // Check file extension
      const extension = documentName.split(".").pop()?.toLowerCase();
      if (extension === "pdf") {
        setDocumentType("pdf");
      } else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
        setDocumentType("image");
      } else {
        setDocumentType("unknown");
      }
    };

    determinType();
  }, [documentName, mimeType]);

  const handleLoadError = () => {
    setError("Failed to load document");
    setIsLoading(false);
  };

  const handleLoadSuccess = () => {
    setError(null);
    setIsLoading(false);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, "_blank");
    toast.info("Opening document in new tab");
  };

  if (documentType === "unknown") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-100 rounded-lg p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
        <p className="text-slate-900 font-semibold mb-2">Unsupported file type</p>
        <p className="text-sm text-slate-600 mb-4">
          This file type cannot be previewed in the viewer.
        </p>
        <Button
          onClick={handleOpenInNewTab}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Open in New Tab
        </Button>
      </div>
    );
  }

  if (documentType === "image") {
    return (
      <div className="flex flex-col h-full bg-slate-900">
        {!compact && (
          <div className="bg-slate-800 border-b border-slate-700 p-3 flex items-center justify-between">
            <span className="text-sm text-slate-300 font-medium">{documentName}</span>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-300 hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-4">
          <img
            src={documentUrl}
            alt={documentName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={() => handleLoadError()}
            onLoad={() => handleLoadSuccess()}
          />
        </div>
      </div>
    );
  }

  // PDF viewer
  return (
    <PDFViewer
      documentUrl={documentUrl}
      documentName={documentName}
      onLoadError={handleLoadError}
      onLoadSuccess={handleLoadSuccess}
      compact={compact}
      scrollRef={scrollRef}
      zoom={zoom}
    />
  );
}
