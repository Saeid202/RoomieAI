import { AlertCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapError } from '@/services/mapErrorHandlingService';

interface MapErrorDisplayProps {
  error: MapError;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

/**
 * Displays map errors with appropriate severity and retry options
 */
export const MapErrorDisplay = ({
  error,
  onRetry,
  onDismiss,
  compact = false,
}: MapErrorDisplayProps) => {
  const getIcon = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'MAPBOX_INIT_FAILED':
      case 'GEOCODING_FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityClass = () => {
    switch (error.type) {
      case 'MAPBOX_INIT_FAILED':
        return 'bg-red-50 border-red-200';
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${getSeverityClass()}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 truncate">{error.userMessage}</p>
        </div>
        {error.retryable && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label="Retry"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${getSeverityClass()}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {error.type === 'NETWORK_ERROR' && 'Connection Error'}
            {error.type === 'TIMEOUT' && 'Request Timeout'}
            {error.type === 'MAPBOX_INIT_FAILED' && 'Map Failed to Load'}
            {error.type === 'GEOCODING_FAILED' && 'Location Error'}
            {!['NETWORK_ERROR', 'TIMEOUT', 'MAPBOX_INIT_FAILED', 'GEOCODING_FAILED'].includes(
              error.type
            ) && 'Map Error'}
          </h3>
          <p className="text-sm text-gray-700 mb-3">{error.userMessage}</p>
          <div className="flex gap-2">
            {error.retryable && onRetry && (
              <Button
                size="sm"
                onClick={onRetry}
                className="gap-2"
                variant="default"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                onClick={onDismiss}
                variant="outline"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
