import { useState, useEffect, useCallback } from 'react';
import { ConstructionColorPattern, ConstructionCustomizationOption } from '@/types/construction';
import { ColorPatternService } from '@/services/storage/colorPatternService';

export interface UseColorPatternsOptions {
  customizationOptionId?: string;
  initialPatterns?: ConstructionColorPattern[];
  autoFetch?: boolean;
}

export const useColorPatterns = (options: UseColorPatternsOptions = {}) => {
  const [patterns, setPatterns] = useState<ConstructionColorPattern[]>(
    options.initialPatterns || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch patterns for a customization option
  const fetchPatterns = useCallback(async (customizationOptionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedPatterns = await ColorPatternService.getColorPatterns(customizationOptionId);
      setPatterns(fetchedPatterns);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patterns';
      setError(errorMessage);
      console.error('Error fetching color patterns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new pattern
  const createPattern = useCallback(async (data: {
    customization_option_id: string;
    color_name?: string;
    pattern_image?: File;
    is_pattern_based: boolean;
    sort_order?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const newPattern = await ColorPatternService.createColorPattern(data);
      setPatterns(prev => [...prev, newPattern]);
      return newPattern;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pattern';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing pattern
  const updatePattern = useCallback(async (
    id: string, 
    data: Partial<{
      color_name?: string;
      pattern_image?: File;
      is_pattern_based: boolean;
      sort_order?: number;
    }>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedPattern = await ColorPatternService.updateColorPattern(id, data);
      setPatterns(prev => prev.map(p => p.id === id ? updatedPattern : p));
      return updatedPattern;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pattern';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a pattern
  const deletePattern = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await ColorPatternService.deleteColorPattern(id);
      setPatterns(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pattern';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reorder patterns
  const reorderPatterns = useCallback(async (patternIds: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      await ColorPatternService.updateSortOrder(patternIds);
      
      // Update local state to reflect new order
      setPatterns(prev => {
        const orderedPatterns: ConstructionColorPattern[] = [];
        patternIds.forEach(id => {
          const pattern = prev.find(p => p.id === id);
          if (pattern) {
            orderedPatterns.push(pattern);
          }
        });
        return orderedPatterns;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder patterns';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all patterns
  const clearPatterns = useCallback(() => {
    setPatterns([]);
    setError(null);
  }, []);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch if customizationOptionId is provided and autoFetch is true
  useEffect(() => {
    if (options.customizationOptionId && options.autoFetch !== false) {
      fetchPatterns(options.customizationOptionId);
    }
  }, [options.customizationOptionId, options.autoFetch, fetchPatterns]);

  return {
    patterns,
    isLoading,
    error,
    fetchPatterns,
    createPattern,
    updatePattern,
    deletePattern,
    reorderPatterns,
    clearPatterns,
    clearError
  };
};

// Hook for managing color patterns across multiple customization options
export const useMultiColorPatterns = (customizationOptions: ConstructionCustomizationOption[]) => {
  const [patternsByOption, setPatternsByOption] = useState<Record<string, ConstructionColorPattern[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Fetch patterns for all customization options
  const fetchAllPatterns = useCallback(async () => {
    setIsLoading(true);
    const newPatternsByOption: Record<string, ConstructionColorPattern[]> = {};
    const newErrors: Record<string, string | null> = {};

    for (const option of customizationOptions) {
      if (!option.supports_pattern_images) continue;

      try {
        const patterns = await ColorPatternService.getColorPatterns(option.id);
        newPatternsByOption[option.id] = patterns;
        newErrors[option.id] = null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patterns';
        newErrors[option.id] = errorMessage;
        newPatternsByOption[option.id] = [];
      }
    }

    setPatternsByOption(newPatternsByOption);
    setErrors(newErrors);
    setIsLoading(false);
  }, [customizationOptions]);

  // Get patterns for a specific option
  const getPatterns = useCallback((optionId: string) => {
    return patternsByOption[optionId] || [];
  }, [patternsByOption]);

  // Get error for a specific option
  const getError = useCallback((optionId: string) => {
    return errors[optionId];
  }, [errors]);

  // Update patterns for a specific option
  const updatePatternsForOption = useCallback((optionId: string, patterns: ConstructionColorPattern[]) => {
    setPatternsByOption(prev => ({
      ...prev,
      [optionId]: patterns
    }));
  }, []);

  // Auto-fetch on mount and when options change
  useEffect(() => {
    if (customizationOptions.length > 0) {
      fetchAllPatterns();
    }
  }, [fetchAllPatterns, customizationOptions]);

  return {
    patternsByOption,
    isLoading,
    errors,
    fetchAllPatterns,
    getPatterns,
    getError,
    updatePatternsForOption
  };
};
