import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  MessageSquare, 
  User, 
  Heart, 
  Star,
  Calendar
} from "lucide-react";

interface MatchCardProps {
  match: {
    id: string;
    userId?: string;
    name: string;
    age: string;
    gender: string;
    occupation: string;
    location: string;
    profileImage?: string;
    compatibilityScore?: number;
    isAlgorithmMatch: boolean;
    isOnline: boolean;
    lastActive: Date;
    bio?: string;
    smoking: boolean;
    hasPets: boolean;
    workSchedule: string;
    cleanliness: number;
  };
  onMessage: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function MatchCard({ match, onMessage, onViewProfile }: MatchCardProps) {
  const handleMessage = () => {
    onMessage(match.userId);
  };

  const viewProfile = () => {
    onViewProfile(match.userId);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {match.profileImage ? (
                <img src={match.profileImage} alt={match.name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-orange-400 text-white font-semibold">
                  {match.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{match.name}</h3>
              <p className="text-sm text-gray-600">{match.age} years old</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {match.isOnline && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                Online
              </Badge>
            )}
            {match.isAlgorithmMatch && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          {match.location}
        </div>

        {match.compatibilityScore && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Compatibility</span>
              <span className="font-bold text-lg">{match.compatibilityScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${match.compatibilityScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Why they match */}
        {match.isAlgorithmMatch && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              <span className="font-semibold">Why you match:</span> Both night owls, love clean spaces, and enjoy similar hobbies!
            </p>
          </div>
        )}

        {match.bio && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {match.bio}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleMessage}
            className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={viewProfile}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
