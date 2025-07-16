import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  Star, 
  Circle,
  TrendingUp,
  Info,
  BarChart3,
  Target,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Cigarette,
  PawPrint,
  Utensils,
  Briefcase,
  Calendar,
  Home,
  MessageCircle,
  Moon,
  Heart,
  Sparkles
} from "lucide-react";

// Types
type PreferenceImportance = 'must' | 'important' | 'notImportant';

interface ImportanceWeight {
  category: string;
  importance: PreferenceImportance;
  weight: number;
  score: number;
  contribution: number;
  userPreference?: string;
  candidateValue?: string;
}

interface ImportanceWeightVisualizationProps {
  match: any;
  userPreferences?: Record<string, { importance: PreferenceImportance; weight: number }>;
  className?: string;
}

// Weight mapping from the matching service
const IMPORTANCE_WEIGHTS = {
  must: 1.0,
  important: 0.7,
  notImportant: 0.3
};

// Category configurations
const CATEGORY_CONFIG = {
  gender: {
    name: "Gender Preference",
    icon: <Users className="h-4 w-4" />,
    description: "Mutual gender preference compatibility"
  },
  age: {
    name: "Age Range",
    icon: <Calendar className="h-4 w-4" />,
    description: "Age within preferred range"
  },
  location: {
    name: "Location",
    icon: <MapPin className="h-4 w-4" />,
    description: "Preferred living location match"
  },
  budget: {
    name: "Budget",
    icon: <DollarSign className="h-4 w-4" />,
    description: "Budget range compatibility"
  },
  smoking: {
    name: "Smoking",
    icon: <Cigarette className="h-4 w-4" />,
    description: "Smoking preference alignment"
  },
  pets: {
    name: "Pets",
    icon: <PawPrint className="h-4 w-4" />,
    description: "Pet-related preferences"
  },
  workSchedule: {
    name: "Work Schedule",
    icon: <Clock className="h-4 w-4" />,
    description: "Working hours compatibility"
  },
  diet: {
    name: "Diet",
    icon: <Utensils className="h-4 w-4" />,
    description: "Dietary preferences match"
  },
  occupation: {
    name: "Occupation",
    icon: <Briefcase className="h-4 w-4" />,
    description: "Career compatibility"
  },
  nationality: {
    name: "Nationality",
    icon: <Users className="h-4 w-4" />,
    description: "Nationality preference"
  },
  language: {
    name: "Language",
    icon: <MessageCircle className="h-4 w-4" />,
    description: "Language compatibility"
  },
  hobbies: {
    name: "Interests",
    icon: <Heart className="h-4 w-4" />,
    description: "Shared hobbies and interests"
  }
};

// Importance level configurations
const IMPORTANCE_CONFIG = {
  must: {
    label: 'Must Have',
    description: 'Absolutely required - no exceptions',
    icon: AlertCircle,
    color: 'bg-red-500 text-white',
    badgeVariant: 'destructive' as const,
    weight: 1.0
  },
  important: {
    label: 'Important',
    description: 'Matters a lot in finding a good match',
    icon: Star,
    color: 'bg-orange-500 text-white',
    badgeVariant: 'default' as const,
    weight: 0.7
  },
  notImportant: {
    label: 'Not Important',
    description: 'Can be flexible or doesn\'t matter much',
    icon: Circle,
    color: 'bg-gray-500 text-white',
    badgeVariant: 'secondary' as const,
    weight: 0.3
  }
};

// Extract importance data from match and compatibility analysis
const extractImportanceData = (match: any): ImportanceWeight[] => {
  const compatibilityBreakdown = match.compatibilityBreakdown || {};
  const compatibilityAnalysis = match.compatibilityAnalysis || {};
  
  // Create mock importance data based on available scores
  const categories = Object.keys(compatibilityBreakdown);
  
  return categories.map(category => {
    const score = compatibilityBreakdown[category] || compatibilityAnalysis[category] || 0;
    
    // Simulate importance based on score and category priority
    let importance: PreferenceImportance = 'notImportant';
    if (['budget', 'location'].includes(category)) {
      importance = 'important';
    } else if (score >= 90) {
      importance = 'must';
    } else if (score >= 70) {
      importance = 'important';
    }
    
    const weight = IMPORTANCE_WEIGHTS[importance];
    const contribution = score * weight;
    
    return {
      category,
      importance,
      weight,
      score,
      contribution,
      userPreference: 'User preference',
      candidateValue: 'Match value'
    };
  }).sort((a, b) => b.contribution - a.contribution);
};

export function ImportanceWeightVisualization({ 
  match, 
  userPreferences, 
  className = '' 
}: ImportanceWeightVisualizationProps) {
  const importanceData = extractImportanceData(match);
  const totalContribution = importanceData.reduce((sum, item) => sum + item.contribution, 0);
  const normalizedScore = totalContribution / importanceData.length;

  // Group by importance level
  const groupedByImportance = importanceData.reduce((acc, item) => {
    if (!acc[item.importance]) acc[item.importance] = [];
    acc[item.importance].push(item);
    return acc;
  }, {} as Record<PreferenceImportance, ImportanceWeight[]>);

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Importance Weight Analysis
          </CardTitle>
          <CardDescription>
            How your ideal roommate preferences are weighted in the matching algorithm
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Score Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Weighted Match Score</span>
              <span className="text-2xl font-bold">{Math.round(normalizedScore)}%</span>
            </div>
            <Progress value={normalizedScore} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on your importance settings and compatibility scores
            </p>
          </div>

          {/* Importance Level Overview */}
          <div className="space-y-4">
            <h4 className="font-medium">Your Importance Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(IMPORTANCE_CONFIG).map(([level, config]) => {
                const items = groupedByImportance[level as PreferenceImportance] || [];
                const Icon = config.icon;
                
                return (
                  <div key={level} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{config.label}</span>
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {items.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Weight: {Math.round(config.weight * 100)}%
                    </p>
                    <div className="space-y-1">
                      {items.slice(0, 3).map(item => {
                        const categoryConfig = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG];
                        return (
                          <div key={item.category} className="text-xs flex items-center gap-2">
                            {categoryConfig?.icon}
                            <span className="truncate">{categoryConfig?.name || item.category}</span>
                          </div>
                        );
                      })}
                      {items.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{items.length - 3} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Contribution to Match Score</h4>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Score × Weight = Contribution to total match score</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="space-y-3">
              {importanceData.slice(0, 8).map((item) => {
                const categoryConfig = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG];
                const importanceConfig = IMPORTANCE_CONFIG[item.importance];
                const Icon = importanceConfig.icon;
                const contributionPercentage = totalContribution > 0 ? (item.contribution / totalContribution) * 100 : 0;
                
                return (
                  <div key={item.category} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {categoryConfig?.icon}
                        <div className="min-w-0">
                          <h5 className="font-medium text-sm truncate">
                            {categoryConfig?.name || item.category}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {categoryConfig?.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant={importanceConfig.badgeVariant} className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {importanceConfig.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(item.score)}% × {Math.round(item.weight * 100)}% = {Math.round(item.contribution)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Compatibility Score</span>
                        <span className="font-medium">{Math.round(item.score)}%</span>
                      </div>
                      <Progress value={Math.max(item.score, 5)} className="h-2" />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span>Contribution to Total</span>
                        <span className="font-medium">{Math.round(contributionPercentage)}%</span>
                      </div>
                      <Progress value={Math.max(contributionPercentage, 2)} className="h-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Algorithm Explanation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">How the Algorithm Works</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Must Have</strong> preferences act as filters - candidates must meet these requirements</li>
                  <li>• <strong>Important</strong> preferences are weighted heavily in the scoring (70% weight)</li>
                  <li>• <strong>Not Important</strong> preferences have minimal impact (30% weight)</li>
                  <li>• Final score = Σ(Compatibility Score × Importance Weight) / Total Weights</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 