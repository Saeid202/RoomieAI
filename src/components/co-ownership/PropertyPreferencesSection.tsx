// Property Preferences Section Component
// Part of Co-Ownership Profile feature

import { useState } from 'react';
import { Home, Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  PROPERTY_TYPE_LABELS, 
  PURCHASE_TIMELINE_LABELS 
} from '@/types/coOwnershipProfile';
import type { 
  CoOwnershipProfileFormData, 
  PropertyType,
  PurchaseTimeline 
} from '@/types/coOwnershipProfile';

interface PropertyPreferencesSectionProps {
  formData: CoOwnershipProfileFormData;
  onChange: (field: keyof CoOwnershipProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export function PropertyPreferencesSection({
  formData,
  onChange,
  errors = {},
}: PropertyPreferencesSectionProps) {
  const [locationInput, setLocationInput] = useState('');
  const MAX_LOCATIONS = 50;

  const handlePropertyTypeToggle = (type: PropertyType) => {
    const current = formData.property_types;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange('property_types', updated);
  };

  const handleAddLocation = () => {
    const trimmed = locationInput.trim();
    if (!trimmed) return;
    
    if (formData.preferred_locations.length >= MAX_LOCATIONS) {
      return;
    }
    
    if (!formData.preferred_locations.includes(trimmed)) {
      onChange('preferred_locations', [...formData.preferred_locations, trimmed]);
    }
    
    setLocationInput('');
  };

  const handleRemoveLocation = (location: string) => {
    onChange('preferred_locations', formData.preferred_locations.filter(l => l !== location));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLocation();
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Home className="h-4 w-4 text-purple-600" />
        Property Preferences
      </h3>

      <div className="space-y-4">
        {/* Property Types */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              1
            </span>
            <Label className="text-sm font-semibold">
              Property Types (select all that apply)
            </Label>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-3 rounded-lg border-2 border-slate-300">
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`property-type-${value}`}
                  checked={formData.property_types.includes(value as PropertyType)}
                  onCheckedChange={() => handlePropertyTypeToggle(value as PropertyType)}
                />
                <label
                  htmlFor={`property-type-${value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
          {errors.property_types && (
            <p className="text-xs text-red-600">{errors.property_types}</p>
          )}
        </div>

        {/* Preferred Locations */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              2
            </span>
            <Label htmlFor="location_input" className="text-sm font-semibold">
              Preferred Locations ({formData.preferred_locations.length}/{MAX_LOCATIONS})
            </Label>
          </div>
          
          {/* Input with Add Button */}
          <div className="flex gap-2">
            <Input
              id="location_input"
              className="h-9 border-2 border-slate-300 flex-1"
              placeholder="e.g., Downtown Toronto"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={formData.preferred_locations.length >= MAX_LOCATIONS}
            />
            <Button
              type="button"
              onClick={handleAddLocation}
              disabled={!locationInput.trim() || formData.preferred_locations.length >= MAX_LOCATIONS}
              className="h-9 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Location Tags */}
          {formData.preferred_locations.length > 0 && (
            <div className="flex flex-wrap gap-2 bg-white p-3 rounded-lg border-2 border-slate-300 min-h-[60px]">
              {formData.preferred_locations.map((location, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200 pl-3 pr-1 py-1 text-sm flex items-center gap-1"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(location)}
                    className="ml-1 hover:bg-purple-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {formData.preferred_locations.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No locations added yet. Type a location and click "Add" or press Enter.
            </p>
          )}

          {formData.preferred_locations.length >= MAX_LOCATIONS && (
            <p className="text-xs text-orange-600 font-semibold">
              Maximum of {MAX_LOCATIONS} locations reached
            </p>
          )}

          {errors.preferred_locations && (
            <p className="text-xs text-red-600">{errors.preferred_locations}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Minimum Bedrooms */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                3
              </span>
              <Label htmlFor="min_bedrooms" className="text-sm font-semibold">
                Minimum Bedrooms
              </Label>
            </div>
            <Select
              value={formData.min_bedrooms?.toString() || ''}
              onValueChange={(value) => onChange('min_bedrooms', parseInt(value))}
            >
              <SelectTrigger id="min_bedrooms" className="h-9 border-2 border-slate-300">
                <SelectValue placeholder="Select minimum bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num === 0 ? 'Studio' : `${num} Bedroom${num > 1 ? 's' : ''}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.min_bedrooms && (
              <p className="text-xs text-red-600">{errors.min_bedrooms}</p>
            )}
          </div>

          {/* Purchase Timeline */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                4
              </span>
              <Label htmlFor="purchase_timeline" className="text-sm font-semibold">
                Purchase Timeline
              </Label>
            </div>
            <Select
              value={formData.purchase_timeline}
              onValueChange={(value) => onChange('purchase_timeline', value as PurchaseTimeline)}
            >
              <SelectTrigger id="purchase_timeline" className="h-9 border-2 border-slate-300">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PURCHASE_TIMELINE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.purchase_timeline && (
              <p className="text-xs text-red-600">{errors.purchase_timeline}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
