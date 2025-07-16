import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Circle, Star } from 'lucide-react';
import { 
  UserPreferences, 
  PreferenceImportance, 
  PREFERENCE_OPTIONS, 
  DEFAULT_PREFERENCES, 
  updatePreferenceWeight 
} from '@/types/preferences';

interface PreferenceImportanceSelectorProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onSave?: () => void;
  className?: string;
}

const IMPORTANCE_CONFIG = {
  required: {
    label: 'Must Have',
    description: 'This is absolutely required - no exceptions',
    icon: AlertCircle,
    color: 'bg-red-500 text-white',
    badge: 'destructive'
  },
  important: {
    label: 'Important',
    description: 'This matters a lot in finding a good match',
    icon: Star,
    color: 'bg-orange-500 text-white',
    badge: 'warning'
  },
  notImportant: {
    label: 'Not Important',
    description: 'This can be flexible or doesn\'t matter much',
    icon: Circle,
    color: 'bg-gray-500 text-white',
    badge: 'secondary'
  }
} as const;

export function PreferenceImportanceSelector({ 
  preferences, 
  onPreferencesChange, 
  onSave,
  className = '' 
}: PreferenceImportanceSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('demographics');

  const handlePreferenceChange = (
    key: keyof UserPreferences, 
    importance: PreferenceImportance
  ) => {
    const updatedPreferences = updatePreferenceWeight(preferences, key, importance);
    onPreferencesChange(updatedPreferences);
  };

  const resetToDefaults = () => {
    onPreferencesChange(DEFAULT_PREFERENCES);
  };

  const getPreferencesByCategory = (category: string) => {
    return PREFERENCE_OPTIONS.filter(option => option.category === category);
  };

  const categories = [
    { id: 'demographics', label: 'Demographics', icon: '👤' },
    { id: 'housing', label: 'Housing', icon: '🏠' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
    { id: 'social', label: 'Social', icon: '👥' }
  ];

  const PreferenceItem = ({ option }: { option: typeof PREFERENCE_OPTIONS[0] }) => {
    const currentPreference = preferences[option.key];
    const config = IMPORTANCE_CONFIG[currentPreference.importance];
    const Icon = config.icon;

    return (
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{option.label}</CardTitle>
              <Badge variant={config.badge as any} className="text-xs">
                {config.label}
              </Badge>
            </div>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription className="text-xs">
            {option.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RadioGroup
            value={currentPreference.importance}
            onValueChange={(value) => 
              handlePreferenceChange(option.key, value as PreferenceImportance)
            }
            className="flex flex-col gap-2"
          >
            {(Object.keys(IMPORTANCE_CONFIG) as PreferenceImportance[]).map((importance) => {
              const importanceConfig = IMPORTANCE_CONFIG[importance];
              const ImportanceIcon = importanceConfig.icon;
              
              return (
                <div key={importance} className="flex items-center space-x-2">
                  <RadioGroupItem value={importance} id={`${option.key}-${importance}`} />
                  <Label 
                    htmlFor={`${option.key}-${importance}`}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <ImportanceIcon className="h-3 w-3" />
                    <span>{importanceConfig.label}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Matching Preferences</h2>
          <p className="text-muted-foreground">
            Customize how important each factor is when finding your ideal roommate
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          {onSave && (
            <Button onClick={onSave}>
              Save Preferences
            </Button>
          )}
        </div>
      </div>

      {/* Importance Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Importance Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(IMPORTANCE_CONFIG) as PreferenceImportance[]).map((importance) => {
              const config = IMPORTANCE_CONFIG[importance];
              const Icon = config.icon;
              
              return (
                <div key={importance} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{config.label}</h4>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPreferencesByCategory(category.id).map((option) => (
                <PreferenceItem key={option.key} option={option} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preference Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {(Object.keys(IMPORTANCE_CONFIG) as PreferenceImportance[]).map((importance) => {
              const count = Object.values(preferences).filter(
                pref => pref.importance === importance
              ).length;
              const config = IMPORTANCE_CONFIG[importance];
              
              return (
                <div key={importance} className="flex flex-col items-center gap-2">
                  <div className={`p-3 rounded-full ${config.color}`}>
                    <config.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{config.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 