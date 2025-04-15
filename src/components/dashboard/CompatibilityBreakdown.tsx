
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Activity, 
  Heart, 
  Sparkles
} from "lucide-react";

interface CompatibilityBreakdownProps {
  breakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    schedule: number;
    interests: number;
    cleanliness: number;
  };
  overallScore: number;
}

export function CompatibilityBreakdown({ breakdown, overallScore }: CompatibilityBreakdownProps) {
  const categories = [
    { 
      name: "Budget", 
      score: breakdown.budget, 
      icon: <DollarSign className="h-4 w-4" />,
      color: "bg-green-500",
      description: "Financial compatibility based on budget ranges" 
    },
    { 
      name: "Location", 
      score: breakdown.location, 
      icon: <MapPin className="h-4 w-4" />,
      color: "bg-blue-500",
      description: "Preferred living locations match" 
    },
    { 
      name: "Lifestyle", 
      score: breakdown.lifestyle, 
      icon: <Activity className="h-4 w-4" />,
      color: "bg-purple-500",
      description: "Smoking, pets, guests, and sleep habits" 
    },
    { 
      name: "Work Schedule", 
      score: breakdown.schedule, 
      icon: <Clock className="h-4 w-4" />,
      color: "bg-amber-500",
      description: "Day/night shifts and working hours compatibility" 
    },
    { 
      name: "Interests", 
      score: breakdown.interests, 
      icon: <Heart className="h-4 w-4" />,
      color: "bg-red-500",
      description: "Shared hobbies and common interests" 
    },
    { 
      name: "Cleanliness", 
      score: breakdown.cleanliness, 
      icon: <Sparkles className="h-4 w-4" />,
      color: "bg-teal-500", 
      description: "Cleaning habits and tidiness preferences"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Overall Compatibility</h3>
          <span className="font-bold">{overallScore}%</span>
        </div>
        <Progress value={overallScore} className="h-2" />
      </div>
      
      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${category.color.replace('bg-', 'bg-opacity-20 text-')}`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-sm font-medium">{Math.round(category.score)}%</span>
            </div>
            <Progress 
              value={category.score * 5} // Convert score out of 20 to percentage
              className={`h-1.5 ${category.color}`} 
            />
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
