
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Clock } from "lucide-react";

interface RoommateCardProps {
  match: any;
  onViewDetails: (match: any) => void;
}

export function RoommateCard({ match, onViewDetails }: RoommateCardProps) {
  return (
    <Card className="overflow-hidden">
      <div 
        className={`h-2 ${
          match.compatibilityScore > 80 
            ? "bg-green-500" 
            : match.compatibilityScore > 60 
              ? "bg-yellow-500" 
              : "bg-orange-500"
        }`} 
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{match.name}, {match.age}</CardTitle>
          <div className="bg-muted px-2 py-1 rounded-full font-semibold text-sm">
            {match.compatibilityScore}% Match
          </div>
        </div>
        <CardDescription>{match.occupation} • {match.location}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>Budget:</span>
            </div>
            <span className="text-sm font-medium">${match.budget[0]} - ${match.budget[1]}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Schedule:</span>
            </div>
            <span className="text-sm font-medium">{match.workSchedule}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Compatibility</h4>
          <div className="space-y-2">
            {Object.entries(match.compatibilityBreakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="bg-muted h-2 rounded-full flex-1">
                  <div 
                    className={`h-2 rounded-full ${
                      key === 'schedule' 
                        ? 'bg-blue-500' 
                        : key === 'budget' 
                          ? 'bg-green-500' 
                          : key === 'lifestyle' 
                            ? 'bg-purple-500' 
                            : 'bg-amber-500'
                    }`} 
                    style={{ width: `${Math.round(Number(value) * 5)}%` }} 
                  />
                </div>
                <span className="text-xs">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails(match)}
        >
          View Details
        </Button>
        <Button className="flex-1">Contact</Button>
      </CardFooter>
    </Card>
  );
}
