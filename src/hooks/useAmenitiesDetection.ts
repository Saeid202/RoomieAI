import { useState, useCallback } from 'react';
import { detailedAmenitiesService } from '@/services/detailedAmenitiesService';
import { PropertyIntelligence } from '@/types/detailedAmenities';

export interface AmenitiesDetectionState {
  isLoading: boolean;
  progress: number; // 0-100
  progressMessage: string;
  result: PropertyIntelligence | null;
  error: string | null;
}

/**
 * Hook for progressive amenities detection with real-time feedback
 * Shows progress as queries complete (1/3, 2/3, 3/3)
 */
export function useAmenitiesDetection() {
  const [state, setState] = useState<AmenitiesDetectionState>({
    isLoading: false,
    progress: 0,
    progressMessage: '',
    result: null,
    error: null
  });

  const detectAmenities = useCallback(
    async (
      coordinates: { lat: number; lng: number },
      address: string,
      propertyType: string = ''
    ) => {
      setState({
        isLoading: true,
        progress: 10,
        progressMessage: 'Starting amenities detection...',
        result: null,
        error: null
      });

      try {
        // Update progress - starting queries
        setState(prev => ({
          ...prev,
          progress: 20,
          progressMessage: 'Searching for nearby facilities...'
        }));

        // Execute detection
        const result = await detailedAmenitiesService.getDetailedPropertyIntelligence(
          coordinates,
          address,
          propertyType
        );

        // Update progress - queries complete
        setState(prev => ({
          ...prev,
          progress: 90,
          progressMessage: 'Processing results...'
        }));

        // Final update
        setState({
          isLoading: false,
          progress: 100,
          progressMessage: 'Detection complete!',
          result,
          error: null
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isLoading: false,
          progress: 0,
          progressMessage: '',
          result: null,
          error: errorMessage
        });
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      progressMessage: '',
      result: null,
      error: null
    });
  }, []);

  return {
    ...state,
    detectAmenities,
    reset
  };
}
