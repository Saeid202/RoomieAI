import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AmenitiesLoadingProps {
  isLoading: boolean;
  progress: number; // 0-100
  progressMessage: string;
  error?: string | null;
  onCancel?: () => void;
}

/**
 * Progressive loading indicator for amenities detection
 * Shows real-time feedback as queries complete
 */
export function AmenitiesLoading({
  isLoading,
  progress,
  progressMessage,
  error,
  onCancel
}: AmenitiesLoadingProps) {
  if (!isLoading && !error && progress === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : progress === 100 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          <span className="font-medium text-sm">
            {error ? 'Detection Failed' : progress === 100 ? 'Detection Complete' : 'Detecting Amenities'}
          </span>
        </div>
        {isLoading && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-gray-600 hover:text-gray-900 underline"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Message */}
      {progressMessage && (
        <p className="text-sm text-gray-700">{progressMessage}</p>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            error ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">{progress}% complete</span>
        {isLoading && (
          <span className="text-xs text-gray-600 animate-pulse">
            Querying OpenStreetMap...
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <p className="font-medium">Detection Error</p>
          <p className="text-xs mt-1">{error}</p>
          <p className="text-xs mt-2 text-red-600">
            This may be due to network issues or API rate limiting. Please try again in a moment.
          </p>
        </div>
      )}

      {/* Success Message */}
      {progress === 100 && !error && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          <p className="font-medium">✓ Amenities detected successfully</p>
          <p className="text-xs mt-1">Nearby facilities have been identified and added to your listing.</p>
        </div>
      )}
    </div>
  );
}
