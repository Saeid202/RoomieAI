import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  Home, 
  MapPin, 
  DollarSign, 
  MessageSquare,
  RefreshCw,
  User,
  Calendar
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Opposite Schedule Room Sharing</h1>
                <p className="text-blue-100 text-lg">Find roommates with opposite work schedules for optimal shared living</p>
              </div>
              <Button 
                onClick={loadMatches} 
                variant="secondary" 
                size="lg"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Matches
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Your Profile" 
            value={profile ? 1 : 0} 
            icon={User} 
            gradient="from-blue-500 to-blue-600"
            subtitle={profile ? 'Complete' : 'Incomplete'}
          />
          <StatCard 
            title="Potential Matches" 
            value={matches.length} 
            icon={Users} 
            gradient="from-green-500 to-emerald-500"
            subtitle="Compatible roommates"
          />
          <StatCard 
            title="Last Updated" 
            value={profile?.updated_at ? 1 : 0} 
            icon={Calendar} 
            gradient="from-purple-500 to-pink-500"
            subtitle={profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
          />
        </div>

        {/* Enhanced Tabs */}
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
          <OppositeScheduleForm onProfileSaved={handleProfileSaved} />
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          {matches.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Matches Yet</h3>
                <p className="text-lg text-gray-600 mb-6">Complete your profile to find compatible roommates with opposite schedules.</p>
                <Button 
                  onClick={() => setActiveTab('profile')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
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
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className = "", gradient = "from-blue-500 to-blue-600", subtitle }: { 
  title: string; 
  value: number; 
  icon?: any; 
  className?: string; 
  gradient?: string;
  subtitle?: string;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl shadow-lg`}>
            {Icon ? <Icon className="h-6 w-6 text-white" /> : null}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className={`text-3xl font-bold ${className}`}>{value}</div>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`} style={{ width: `${Math.min((value / Math.max(value, 1)) * 100, 100)}%` }}></div>
        </div>
      </CardContent>
    </Card>
  );
}