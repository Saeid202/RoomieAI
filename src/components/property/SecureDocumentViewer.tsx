// =====================================================
// Secure Document Viewer Component
// =====================================================
// Purpose: Protected document viewer with watermarking
//          and anti-download/print features using iframe
//          with overlay protection
// =====================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Shield, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecureDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentId: string;
  propertyId: string;
  viewerName: string;
  viewerEmail: string;
}

export function SecureDocumentViewer({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentId,
  propertyId,
  viewerName,
  viewerEmail,
}: SecureDocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity timeout constants
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  const WARNING_BEFORE_CLOSE = 30 * 1000; // 30 seconds

  // Function definitions (before useEffects to avoid hoisting issues)
  const logDocumentAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("document_access_logs" as any).insert({
        document_id: documentId,
        property_id: propertyId,
        viewer_id: user.id,
        viewer_email: viewerEmail,
        viewer_name: viewerName,
        access_type: "view",
      });

      console.log("📊 Document access logged");
    } catch (error) {
      console.error("Failed to log document access:", error);
    }
  };

  const logPrintAttempt = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("document_access_logs" as any).insert({
        document_id: documentId,
        property_id: propertyId,
        viewer_id: user.id,
        viewer_email: viewerEmail,
        viewer_name: viewerName,
        access_type: "print_attempt",
      });

      console.log("⚠️ Print attempt logged");
    } catch (error) {
      console.error("Failed to log print attempt:", error);
    }
  }, [documentId, propertyId, viewerEmail, viewerName]);

  const handleInactivityTimeout = useCallback(async () => {
    console.log("⏱️ Inactivity timeout triggered");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("document_access_logs" as any).insert({
          document_id: documentId,
          property_id: propertyId,
          viewer_id: user.id,
          viewer_email: viewerEmail,
          viewer_name: viewerName,
          access_type: "session_timeout",
        });
        console.log("📊 Session timeout logged");
      }
    } catch (error) {
      console.error("Failed to log session timeout:", error);
    }
    
    toast.info("Document viewer closed due to inactivity", {
      duration: 3000,
    });
    
    onClose();
  }, [documentId, propertyId, viewerEmail, viewerName, onClose]);

  const startCountdown = useCallback(() => {
    let seconds = 30;
    setSecondsRemaining(seconds);
    
    countdownIntervalRef.current = setInterval(() => {
      seconds--;
      setSecondsRemaining(seconds);
      
      if (seconds <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }
    }, 1000);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    setShowInactivityWarning(false);
    
    warningTimerRef.current = setTimeout(() => {
      console.log("⚠️ Showing inactivity warning");
      setShowInactivityWarning(true);
      startCountdown();
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_CLOSE);
    
    inactivityTimerRef.current = setTimeout(() => {
      handleInactivityTimeout();
    }, INACTIVITY_TIMEOUT);
  }, [INACTIVITY_TIMEOUT, WARNING_BEFORE_CLOSE, startCountdown, handleInactivityTimeout]);

  // Log document access
  useEffect(() => {
    if (isOpen) {
      logDocumentAccess();
    }
  }, [isOpen]);

  // Comprehensive keyboard shortcut blocking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Block save, print, inspect, view source, etc.
      if (
        (cmdOrCtrl && e.key === "s") ||
        (cmdOrCtrl && e.key === "p") ||
        (cmdOrCtrl && e.shiftKey && e.key === "I") ||
        (cmdOrCtrl && e.shiftKey && e.key === "J") ||
        (cmdOrCtrl && e.key === "u") ||
        e.key === "F12"
      ) {
        e.preventDefault();
        e.stopPropagation();
        
        if (cmdOrCtrl && e.key === "p") {
          toast.error("Printing is disabled for security on confidential documents", {
            duration: 2000,
          });
          logPrintAttempt();
        } else if (cmdOrCtrl && e.key === "s") {
          toast.error("Saving is disabled for security on confidential documents", {
            duration: 2000,
          });
        } else {
          toast.error("This action is disabled for security", {
            duration: 2000,
          });
        }
        return false;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying is disabled for security", { duration: 2000 });
    };

    // Add all event listeners with capture phase
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCopy, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCopy, true);
    };
  }, [isOpen, logPrintAttempt]);

  // Inactivity timer and activity detection
  useEffect(() => {
    if (!isOpen) return;

    const activityEvents = ['mousemove', 'scroll', 'keypress', 'touchstart', 'wheel', 'click'];
    
    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Initialize timer on mount
    resetInactivityTimer();
    console.log("⏱️ Inactivity timer started");

    return () => {
      // Cleanup all timers and listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      console.log("⏱️ Inactivity timer cleaned up");
    };
  }, [isOpen, resetInactivityTimer]);

  const getCurrentDateTime = () => {
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const watermarkText = `CONFIDENTIAL - Authorized for ${viewerName} (${viewerEmail}) on ${getCurrentDateTime()}`;

  // Handle overlay mouse events to block right-click
  const handleOverlayContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.error("Right-click is disabled for security on confidential documents", {
      duration: 2000,
    });
    return false;
  };

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    // Allow left-click for scrolling but prevent right-click
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  const handleOverlayDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(false);
    console.log("✅ PDF loaded successfully");
  };

  const handleIframeError = () => {
    console.error("❌ Failed to load PDF");
    setIsLoading(false);
    setLoadError(true);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank');
    toast.info("Opening document in new tab");
  };

  // Format PDF URL for iframe display
  const getPdfUrl = () => {
    console.log("📄 Original document URL:", documentUrl);
    
    try {
      // Add #toolbar=0 to hide PDF toolbar and #view=FitH for better display
      const url = new URL(documentUrl);
      const formattedUrl = `${url.href}#toolbar=0&navpanes=0&scrollbar=1`;
      console.log("📄 Formatted PDF URL:", formattedUrl);
      return formattedUrl;
    } catch (error) {
      console.error("❌ Error formatting URL:", error);
      // If URL parsing fails, return original
      return documentUrl;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @media print {
          body {
            display: none !important;
          }
        }
        
        .secure-viewer-container {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -webkit-touch-callout: none;
        }
        
        .secure-viewer-container * {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
        
        .pdf-iframe {
          border: none;
          width: 100%;
          height: 100%;
        }
        
        .iframe-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          background: transparent;
          cursor: default;
        }
        
        .watermark-overlay {
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 20;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
        }
        
        .watermark-text {
          position: absolute;
          font-size: 24px;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.12);
          white-space: nowrap;
          transform: rotate(-45deg);
          user-select: none;
          pointer-events: none;
        }
      `}</style>

      <div 
        className="fixed inset-0 z-50 bg-slate-900 secure-viewer-container"
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-700 bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Secure Document Viewer
              </h2>
              <p className="text-sm text-indigo-200">{documentName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Security Notice */}
        <div className="h-12 bg-amber-500 flex items-center justify-center px-6">
          <div className="flex items-center gap-2 text-amber-950">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-semibold">
              This document is protected. Downloading, printing, and screenshots are disabled. All access is logged.
            </p>
          </div>
        </div>

        {/* Inactivity Warning Banner */}
        {showInactivityWarning && (
          <div className="h-12 bg-amber-400 flex items-center justify-center px-6 border-b border-amber-500">
            <div className="flex items-center gap-2 text-amber-950">
              <Clock className="h-4 w-4 shrink-0 animate-pulse" />
              <p className="text-sm font-semibold">
                For your security, this session will expire in {secondsRemaining} seconds due to inactivity.
              </p>
            </div>
          </div>
        )}

        {/* PDF Viewer with Overlay Protection */}
        <div className={`relative overflow-hidden bg-slate-800 ${
          showInactivityWarning ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-7rem)]'
        }`}>
          {/* Loading Indicator */}
          {isLoading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-30">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-400 mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-slate-300">Loading secure document...</p>
                <p className="text-sm text-slate-400 mt-2">Please wait...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-30">
              <div className="text-center max-w-md px-6">
                <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-300 mb-2">Unable to display document</p>
                <p className="text-sm text-slate-400 mb-6">
                  The document couldn't be loaded in the secure viewer. You can open it in a new tab instead.
                </p>
                <Button
                  onClick={handleOpenInNewTab}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}

          {/* PDF Object - Better compatibility than iframe */}
          {!loadError && (
            <>
              <object
                ref={iframeRef as any}
                data={getPdfUrl()}
                type="application/pdf"
                className="pdf-iframe"
                title={documentName}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              >
                {/* Fallback for browsers that don't support object tag */}
                <iframe
                  src={getPdfUrl()}
                  className="pdf-iframe"
                  title={documentName}
                  onLoad={handleIframeLoad}
                  sandbox="allow-same-origin allow-scripts"
                  allow="fullscreen"
                />
              </object>

              {/* Transparent Overlay - Blocks all mouse interactions */}
              <div
                ref={overlayRef}
                className="iframe-overlay"
                onContextMenu={handleOverlayContextMenu}
                onMouseDown={handleOverlayMouseDown}
                onDragStart={handleOverlayDragStart}
              />

              {/* Watermark Overlay - On top of everything */}
              <div className="watermark-overlay">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="watermark-text"
                    style={{
                      top: `${(i * 15) % 100}%`,
                      left: `${(i * 25) % 100}%`,
                    }}
                  >
                    {watermarkText}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-slate-700 bg-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>Protected by Roomi AI Secure Viewer</span>
          </div>
          <span className="text-sm text-slate-400">Viewing as: {viewerEmail}</span>
        </div>
      </div>
    </>
  );
}
