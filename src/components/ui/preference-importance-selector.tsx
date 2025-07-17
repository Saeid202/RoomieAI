import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Star, Circle } from 'lucide-react';

export type PreferenceImportance = 'notImportant' | 'important' | 'must';

interface PreferenceImportanceSelectorProps {
  value: PreferenceImportance;
  onValueChange: (value: PreferenceImportance) => void;
  className?: string;
}

const IMPORTANCE_CONFIG = {
  must: {
    label: 'Must Have',
    description: 'Required - absolute deal-breaker',
    icon: AlertCircle,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    badgeVariant: 'destructive' as const
  },
  important: {
    label: 'Important',
    description: 'Significant preference',
    icon: Star,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    badgeVariant: 'default' as const
  },
  notImportant: {
    label: 'Not Important',
    description: 'Flexible or optional',
    icon: Circle,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    badgeVariant: 'secondary' as const
  }
};

export function PreferenceImportanceSelector({ 
  value, 
  onValueChange, 
  className = '' 
}: PreferenceImportanceSelectorProps) {
  const currentConfig = IMPORTANCE_CONFIG[value];
  const Icon = currentConfig.icon;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-36 ${className}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${currentConfig.color} rounded-full`} />
            <span className="text-sm">{currentConfig.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(IMPORTANCE_CONFIG) as PreferenceImportance[]).map((importance) => {
          const config = IMPORTANCE_CONFIG[importance];
          const ConfigIcon = config.icon;
          
          return (
            <SelectItem key={importance} value={importance}>
              <div className="flex items-center gap-3 py-1">
                <div className={`w-3 h-3 ${config.color} rounded-full`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{config.label}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
} 