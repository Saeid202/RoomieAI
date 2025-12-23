
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CompatibilityBreakdown } from "../CompatibilityBreakdown";
import { ImportanceWeightVisualization } from "./ImportanceWeightVisualization";
import {
  Star,
  Heart,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Home,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Briefcase,
  Users,
  Cigarette,
  PawPrint,
  Utensils,
  Moon,
  Activity
} from "lucide-react";

interface MatchDetailViewProps {
  match: any;
  onClose: () => void;
}

// Helper functions for enhanced display
const getScoreColor = (score: number) => {
  if (score >= 85) return "text-green-600 bg-green-50";
  if (score >= 70) return "text-blue-600 bg-blue-50";
  if (score >= 55) return "text-yellow-600 bg-yellow-50";
  return "text-orange-600 bg-orange-50";
};

const getScoreIcon = (score: number) => {
  if (score >= 85) return <Star className="h-4 w-4 text-green-600" />;
  if (score >= 70) return <TrendingUp className="h-4 w-4 text-blue-600" />;
  if (score >= 55) return <Target className="h-4 w-4 text-yellow-600" />;
  return <Activity className="h-4 w-4 text-orange-600" />;
};

const formatDetailedScores = (breakdown: any) => {
  // If we have detailed scores from idealRoommateMatchingService
  if (breakdown.detailedScores) {
    return Object.entries(breakdown.detailedScores)
      .map(([key, value]) => ({ key, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }

  // Fallback to standard breakdown
  return Object.entries(breakdown)
    .filter(([key]) => key !== 'enhanced' && key !== 'detailedScores')
    .map(([key, value]) => ({ key, value: Number(value) }))
    .sort((a, b) => b.value - a.value);
};

const getCategoryDetails = (key: string) => {
  const details = {
    gender: { name: "Gender Preference", icon: <Users className="h-4 w-4" />, description: "Mutual gender preference match" },
    age: { name: "Age Range", icon: <Calendar className="h-4 w-4" />, description: "Age compatibility within preferred range" },
    location: { name: "Location", icon: <MapPin className="h-4 w-4" />, description: "Preferred living locations match" },
    budget: { name: "Budget", icon: <DollarSign className="h-4 w-4" />, description: "Financial compatibility" },
    smoking: { name: "Smoking", icon: <Cigarette className="h-4 w-4" />, description: "Smoking preferences alignment" },
    pets: { name: "Pets", icon: <PawPrint className="h-4 w-4" />, description: "Pet-related preferences match" },
    workSchedule: { name: "Work Schedule", icon: <Clock className="h-4 w-4" />, description: "Working hours compatibility" },
    diet: { name: "Diet", icon: <Utensils className="h-4 w-4" />, description: "Dietary preferences match" },
    hobbies: { name: "Interests", icon: <Heart className="h-4 w-4" />, description: "Shared hobbies and interests" },
    nationality: { name: "Nationality", icon: <User className="h-4 w-4" />, description: "Nationality preference match" },
    language: { name: "Language", icon: <MessageCircle className="h-4 w-4" />, description: "Language compatibility" },
    ethnicity: { name: "Ethnicity", icon: <Users className="h-4 w-4" />, description: "Ethnicity preference match" },
    religion: { name: "Religion", icon: <Star className="h-4 w-4" />, description: "Religious preference compatibility" },
    occupation: { name: "Occupation", icon: <Briefcase className="h-4 w-4" />, description: "Career compatibility" },
    housingType: { name: "Housing Type", icon: <Home className="h-4 w-4" />, description: "Housing preference match" },
    sleepSchedule: { name: "Sleep Schedule", icon: <Moon className="h-4 w-4" />, description: "Sleep pattern compatibility" },
    lifestyle: { name: "Lifestyle", icon: <Activity className="h-4 w-4" />, description: "Overall lifestyle compatibility" },
    schedule: { name: "Schedule", icon: <Clock className="h-4 w-4" />, description: "Daily schedule alignment" },
    interests: { name: "Interests", icon: <Heart className="h-4 w-4" />, description: "Shared interests and hobbies" },
    cleanliness: { name: "Cleanliness", icon: <Sparkles className="h-4 w-4" />, description: "Cleaning habits compatibility" }
  };

  return details[key as keyof typeof details] || {
    name: key.charAt(0).toUpperCase() + key.slice(1),
    icon: <Activity className="h-4 w-4" />,
    description: "Compatibility score"
  };
};

export function MatchDetailView({ match, onClose }: MatchDetailViewProps) {
  const matchReasons = match.matchReasons || match.enhancedReasons || [];
  const detailedScores = formatDetailedScores(match.compatibilityBreakdown || {});
  const topScores = detailedScores.slice(0, 8);
  const allScores = detailedScores.slice(8);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                {match.name}, {match.age}
                {(match.compatibilityScore || match.compatibility || 0) >= 85 && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </CardTitle>
              <CardDescription className="text-base">
                {match.occupation} • {match.location}
              </CardDescription>
              <div className="flex items-center gap-2">
                {getScoreIcon(match.compatibilityScore || match.compatibility || 0)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(match.compatibilityScore || match.compatibility || 0)}`}>
                  {match.compatibilityScore || match.compatibility || 0}% Compatibility Match
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              ← Back to matches
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Match Reasons Section */}
              {matchReasons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-500" />
                      Why this is a great match
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {matchReasons.map((reason: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-green-800">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Personal Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Age:</span>
                      </div>
                      <span className="font-medium">{match.age}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Gender:</span>
                      </div>
                      <span className="font-medium">{match.gender}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Occupation:</span>
                      </div>
                      <span className="font-medium">{match.occupation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                      </div>
                      <span className="font-medium">{match.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Budget:</span>
                      </div>
                      <span className="font-medium">
                        {Array.isArray(match.budget)
                          ? `$${match.budget[0].toLocaleString()} - $${match.budget[1].toLocaleString()}`
                          : match.budget}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Move-in:</span>
                      </div>
                      <span className="font-medium">{match.movingDate}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compatibility Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CompatibilityBreakdown
                      breakdown={match.compatibilityBreakdown}
                      overallScore={match.compatibilityScore || match.compatibility || 0}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compatibility" className="space-y-6">
              {/* Importance Weight Visualization */}
              <ImportanceWeightVisualization match={match} />

              <Separator />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Compatibility Analysis</CardTitle>
                  <CardDescription>
                    Individual compatibility scores for each preference category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topScores.map(({ key, value }) => {
                    const details = getCategoryDetails(key);
                    return (
                      <div key={key} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {details.icon}
                            <div>
                              <h4 className="font-medium">{details.name}</h4>
                              <p className="text-sm text-muted-foreground">{details.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">{Math.round(value)}%</div>
                            <div className="text-xs text-muted-foreground">
                              {value >= 90 ? "Excellent" : value >= 75 ? "Great" : value >= 60 ? "Good" : "Fair"}
                            </div>
                          </div>
                        </div>
                        <Progress value={Math.max(value, 5)} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lifestyle Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-muted-foreground">Daily Habits</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cigarette className="h-4 w-4 text-muted-foreground" />
                            <span>Smoking:</span>
                          </div>
                          <Badge variant={match.smoking ? "destructive" : "secondary"}>
                            {match.smoking ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PawPrint className="h-4 w-4 text-muted-foreground" />
                            <span>Pets:</span>
                          </div>
                          <Badge variant={match.pets ? "default" : "secondary"}>
                            {match.pets ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Guests:</span>
                          </div>
                          <span className="font-medium">{match.guests}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                            <span>Cleanliness:</span>
                          </div>
                          <span className="font-medium">{Math.round(match.cleanliness)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-muted-foreground">Schedules</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-muted-foreground" />
                            <span>Sleep schedule:</span>
                          </div>
                          <Badge variant="outline">{match.sleepSchedule}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Work schedule:</span>
                          </div>
                          <Badge variant="outline">{match.workSchedule}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interests & Hobbies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {match.interests?.map((interest: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Desired Roommate Traits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {match.traits?.map((trait: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-sm">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-muted/50 p-6">
          <div className="flex gap-3 w-full">
            <Button className="flex-1" size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-4 w-4 mr-2" />
              Save Match
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
