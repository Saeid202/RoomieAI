// =====================================================
// Secure Document Viewer Component
// =====================================================
// Purpose: Protected document viewer with watermarking
//          and anti-download/print features using iframe
//          with overlay protection
// =====================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Shield, AlertTriangle, Clock, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmbeddedDocumentViewer } from "./EmbeddedDocumentViewer";

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
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [zoom, setZoom] = useState(100);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);
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

  // Lock body scroll when viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  // Forward wheel events from overlay to the PDF scroll container
  const handleOverlayWheel = (e: React.WheelEvent) => {
    if (pdfScrollRef.current) {
      pdfScrollRef.current.scrollTop += e.deltaY;
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
        className="fixed inset-0 z-50 bg-slate-900 secure-viewer-container overflow-hidden flex flex-col"
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Header - Purple bar with zoom controls */}
        <div className="h-16 border-b border-slate-700 bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Secure Document Viewer</h2>
              <p className="text-sm text-indigo-200">{documentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(z => Math.max(z - 25, 50))}
              disabled={zoom <= 50}
              className="text-white hover:bg-white/10 h-8 w-8 p-0"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-indigo-200 min-w-10 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(z => Math.min(z + 25, 300))}
              disabled={zoom >= 300}
              className="text-white hover:bg-white/10 h-8 w-8 p-0"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
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

        {/* Document Viewer Container */}
        <div className="relative flex-1 min-h-0 w-full flex flex-col">
          {/* Embedded Document Viewer */}
          <EmbeddedDocumentViewer
            documentUrl={documentUrl}
            documentName={documentName}
            onClose={onClose}
            scrollRef={pdfScrollRef}
            zoom={zoom}
          />

          {/* Transparent Overlay - Blocks right-click/drag but forwards scroll */}
          <div
            ref={overlayRef}
            className="iframe-overlay"
            onContextMenu={handleOverlayContextMenu}
            onMouseDown={handleOverlayMouseDown}
            onDragStart={handleOverlayDragStart}
            onWheel={handleOverlayWheel}
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
        </div>
      </div>
    </>
  );
}
