import { useEffect, useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { getPerformanceTracker, getCacheStats } from '@/services/mapPerformanceService';

interface PerformanceStats {
  mapLoadTime: number;
  amenityFetchTime: number;
  boundaryFetchTime: number;
  commuteFetchTime: number;
  searchResponseTime: number;
  totalInitTime: number;
  memoryUsage: number;
  cacheStats: any;
}

interface MapPerformanceMonitorProps {
  enabled?: boolean;
  compact?: boolean;
}

/**
 * Performance monitoring component for the map
 * Displays real-time performance metrics and cache statistics
 * Only visible in development mode
 */
export const MapPerformanceMonitor = ({
  enabled = process.env.NODE_ENV === 'development',
  compact = false,
}: MapPerformanceMonitorProps) => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Update stats every 2 seconds
    const interval = setInterval(() => {
      const tracker = getPerformanceTracker();
      const metrics = tracker.getMetrics();
      const cacheStats = getCacheStats();
      const memoryUsage = tracker.getMemoryUsage();

      setStats({
        ...metrics,
        memoryUsage,
        cacheStats,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled || !stats) return null;

  if (compact) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg"
          aria-label="Toggle performance monitor"
        >
          <Activity className="h-5 w-5" />
        </button>

        {isVisible && (
          <div className="absolute bottom-12 right-0 bg-gray-900 text-white rounded-lg p-3 text-xs space-y-1 w-48 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="font-semibold">Performance</span>
            </div>
            <div className="space-y-1 text-gray-300">
              <div>Map Load: {stats.mapLoadTime.toFixed(0)}ms</div>
              <div>Amenities: {stats.amenityFetchTime.toFixed(0)}ms</div>
              <div>Boundaries: {stats.boundaryFetchTime.toFixed(0)}ms</div>
              <div>Commute: {stats.commuteFetchTime.toFixed(0)}ms</div>
              <div>Search: {stats.searchResponseTime.toFixed(0)}ms</div>
              <div>Total: {stats.totalInitTime.toFixed(0)}ms</div>
              {stats.memoryUsage > 0 && (
                <div>Memory: {stats.memoryUsage.toFixed(1)}MB</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-gray-900 text-white rounded-lg p-4 text-sm space-y-2 w-64 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-yellow-400" />
        <span className="font-semibold">Performance Monitor</span>
      </div>

      <div className="space-y-1 text-gray-300">
        <div className="flex justify-between">
          <span>Map Load:</span>
          <span className={stats.mapLoadTime > 2000 ? 'text-red-400' : 'text-green-400'}>
            {stats.mapLoadTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Amenities:</span>
          <span className={stats.amenityFetchTime > 1000 ? 'text-red-400' : 'text-green-400'}>
            {stats.amenityFetchTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Boundaries:</span>
          <span className={stats.boundaryFetchTime > 1000 ? 'text-red-400' : 'text-green-400'}>
            {stats.boundaryFetchTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Commute:</span>
          <span className={stats.commuteFetchTime > 1000 ? 'text-red-400' : 'text-green-400'}>
            {stats.commuteFetchTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span>Search:</span>
          <span className={stats.searchResponseTime > 500 ? 'text-red-400' : 'text-green-400'}>
            {stats.searchResponseTime.toFixed(0)}ms
          </span>
        </div>
        <div className="border-t border-gray-700 pt-1 mt-1">
          <div className="flex justify-between font-semibold">
            <span>Total Init:</span>
            <span className={stats.totalInitTime > 5000 ? 'text-red-400' : 'text-green-400'}>
              {stats.totalInitTime.toFixed(0)}ms
            </span>
          </div>
        </div>

        {stats.memoryUsage > 0 && (
          <div className="flex justify-between text-gray-400">
            <span>Memory:</span>
            <span className={stats.memoryUsage > 50 ? 'text-red-400' : 'text-green-400'}>
              {stats.memoryUsage.toFixed(1)}MB
            </span>
          </div>
        )}
      </div>

      {stats.cacheStats && (
        <div className="border-t border-gray-700 pt-2 mt-2 text-xs">
          <div className="font-semibold mb-1">Cache Stats</div>
          <div className="space-y-1 text-gray-400">
            {stats.cacheStats.amenities && (
              <div>Amenities: {stats.cacheStats.amenities.size}/{stats.cacheStats.amenities.maxSize}</div>
            )}
            {stats.cacheStats.boundaries && (
              <div>Boundaries: {stats.cacheStats.boundaries.size}/{stats.cacheStats.boundaries.maxSize}</div>
            )}
            {stats.cacheStats.commute && (
              <div>Commute: {stats.cacheStats.commute.size}/{stats.cacheStats.commute.maxSize}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
