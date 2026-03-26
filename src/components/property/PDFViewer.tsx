// =====================================================
// PDF Viewer Component
// =====================================================
// Purpose: Render PDFs using PDF.js library
//          Works in all browsers including Edge
// =====================================================

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import React from "react";

// Set up PDF.js worker - use public folder path
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface PDFViewerProps {
  documentUrl: string;
  documentName: string;
  onLoadError?: () => void;
  onLoadSuccess?: () => void;
  compact?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
  zoom?: number;
}

export function PDFViewer({
  documentUrl,
  documentName,
  onLoadError,
  onLoadSuccess,
  compact = false,
  scrollRef,
  zoom: externalZoom,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [internalZoom, setInternalZoom] = useState(100);
  const zoom = externalZoom ?? internalZoom;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollRef || internalRef;
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(documentUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
        onLoadSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load PDF";
        console.error("PDF loading error:", err);
        setError(errorMessage);
        setIsLoading(false);
        onLoadError?.();
      }
    };

    loadPdf();
  }, [documentUrl, onLoadError, onLoadSuccess]);

  // Render all pages
  useEffect(() => {
    const renderPages = async () => {
      if (!pdfRef.current || !containerRef.current) return;

      try {
        containerRef.current.innerHTML = '';

        for (let pageNum = 1; pageNum <= (numPages || 0); pageNum++) {
          const page = await pdfRef.current.getPage(pageNum);
          const viewport = page.getViewport({ scale: zoom / 100 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
          canvas.style.marginBottom = '10px';
          canvas.style.borderRadius = '8px';
          canvas.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };

          await page.render(renderContext).promise;
          containerRef.current.appendChild(canvas);
        }
      } catch (err) {
        console.error("Error rendering pages:", err);
      }
    };

    if (!isLoading && pdfRef.current && numPages) {
      renderPages();
    }
  }, [currentPage, zoom, isLoading, numPages]);

  const handleZoomIn = () => setInternalZoom(z => Math.min(z + 25, 300));
  const handleZoomOut = () => setInternalZoom(z => Math.max(z - 25, 50));

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800 p-6">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error loading PDF</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-400 mx-auto mb-3"></div>
          <p className="text-slate-400 font-medium">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900 p-4 min-h-0"
      style={{ scrollBehavior: 'smooth' }}
    />
  );
}
