import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, MapPin, X as IconX } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressSuggestion } from "@/types/address";
import { locationService } from "@/services/locationService";

interface AddressAutocompleteProps {
  onAddressSelect: (suggestion: AddressSuggestion) => void;
  onInputChange?: (query: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string; // NEW: Allow external value control
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  onInputChange,
  placeholder = "Enter property address",
  label = "Property Address",
  required = false,
  disabled = false,
  value = "" // NEW: Default to empty string
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selected, setSelected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLULElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // NEW: Update internal state when external value changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
      if (value) {
        setSelected(true); // Mark as selected if value is provided
      }
    }
  }, [value]);

  // Clear search if query is too short or address is already selected
  useEffect(() => {
    if (query.length < 2) { // Reduced from 3 to 2 characters for faster response
      if (suggestions.length > 0) {
        setSuggestions([]);
      }
      return;
    }

    if (selected) return; // Don't search if address already picked

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (isLoading) return;

      setIsLoading(true);

      try {
        // Add validation for query before searching
        if (!query || query.length < 1) {
          setSuggestions([]);
          return;
        }

        const results = await locationService.searchAddress(query);

        // Validate results before setting
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
    }, 150); // Reduced from 300ms to 150ms for faster response

    // Debounce reset
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selected, isLoading]);

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setSuggestions([]);
      }
    }

    // Attach listeners to enable dropping outside
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newQuery = e.target?.value || '';
      setQuery(newQuery);
      setSelected(false); // Allow new selections

      // Safely call onInputChange
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

  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    console.log("Selection triggered for:", suggestion.text); // Debug log

    // Immediately close the dropdown for responsiveness
    setIsOpen(false);
    setSuggestions([]); // Clear suggestions

    try {
      // Validate suggestion before processing
      if (!suggestion || (!suggestion.text && !suggestion.place_name)) {
        console.error("Invalid suggestion object:", suggestion);
        return;
      }

      // Update query state and internal state safely
      const suggestionText = suggestion.text || suggestion.place_name || '';
      setQuery(suggestionText);
      setSelected(true);

      // Call external handlers with better error handling
      try {
        onInputChange?.(suggestionText);
      } catch (inputError) {
        console.error("Input change error:", inputError);
      }

      try {
        await onAddressSelect(suggestion);
      } catch (addressError) {
        console.error("Address select error:", addressError);
        // Don't rethrow - let component continue working
      }

    } catch (error) {
      console.error("Critical error in address selection:", error);
      // Reset states to ensure component remains usable
      setIsOpen(false);
      setSuggestions([]);
      setSelected(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 w-full">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative w-full">
        <div className="relative">
          <div className="absolute left-3 top-2.5 pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            ref={inputRef}
            className={cn(
              "pl-9 text-sm",
              "pr-10",
              "placeholder:text-muted-foreground",
              "h-9 border-gray-300 shadow-sm focus:border-blue-500"
            )}
            placeholder={placeholder}
            value={query}
            disabled={disabled}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
            required={required}
          />
          {selected && query && (
            <button
              type="button"
              className="absolute right-8 top-2.5"
              onClick={clearInput}
              aria-label="Clear"
            >
              <IconX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {!isLoading && suggestions.length > 0 && isOpen && (
            <button
              type="button"
              className="absolute right-2 top-2.5"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ArrowDown className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {isOpen && suggestions.length > 0 && (
          <div ref={listRef} className="absolute z-[9999] w-full mt-2 max-h-80 overflow-y-auto">
            <ul className="bg-white border border-gray-200 rounded-lg shadow-xl">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <div
                    className={cn(
                      "flex items-start px-4 py-4 cursor-pointer transition-colors", // Increased padding from py-3 to py-4
                      "hover:bg-blue-50 hover:border-blue-200 active:bg-blue-100",
                      "border border-transparent rounded-md select-none"
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
                    <div className="flex items-start w-full">
                      <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" /> {/* Increased icon size from h-4 w-4 to h-5 w-5 */}
                      <div className="w-full">
                        <p className="text-base font-bold text-gray-900">{suggestion.text}</p> {/* Increased from text-sm to text-base and font-medium to font-bold */}
                        {suggestion.place_name !== suggestion.text && suggestion.place_name.length > suggestion.text.length && (
                          <p className="text-sm text-gray-600 mt-1 truncate font-medium"> {/* Increased from text-xs to text-sm and added font-medium */}
                            {suggestion.place_name.replace(suggestion.text, '').replace(/^[,\s]+|[,\s]+$/g, '').slice(0, 70)}
                            {suggestion.place_name.length > 70 && '...'}
                          </p>
                        )}
                        <div className="flex items-center text-sm text-blue-600 mt-1 font-medium"> {/* Increased from text-xs to text-sm and added font-medium */}
                          <span className="inline-flex items-center"><span className="mr-1">📍</span>Canadian Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressAutocomplete;
