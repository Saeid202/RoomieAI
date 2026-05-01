import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ContractorProject } from "@/types/contractor";

interface PortfolioLightboxProps {
  project: ContractorProject | null;
  onClose: () => void;
}

export function PortfolioLightbox({ project, onClose }: PortfolioLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (!project) return null;

  const images = project.images ?? [];

  function prev() {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % images.length);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
          aria-label="Close lightbox"
        >
          <X className="h-8 w-8" />
        </button>

        {/* Image */}
        {images.length > 0 ? (
          <img
            src={images[currentIndex]}
            alt={`${project.title} — image ${currentIndex + 1}`}
            className="w-full max-h-[75vh] object-contain rounded-lg"
          />
        ) : (
          <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
            No images
          </div>
        )}

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Caption */}
        <div className="mt-3 text-center text-white">
          <p className="font-bold text-lg">{project.title}</p>
          {project.description && (
            <p className="text-sm text-gray-300 mt-1">{project.description}</p>
          )}
          {images.length > 1 && (
            <p className="text-xs text-gray-400 mt-1">
              {currentIndex + 1} / {images.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
