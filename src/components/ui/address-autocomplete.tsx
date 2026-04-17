import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, MapPin, X as IconX, Search, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressSuggestion, AddressSearchMode } from "@/types/address";
import { locationService } from "@/services/locationService";
import { postalCodeService } from "@/services/postalCodeService";

interface AddressAutocompleteProps {
  onAddressSelect: (suggestion: AddressSuggestion) => void;
  onInputChange?: (query: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  onInputChange,
  placeholder = "Enter property address",
  label = "Property Address",
  required = false,
  disabled = false,
  value = ""
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selected, setSelected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<AddressSearchMode>(AddressSearchMode.ADDRESS);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value !== query) {
      setQuery(value);
      if (value) {
        setSelected(true);
      }
    }
  }, [value]);

  // Auto-detect search mode based on input format
  useEffect(() => {
    if (query.length >= 3) {
      const postalCodePattern = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
      if (postalCodePattern.test(query.trim())) {
        setSearchMode(AddressSearchMode.POSTAL_CODE);
      } else {
        setSearchMode(AddressSearchMode.ADDRESS);
      }
    }
  }, [query]);

  useEffect(() => {
    if (query.length < 2) {
      if (suggestions.length > 0) {
        setSuggestions([]);
      }
      return;
    }

    if (selected) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (isLoading) return;

      console.log('AddressAutocomplete: Searching for:', query);
      setIsLoading(true);

      try {
        if (!query || query.length < 1) {
          setSuggestions([]);
          return;
        }

        let results: AddressSuggestion[] = [];

        if (searchMode === AddressSearchMode.POSTAL_CODE) {
          console.log('AddressAutocomplete: Using postal code search');
          results = await postalCodeService.searchByPostalCode(query);
        } else {
          console.log('AddressAutocomplete: Using address search');
          results = await locationService.searchAddress(query);
        }

        console.log('AddressAutocomplete: Search results:', results);

        if (Array.isArray(results)) {
          const validResults = results.filter(result =>
            result && (result.text || result.place_name) && result.id
          );
          setSuggestions(validResults);
          setIsOpen(validResults.length > 0);
        } else {
          console.warn("Invalid search results returned:", results);
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Address search failed:", error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selected, isLoading, searchMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setSuggestions([]);
      }
    }

    if (isOpen && document) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (document) document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const clearInput = () => {
    setQuery("");
    setSelected(false);
    setSuggestions([]);
    setIsOpen(false);
    onInputChange?.("");
    inputRef.current?.focus();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearInput();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newQuery = e.target?.value || '';
      console.log('AddressAutocomplete: Input changed to:', newQuery);
      setQuery(newQuery);
      setSelected(false);

      if (onInputChange && typeof onInputChange === 'function') {
        try {
          onInputChange(newQuery);
        } catch (inputError) {
          console.error("Error in onInputChange:", inputError);
        }
      }
    } catch (error) {
      console.error("Error in input change:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape key to clear
    if (e.key === 'Escape' && query) {
      e.preventDefault();
      clearInput();
    }
    // Enter key to close dropdown
    if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    console.log("Selection triggered for:", suggestion.text);

    setIsOpen(false);
    setSuggestions([]);

    try {
      if (!suggestion || (!suggestion.text && !suggestion.place_name)) {
        console.error("Invalid suggestion object:", suggestion);
        return;
      }

      const suggestionText = suggestion.text || suggestion.place_name || '';
      setQuery(suggestionText);
      setSelected(true);

      try {
        onInputChange?.(suggestionText);
      } catch (inputError) {
        console.error("Input change error:", inputError);
      }

      try {
        await onAddressSelect(suggestion);
      } catch (addressError) {
        console.error("Address select error:", addressError);
      }

    } catch (error) {
      console.error("Critical error in address selection:", error);
      setIsOpen(false);
      setSuggestions([]);
      setSelected(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-2 text-xs">
          <span className={cn(
            "px-2.5 py-1 rounded-full font-medium transition-colors",
            searchMode === AddressSearchMode.POSTAL_CODE
              ? "bg-purple-100 text-purple-700 border border-purple-200"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          )}>
            {searchMode === AddressSearchMode.POSTAL_CODE ? "📮 Postal Code" : "🏠 Address"}
          </span>
        </div>
      </div>
      <div className="relative w-full">
        <div className="relative group">
          <div className="absolute left-3 top-3 pointer-events-none transition-colors group-focus-within:text-blue-500">
            {searchMode === AddressSearchMode.POSTAL_CODE ? (
              <Search className="h-4 w-4 text-purple-500" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <Input
            ref={inputRef}
            className={cn(
              "pl-9 text-sm",
              "pr-20",
              "placeholder:text-muted-foreground",
              "h-10 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              "transition-all duration-200",
              searchMode === AddressSearchMode.POSTAL_CODE && "border-purple-300 focus:border-purple-500 focus:ring-purple-200"
            )}
            placeholder={searchMode === AddressSearchMode.POSTAL_CODE ? "e.g., M5V 3A8" : placeholder}
            value={query}
            disabled={disabled}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={() => setIsOpen(true)}
            required={required}
            autoComplete="off"
          />
          
          {/* Delete Button - More Prominent */}
          {query && (
            <button
              type="button"
              className={cn(
                "absolute right-10 top-2.5 p-1.5 rounded-md transition-all duration-200",
                "hover:bg-red-100 hover:text-red-600 text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-red-300",
                "active:scale-95"
              )}
              onClick={handleDeleteClick}
              aria-label="Clear address"
              title="Clear address (Esc)"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          {/* Dropdown Toggle */}
          {!isLoading && suggestions.length > 0 && isOpen && (
            <button
              type="button"
              className="absolute right-2 top-2.5 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle dropdown"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin">
                <div className="h-4 w-4 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Results Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div ref={listRef} className="absolute z-[9999] w-full mt-2 max-h-96 overflow-y-auto rounded-lg shadow-lg border border-gray-200 bg-white">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600">
                {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <ul className="divide-y divide-gray-100">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <div
                    className={cn(
                      "flex items-start px-4 py-3 cursor-pointer transition-all duration-150",
                      "hover:bg-blue-50 active:bg-blue-100",
                      "border-l-4 border-transparent hover:border-blue-500"
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectSuggestion(suggestion);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectSuggestion(suggestion);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectSuggestion(suggestion);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select address: ${suggestion.text}`}
                  >
                    <div className="flex items-start w-full gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {searchMode === AddressSearchMode.POSTAL_CODE ? (
                          <Search className="h-5 w-5 text-purple-500" />
                        ) : (
                          <MapPin className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="w-full min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{suggestion.text}</p>
                        {suggestion.place_name !== suggestion.text && suggestion.place_name.length > suggestion.text.length && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {suggestion.place_name.replace(suggestion.text, '').replace(/^[,\s]+|[,\s]+$/g, '').slice(0, 70)}
                            {suggestion.place_name.length > 70 && '...'}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          {searchMode === AddressSearchMode.POSTAL_CODE ? "Postal Code Verified" : "Canadian Verified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No Results Message */}
        {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-[9999] w-full mt-2 rounded-lg shadow-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">No results found</p>
                <p className="text-xs text-gray-600 mt-1">
                  {searchMode === AddressSearchMode.POSTAL_CODE
                    ? "Try a different postal code format (e.g., M5V 3A8)"
                    : "Try a different address or postal code"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Tips */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-2.5 rounded-md border border-blue-100">
        <div className="mt-0.5 flex-shrink-0">
          <span className="text-lg">💡</span>
        </div>
        <div>
          {searchMode === AddressSearchMode.POSTAL_CODE
            ? "Enter postal code in format A1A 1A1 (e.g., M5V 3A8, L1W 0C4)"
            : "Type street address or postal code (A1A 1A1). Press Esc to clear."}
        </div>
      </div>
    </div>
  );
};

export default AddressAutocomplete;
