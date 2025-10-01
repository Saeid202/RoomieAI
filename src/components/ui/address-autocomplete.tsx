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
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  onAddressSelect,
  onInputChange,
  placeholder = "Enter property address",
  label = "Property Address",
  required = false,
  disabled = false
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selected, setSelected] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Clear search if query is too short or address is already selected
  useEffect(() => {
    if (query.length < 3) {
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
    }, 300); // Wait 300ms before searching

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
          <div className="absolute left-3 top-3 pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            className={cn(
              "pl-10",
              "pr-14", // Space for clear button
              "placeholder:text-gray-400"
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
              className="absolute right-10 top-3"
              onClick={clearInput}
              aria-label="Clear"
            >
              <IconX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {!isLoading && suggestions.length > 0 && isOpen && (
            <button
              type="button" 
              className="absolute right-3 top-3"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ArrowDown className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {isOpen && suggestions.length > 0 && (
          <div ref={listRef} className="absolute z-[9999] w-full mt-2 max-h-60 overflow-y-auto">
            <ul className="bg-white border border-gray-200 rounded-lg shadow-xl">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <div
                    className={cn(
                      "flex items-start px-4 py-3 cursor-pointer transition-colors",
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
                      <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="w-full">
                        <p className="text-sm font-medium text-gray-900">{suggestion.text}</p>
                        {suggestion.place_name !== suggestion.text && suggestion.place_name.length > suggestion.text.length && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {suggestion.place_name.replace(suggestion.text, '').replace(/^[,\s]+|[,\s]+$/g, '').slice(0, 70)}
                            {suggestion.place_name.length > 70 && '...'}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-blue-600 mt-1">
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
