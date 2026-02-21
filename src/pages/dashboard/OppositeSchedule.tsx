import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  Home, 
  MessageSquare,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import OppositeScheduleForm from '@/components/opposite-schedule/OppositeScheduleForm';
import { OppositeScheduleProfile, OppositeScheduleMatch } from '@/types/oppositeSchedule';

export default function OppositeSchedulePage() {
  const [profile, setProfile] = useState<OppositeScheduleProfile | null>(null);
  const [matches, setMatches] = useState<OppositeScheduleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMatches();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement getOppositeScheduleProfile service
      // const profileData = await getOppositeScheduleProfile(user.id);
      // setProfile(profileData);
      setProfile(null); // Mock for now
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      // TODO: Implement getOppositeScheduleMatches service
      // const matchesData = await getOppositeScheduleMatches(user.id);
      // setMatches(matchesData);
      setMatches([]); // Mock for now
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  };

  const handleProfileSaved = () => {
    toast({
      title: "Profile updated",
      description: "Your opposite schedule profile has been saved successfully.",
    });
    loadProfile();
    loadMatches();
  };

  const getScheduleIcon = (schedule: string) => {
    if (schedule.includes('Night')) return '🌙';
    if (schedule.includes('Day')) return '☀️';
    if (schedule.includes('Evening')) return '🌆';
    if (schedule.includes('Morning')) return '🌅';
    if (schedule.includes('Weekend')) return '📅';
    return '⏰';
  };

  const getCompatibilityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg orange-purple-gradient">
            <Clock className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gradient">
              Opposite Schedule Room Sharing
            </h1>
            <p className="text-sm text-muted-foreground">Find roommates with opposite work schedules for optimal shared living</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <section className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-1">
              <TabsTrigger 
                value="profile" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                My Profile
              </TabsTrigger>
              <TabsTrigger 
                value="matches"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                Find Matches
              </TabsTrigger>
            </TabsList>
          </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-orange-200/30 shadow-lg">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-gradient">Your Profile</CardTitle>
              <CardDescription className="text-muted-foreground">
                Complete your profile to find compatible roommates with opposite schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <OppositeScheduleForm onProfileSaved={handleProfileSaved} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          <Card className="border-purple-200/30 shadow-lg">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-gradient">Your Matches</CardTitle>
              <CardDescription className="text-muted-foreground">
                Compatible roommates with opposite work schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-medium text-foreground">No Matches Yet</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Complete your profile to find compatible roommates with opposite schedules.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('profile')}
                    className="mt-6 button-gradient text-white"
                  >
                    Complete Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {matches.map((match) => (
                <Card key={match.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {getScheduleIcon(match.work_schedule)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {match.work_schedule} • {match.occupation || 'Professional'}
                          </CardTitle>
                          <CardDescription>
                            Looking for: {match.preferred_schedule}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={getCompatibilityColor(match.compatibility_score)}
                        >
                          {match.compatibility_score ? `${match.compatibility_score}% Match` : 'New Match'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{match.property_type}</p>
                          <p className="text-xs text-muted-foreground">Property type</p>
                        </div>
                      </div>
                      
                      {match.nationality && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{match.nationality}</p>
                            <p className="text-xs text-muted-foreground">Nationality</p>
                          </div>
                        </div>
                      )}
                      
                    </div>

                    {match.food_restrictions && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            Food Preferences: {match.food_restrictions}
                          </span>
                        </div>
                      </div>
                    )}

                    {match.additional_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">{match.additional_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Profile created {new Date(match.created_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </section>
    </div>
  );
}