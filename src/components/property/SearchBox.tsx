import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';

interface SearchResult {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
}

interface SearchBoxProps {
  map: mapboxgl.Map | null;
  isOpen: boolean;
  onClose: () => void;
  propertyLng: number;
  propertyLat: number;
}

export const SearchBox = ({ map, isOpen, onClose, propertyLng, propertyLat }: SearchBoxProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const searchMarkers = useRef<mapboxgl.Marker[]>([]);

  const token = import.meta.env.REACT_APP_MAPBOX_TOKEN;

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !token) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const encodedQuery = encodeURIComponent(searchQuery);
      const proximityParam = `&proximity=${propertyLng},${propertyLat}`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&limit=5&country=ca${proximityParam}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features) {
        const formattedResults: SearchResult[] = data.features.map((feature: any) => ({
          id: feature.id,
          text: feature.text,
          place_name: feature.place_name,
          center: feature.center,
        }));
        setResults(formattedResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleResultClick = (result: SearchResult) => {
    if (map) {
      map.flyTo({
        center: result.center,
        zoom: 16,
        duration: 1000,
      });

      // Add marker for search result
      const el = document.createElement('div');
      el.className = 'search-result-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #FBBF24;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 2px solid white;
        ">
          📍
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(result.center)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2"><h4 class="font-semibold text-sm">${result.place_name}</h4></div>`
          )
        )
        .addTo(map);

      searchMarkers.current.push(marker);
    }

    setQuery('');
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    searchMarkers.current.forEach((marker) => marker.remove());
    searchMarkers.current = [];
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search nearby locations..."
              value={query}
              onChange={handleInputChange}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Loading State */}
        {loading && <p className="text-sm text-gray-500">Searching...</p>}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">{result.text}</p>
                <p className="text-xs text-gray-600">{result.place_name}</p>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {query && !loading && results.length === 0 && !error && (
          <p className="text-sm text-gray-500">No results found</p>
        )}

        {/* Clear Button */}
        {query && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="w-full"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
