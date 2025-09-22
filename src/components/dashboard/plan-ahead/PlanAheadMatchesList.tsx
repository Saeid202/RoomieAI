import { Calendar, MapPin, User, Home, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlanAheadMatch } from "@/hooks/usePlanAheadMatches";

interface Props {
  matches: PlanAheadMatch[];
}

export default function PlanAheadMatchesList({ matches }: Props) {
  if (!matches || matches.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPropertyTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'apartment': 'Apartment',
      'house': 'House',
      'condo': 'Condo',
      'studio': 'Studio',
      'shared-room': 'Shared Room',
      'private-room': 'Private Room',
      'no-preference': 'No Preference'
    };
    return types[type] || type;
  };

  const getGenderDisplay = (gender: string | null) => {
    if (!gender || gender === 'any') return 'Any gender';
    const genders: Record<string, string> = {
      'male': 'Male',
      'female': 'Female',
      'nonbinary': 'Non-binary'
    };
    return genders[gender] || gender;
  };

  const getLanguageDisplay = (language: string | null) => {
    if (!language) return '';
    const languages: Record<string, string> = {
      'english': 'English',
      'spanish': 'Spanish',
      'french': 'French',
      'german': 'German',
      'italian': 'Italian',
      'portuguese': 'Portuguese',
      'chinese': 'Chinese',
      'japanese': 'Japanese',
      'korean': 'Korean',
      'arabic': 'Arabic',
      'hindi': 'Hindi',
      'russian': 'Russian',
      'other': 'Other'
    };
    return languages[language] || language;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {matches.map((match) => {
        const currentLocation = match.current_location || "Unknown location";
        const targetLocations = match.target_locations?.slice(0, 3) || [];
        const moveDate = formatDate(match.move_date);
        const userName = match.user?.user_metadata?.full_name || match.user?.email?.split('@')[0] || 'Anonymous';

        return (
          <Card key={match.id} className="border-slate-200/30 hover:border-slate-300/50 transition-all duration-300 shadow-md hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-slate-50/50">
              <CardTitle className="text-base text-gradient font-semibold">Potential Match</CardTitle>
              <Badge className="orange-purple-gradient text-white shadow-sm">
                <User className="h-3 w-3 mr-1" />
                {userName}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              {/* Location Information */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 text-foreground">
                  <div className="p-1 rounded-full bg-orange-100">
                    <MapPin className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="font-medium">From:</span>
                  <span className="text-orange-700">{currentLocation}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-foreground">
                  <div className="p-1 rounded-full bg-purple-100">
                    <Calendar className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="font-medium">Moving:</span>
                  <span className="text-purple-700">{moveDate}</span>
                </div>
              </div>

              {/* Target Locations */}
              {targetLocations.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">Target locations:</span>
                  {targetLocations.map((location, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                  {match.target_locations?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{match.target_locations.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Property and Roommate Preferences */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 text-foreground">
                  <div className="p-1 rounded-full bg-orange-100">
                    <Home className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="font-medium">Property:</span>
                  <span className="text-orange-700">{getPropertyTypeDisplay(match.property_type)}</span>
                </div>
                {match.looking_for_roommate && (
                  <div className="inline-flex items-center gap-2 text-foreground">
                    <div className="p-1 rounded-full bg-purple-100">
                      <Users className="h-3 w-3 text-purple-600" />
                    </div>
                    <span className="font-medium">Roommate:</span>
                    <span className="text-purple-700">{getGenderDisplay(match.roommate_gender_pref)}</span>
                    {match.language_pref && (
                      <span className="text-purple-600">• {getLanguageDisplay(match.language_pref)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {match.additional_info && (
                <div>
                  <Separator className="my-2" />
                  <p className="text-sm italic text-muted-foreground">
                    "{match.additional_info}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
