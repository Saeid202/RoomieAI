
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompatibilityBreakdown } from "../CompatibilityBreakdown";

interface MatchDetailViewProps {
  match: any;
  onClose: () => void;
}

export function MatchDetailView({ match, onClose }: MatchDetailViewProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Match Details: {match.name}</CardTitle>
          <Button variant="outline" onClick={onClose}>Back to matches</Button>
        </div>
        <CardDescription>Compatibility score: {match.compatibilityScore}%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Details</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span>{match.age}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span>{match.gender}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Occupation:</span>
                <span>{match.occupation}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{match.location}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Budget range:</span>
                <span>${match.budget[0]} - ${match.budget[1]}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Move-in date:</span>
                <span>{match.movingDate}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Compatibility Breakdown</h3>
            <CompatibilityBreakdown 
              breakdown={match.compatibilityBreakdown} 
              overallScore={match.compatibilityScore}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Lifestyle</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Smoking:</span>
              <span>{match.smoking ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pets:</span>
              <span>{match.pets ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests:</span>
              <span>{match.guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sleep schedule:</span>
              <span>{match.sleepSchedule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Work schedule:</span>
              <span>{match.workSchedule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cleanliness:</span>
              <span>{Math.round(match.cleanliness)}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Interests & Traits</h3>
          <div className="flex flex-wrap gap-2">
            {match.interests.map((interest: string, i: number) => (
              <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                {interest}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {match.traits.map((trait: string, i: number) => (
              <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Contact {match.name}</Button>
      </CardFooter>
    </Card>
  );
}
