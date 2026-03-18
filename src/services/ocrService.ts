// =====================================================
// OCR Service - Tesseract.js wrapper
// Extracts text from PDF and image documents
// =====================================================

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export interface OCRProgress {
  status: string;
  progress: number; // 0-100
}

/**
 * Extract text from an image or PDF page using Tesseract.js
 * @param file - File blob (PDF, PNG, JPG, etc.)
 * @param onProgress - Optional progress callback
 * @returns Extracted text and confidence score
 */
export async function extractTextFromDocument(
  file: File | Blob,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress({
            status: m.status,
            progress: Math.round(m.progress * 100),
          });
        }
      },
    });

    const processingTime = Date.now() - startTime;

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      processingTime,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`Failed to extract text: ${error}`);
  }
}

/**
 * Extract text from multiple pages (for multi-page PDFs)
 * @param pages - Array of file blobs (each page as a separate file)
 * @param onProgress - Optional progress callback
 * @returns Combined text from all pages
 */
export async function extractTextFromMultiplePages(
  pages: (File | Blob)[],
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const startTime = Date.now();
  let combinedText = '';
  let totalConfidence = 0;
  let pageCount = 0;

  for (const page of pages) {
    const result = await extractTextFromDocument(page, (prog) => {
      if (onProgress) {
        onProgress({
          status: `Processing page ${pageCount + 1}/${pages.length}: ${prog.status}`,
          progress: Math.round((pageCount / pages.length) * 100 + (prog.progress / pages.length)),
        });
      }
    });

    combinedText += result.text + '\n\n';
    totalConfidence += result.confidence;
    pageCount++;
  }

  const processingTime = Date.now() - startTime;
  const avgConfidence = pageCount > 0 ? totalConfidence / pageCount : 0;

  return {
    text: combinedText,
    confidence: avgConfidence,
    processingTime,
  };
}

/**
 * Check if a file is likely to contain extractable text
 * @param mimeType - The file's MIME type
 * @returns Whether OCR can be attempted
 */
export function isOcrSupported(mimeType: string): boolean {
  const supportedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'application/pdf',
  ];
  return supportedTypes.includes(mimeType);
}

/**
 * Get a human-readable file type description
 * @param mimeType - The file's MIME type
 * @returns Description string
 */
export function getFileTypeDescription(mimeType: string): string {
  const descriptions: Record<string, string> = {
    'application/pdf': 'PDF Document',
    'image/png': 'PNG Image',
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPEG Image',
    'image/gif': 'GIF Image',
    'image/bmp': 'BMP Image',
    'image/tiff': 'TIFF Image',
  };
  return descriptions[mimeType] || 'Unknown Document';
}

/**
 * Clean extracted text by removing extra whitespace and normalizing
 * @param text - Raw OCR text
 * @returns Cleaned text
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/[ \t]+/g, ' ') // Normalize spaces
    .trim(); // Remove leading/trailing whitespace;
}