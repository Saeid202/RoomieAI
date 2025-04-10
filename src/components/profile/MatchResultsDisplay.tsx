
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MatchResult } from "@/types/profile";

type MatchResultsDisplayProps = {
  matchResults: MatchResult[];
  onBackToProfile: () => void;
};

export function MatchResultsDisplay({ matchResults, onBackToProfile }: MatchResultsDisplayProps) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Potential Matches</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Based on your preferences, we've found these potential roommates for you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matchResults.map((match, index) => (
            <Card key={index} className="overflow-hidden card-hover">
              <div className="h-3 bg-gradient-to-r from-roomie-purple to-roomie-accent"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{match.name}, {match.age}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {match.occupation} • {match.location}
                    </CardDescription>
                  </div>
                  <div className="bg-roomie-light text-roomie-purple font-semibold px-3 py-1 rounded-full text-sm">
                    {match.compatibilityScore}% Match
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Budget</h4>
                    <p className="font-medium">${match.budget[0]} - ${match.budget[1]}/month</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Moving Date</h4>
                    <p className="font-medium">{match.movingDate}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Lifestyle</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.cleanliness > 70 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Very Clean</span>
                      )}
                      {match.pets && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Pet Friendly</span>
                      )}
                      {match.sleepSchedule === "early" && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Early Bird</span>
                      )}
                      {match.sleepSchedule === "night" && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Night Owl</span>
                      )}
                      {!match.smoking && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Non-Smoker</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Interests</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.interests.slice(0, 4).map((interest, i) => (
                        <span key={i} className="bg-roomie-light text-roomie-purple text-xs px-2 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                      {match.interests.length > 4 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          +{match.interests.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-roomie-purple hover:bg-roomie-dark">
                  Contact {match.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="outline" className="border-roomie-purple text-roomie-purple" onClick={onBackToProfile}>
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
