/**
 * Map Performance Service
 * Provides caching, lazy loading, request batching, and performance monitoring
 * for the interactive property map feature.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface PerformanceMetrics {
  mapLoadTime: number;
  amenityFetchTime: number;
  boundaryFetchTime: number;
  commuteFetchTime: number;
  searchResponseTime: number;
  totalInitTime: number;
  memoryUsage?: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // milliseconds
  maxSize: number; // max entries
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 3600000, // 1 hour
  maxSize: 100,
};

/**
 * Simple in-memory cache with TTL support
 */
class MapCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  set(key: string, data: T): void {
    if (!this.config.enabled) return;

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      )[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.ttl,
    });
  }

  get(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; maxSize: number; enabled: boolean } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      enabled: this.config.enabled,
    };
  }
}

/**
 * Request deduplication to prevent duplicate API calls
 */
class RequestDeduplicator {
  private pending: Map<string, Promise<any>> = new Map();

  async deduplicate<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // If request is already pending, return existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Create new promise and store it
    const promise = operation()
      .then((result) => {
        this.pending.delete(key);
        return result;
      })
      .catch((error) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pending.clear();
  }

  size(): number {
    return this.pending.size;
  }
}

/**
 * Performance metrics tracker
 */
class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    mapLoadTime: 0,
    amenityFetchTime: 0,
    boundaryFetchTime: 0,
    commuteFetchTime: 0,
    searchResponseTime: 0,
    totalInitTime: 0,
  };

  private startTimes: Map<string, number> = new Map();

  start(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);

    // Update metrics
    switch (label) {
      case 'mapLoad':
        this.metrics.mapLoadTime = duration;
        break;
      case 'amenityFetch':
        this.metrics.amenityFetchTime = duration;
        break;
      case 'boundaryFetch':
        this.metrics.boundaryFetchTime = duration;
        break;
      case 'commuteFetch':
        this.metrics.commuteFetchTime = duration;
        break;
      case 'searchResponse':
        this.metrics.searchResponseTime = duration;
        break;
      case 'totalInit':
        this.metrics.totalInitTime = duration;
        break;
    }

    return duration;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      mapLoadTime: 0,
      amenityFetchTime: 0,
      boundaryFetchTime: 0,
      commuteFetchTime: 0,
      searchResponseTime: 0,
      totalInitTime: 0,
    };
    this.startTimes.clear();
  }

  logMetrics(): void {
    console.log('[MapPerformance]', this.metrics);

    // Check if any metric exceeds target
    const targets = {
      mapLoadTime: 2000,
      amenityFetchTime: 1000,
      boundaryFetchTime: 1000,
      commuteFetchTime: 1000,
      searchResponseTime: 500,
      totalInitTime: 5000,
    };

    Object.entries(this.metrics).forEach(([key, value]) => {
      const target = targets[key as keyof PerformanceMetrics];
      if (target && value > target) {
        console.warn(
          `[MapPerformance] ${key} exceeded target: ${value.toFixed(2)}ms > ${target}ms`
        );
      }
    });
  }

  getMemoryUsage(): number {
    // performance.memory is non-standard but available in Chrome
    const perfMemory = (performance as any).memory;
    if (perfMemory) {
      return perfMemory.usedJSHeapSize / 1048576; // Convert to MB
    }
    return 0;
  }
}

/**
 * Lazy loader for map components
 */
class LazyLoader {
  private loaded: Set<string> = new Set();
  private observers: Map<string, IntersectionObserver> = new Map();

  /**
   * Observe element and load content when visible
   */
  observeElement(
    element: HTMLElement,
    key: string,
    onVisible: () => void
  ): void {
    if (this.loaded.has(key)) {
      onVisible();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible();
            this.loaded.add(key);
            observer.disconnect();
            this.observers.delete(key);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    this.observers.set(key, observer);
  }

  /**
   * Manually mark as loaded
   */
  markLoaded(key: string): void {
    this.loaded.add(key);
  }

  /**
   * Check if already loaded
   */
  isLoaded(key: string): boolean {
    return this.loaded.has(key);
  }

  /**
   * Clean up observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Request batching for multiple API calls
 */
class RequestBatcher {
  private batch: Map<string, any> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private batchDelay: number = 50; // milliseconds

  /**
   * Add request to batch
   */
  add(key: string, data: any): void {
    this.batch.set(key, data);

    // Schedule batch execution
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flush();
      }, this.batchDelay);
    }
  }

  /**
   * Execute batched requests
   */
  flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const batch = Array.from(this.batch.entries());
    this.batch.clear();

    // Process batch
    if (batch.length > 0) {
      console.log(`[RequestBatcher] Executing batch of ${batch.length} requests`);
      // Batch processing logic would go here
    }
  }

  /**
   * Get batch size
   */
  size(): number {
    return this.batch.size;
  }

  /**
   * Clear batch
   */
  clear(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.batch.clear();
  }
}

// Singleton instances
let amenityCache: MapCache<any> | null = null;
let boundaryCache: MapCache<any> | null = null;
let commuteCache: MapCache<any> | null = null;
let deduplicator: RequestDeduplicator | null = null;
let tracker: PerformanceTracker | null = null;
let lazyLoader: LazyLoader | null = null;
let batcher: RequestBatcher | null = null;

/**
 * Initialize performance service
 */
export const initializePerformanceService = (): void => {
  amenityCache = new MapCache({ ttl: 3600000, maxSize: 100 }); // 1 hour
  boundaryCache = new MapCache({ ttl: 3600000, maxSize: 100 });
  commuteCache = new MapCache({ ttl: 1800000, maxSize: 50 }); // 30 minutes
  deduplicator = new RequestDeduplicator();
  tracker = new PerformanceTracker();
  lazyLoader = new LazyLoader();
  batcher = new RequestBatcher();
};

/**
 * Get or create amenity cache
 */
export const getAmenityCache = (): MapCache<any> => {
  if (!amenityCache) initializePerformanceService();
  return amenityCache!;
};

/**
 * Get or create boundary cache
 */
export const getBoundaryCache = (): MapCache<any> => {
  if (!boundaryCache) initializePerformanceService();
  return boundaryCache!;
};

/**
 * Get or create commute cache
 */
export const getCommuteCache = (): MapCache<any> => {
  if (!commuteCache) initializePerformanceService();
  return commuteCache!;
};

/**
 * Get or create deduplicator
 */
export const getDeduplicator = (): RequestDeduplicator => {
  if (!deduplicator) initializePerformanceService();
  return deduplicator!;
};

/**
 * Get or create performance tracker
 */
export const getPerformanceTracker = (): PerformanceTracker => {
  if (!tracker) initializePerformanceService();
  return tracker!;
};

/**
 * Get or create lazy loader
 */
export const getLazyLoader = (): LazyLoader => {
  if (!lazyLoader) initializePerformanceService();
  return lazyLoader!;
};

/**
 * Get or create request batcher
 */
export const getRequestBatcher = (): RequestBatcher => {
  if (!batcher) initializePerformanceService();
  return batcher!;
};

/**
 * Clear all caches
 */
export const clearAllCaches = (): void => {
  amenityCache?.clear();
  boundaryCache?.clear();
  commuteCache?.clear();
  deduplicator?.clear();
  batcher?.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    amenities: amenityCache?.getStats(),
    boundaries: boundaryCache?.getStats(),
    commute: commuteCache?.getStats(),
    deduplicator: deduplicator?.size(),
    batcher: batcher?.size(),
  };
};

/**
 * Fetch with caching and deduplication
 */
export const fetchWithCache = async <T>(
  key: string,
  operation: () => Promise<T>,
  cache: MapCache<T>
): Promise<T> => {
  // Check cache first
  const cached = cache.get(key);
  if (cached) {
    console.log(`[MapCache] Cache hit for ${key}`);
    return cached;
  }

  // Deduplicate requests
  const dedup = getDeduplicator();
  const result = await dedup.deduplicate(key, operation);

  // Store in cache
  cache.set(key, result);
  return result;
};

/**
 * Measure operation performance
 */
export const measurePerformance = async <T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> => {
  const perf = getPerformanceTracker();
  perf.start(label);
  try {
    const result = await operation();
    perf.end(label);
    return result;
  } catch (error) {
    perf.end(label);
    throw error;
  }
};

/**
 * Cleanup performance service
 */
export const cleanupPerformanceService = (): void => {
  lazyLoader?.cleanup();
  batcher?.clear();
  clearAllCaches();
};
