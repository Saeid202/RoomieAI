// =====================================================
// Property Category Selector Component
// =====================================================
// Purpose: Two-step cascading dropdown for property
//          category and configuration selection
// =====================================================

import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Building2 } from "lucide-react";
import {
  PropertyCategory,
  PropertyConfiguration,
  PROPERTY_HIERARCHY,
  getConfigurationsForCategory,
} from "@/types/propertyCategories";

interface PropertyCategorySelectorProps {
  category: PropertyCategory | null | undefined;
  configuration: PropertyConfiguration | null | undefined;
  onCategoryChange: (category: PropertyCategory | null) => void;
  onConfigurationChange: (configuration: PropertyConfiguration | null) => void;
  disabled?: boolean;
  error?: string;
}

export function PropertyCategorySelector({
  category,
  configuration,
  onCategoryChange,
  onConfigurationChange,
  disabled = false,
  error,
}: PropertyCategorySelectorProps) {
  // Get available configurations based on selected category
  const availableConfigurations = category ? getConfigurationsForCategory(category) : [];

  // Handle category change - reset configuration when category changes
  const handleCategoryChange = (value: string) => {
    if (value === "none") {
      onCategoryChange(null);
      onConfigurationChange(null);
    } else {
      onCategoryChange(value as PropertyCategory);
      onConfigurationChange(null); // Reset configuration
    }
  };

  // Handle configuration change
  const handleConfigurationChange = (value: string) => {
    if (value === "none") {
      onConfigurationChange(null);
    } else {
      onConfigurationChange(value as PropertyConfiguration);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Primary Category */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
            1
          </span>
          <Label htmlFor="property-category" className="text-base font-bold text-gray-800">
            Primary Category
          </Label>
        </div>
        <div className="relative">
          <Building2 className="absolute left-4 top-4 h-5 w-5 text-slate-400 z-10" />
          <Select
            value={category || "none"}
            onValueChange={handleCategoryChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="property-category"
              className="h-14 text-base font-medium pl-12 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg shadow-sm"
            >
              <SelectValue placeholder="Select primary category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-slate-400">Select category...</span>
              </SelectItem>
              <SelectItem value="Condo">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">Condo</span>
                </div>
              </SelectItem>
              <SelectItem value="House">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">House</span>
                </div>
              </SelectItem>
              <SelectItem value="Townhouse">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">Townhouse</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Step 2: Unit Configuration (Dynamic based on category) */}
      {category && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              2
            </span>
            <Label htmlFor="property-configuration" className="text-base font-bold text-gray-800">
              Unit Configuration
            </Label>
          </div>
          <div className="relative">
            <Home className="absolute left-4 top-4 h-5 w-5 text-slate-400 z-10" />
            <Select
              value={configuration || "none"}
              onValueChange={handleConfigurationChange}
              disabled={disabled || !category}
            >
              <SelectTrigger
                id="property-configuration"
                className="h-14 text-base font-medium pl-12 border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 rounded-lg shadow-sm"
              >
                <SelectValue placeholder={`Select ${category.toLowerCase()} type`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-slate-400">Select configuration...</span>
                </SelectItem>
                {availableConfigurations.map((config) => (
                  <SelectItem key={config} value={config}>
                    <span className="font-medium">{config}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!category && (
        <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="font-medium mb-1">💡 How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>First, select the primary category (Condo, House, or Townhouse)</li>
            <li>Then, choose the specific unit configuration</li>
          </ol>
        </div>
      )}

      {category && !configuration && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="font-medium">👉 Now select the unit configuration for your {category.toLowerCase()}</p>
        </div>
      )}

      {/* Selection Summary */}
      {category && configuration && (
        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
          <span className="text-lg">✓</span>
          <div>
            <p className="font-bold">Property Type Selected:</p>
            <p className="text-xs">{category} → {configuration}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
