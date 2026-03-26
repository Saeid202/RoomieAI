// Co-Ownership Profile Page
// Main page for managing co-buyer matching profile

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Components
import { FinancialCapacitySection } from '@/components/co-ownership/FinancialCapacitySection';
import { PropertyPreferencesSection } from '@/components/co-ownership/PropertyPreferencesSection';
import { CoOwnershipPrefsSection } from '@/components/co-ownership/CoOwnershipPrefsSection';
import { PersonalInfoSection } from '@/components/co-ownership/PersonalInfoSection';
import { ProfileCompletenessBar } from '@/components/co-ownership/ProfileCompletenessBar';
import { MatchCard } from '@/components/co-ownership/MatchCard';

// Services and Types
import {
  getCoOwnershipProfile,
  saveCoOwnershipProfile,
  validateProfileData,
} from '@/services/coOwnershipProfileService';
import {
  calculateProfileCompleteness,
  profileToFormData,
  formDataToProfile,
} from '@/types/coOwnershipProfile';
import type { CoOwnershipProfileFormData } from '@/types/coOwnershipProfile';
import {
  getMyMatches,
  initiateConnection,
  updateConnectionState,
} from '@/services/coOwnershipMatchingService';
import type { PartialMatchResult } from '@/types/coOwnershipMatching';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-6 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-8 flex-1 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CoOwnershipProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast: toastHook } = useToast();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'profile' | 'matches'>(
    (searchParams.get('tab') as 'profile' | 'matches') || 'profile'
  );
  const [matches, setMatches] = useState<PartialMatchResult[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CoOwnershipProfileFormData>({
    budget_min: '',
    budget_max: '',
    down_payment: '',
    annual_income: '',
    credit_score_range: '',
    property_types: [],
    preferred_locations: [],
    min_bedrooms: null,
    purchase_timeline: '',
    ownership_split: '',
    living_arrangements: [],
    co_ownership_purposes: [],
    age_range: '',
    occupation: '',
    why_co_ownership: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completeness, setCompleteness] = useState(0);

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        const { data, error } = await getCoOwnershipProfile(user.id);

        if (error) {
          console.error('Error loading profile:', error);
          toastHook({
            title: 'Error',
            description: 'Failed to load your profile. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        if (data) {
          setExistingProfileId(data.id);
          setFormData(profileToFormData(data));
          setCompleteness(data.profile_completeness);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id, toastHook]);

  // Load matches
  async function loadMatches() {
    if (!user?.id) return;
    try {
      setMatchesLoading(true);
      setMatchesError(null);
      const results = await getMyMatches(user.id);
      setMatches(results);
    } catch (e: any) {
      setMatchesError(e?.message || 'Failed to load matches');
    } finally {
      setMatchesLoading(false);
    }
  }

  // Load matches when tab changes
  useEffect(() => {
    if (activeTab === 'matches' && user?.id) {
      loadMatches();
    }
  }, [activeTab, user?.id]);

  // Update completeness when form data changes
  useEffect(() => {
    const profileData = formDataToProfile(formData);
    const newCompleteness = calculateProfileCompleteness(profileData);
    setCompleteness(newCompleteness);
  }, [formData]);

  // Handle field changes
  const handleChange = (field: keyof CoOwnershipProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!user?.id) {
      toastHook({
        title: 'Error',
        description: 'You must be logged in to save your profile.',
        variant: 'destructive',
      });
      return;
    }

    // Validate
    const validation = validateProfileData(formData);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        errorMap[error] = error;
      });
      setErrors(errorMap);
      
      toastHook({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before saving.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await saveCoOwnershipProfile(
        user.id,
        formData,
        existingProfileId
      );

      if (error) {
        throw error;
      }

      if (data) {
        setExistingProfileId(data.id);
        toastHook({
          title: 'Success!',
          description: existingProfileId 
            ? 'Your profile has been updated.' 
            : 'Your profile has been created.',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toastHook({
        title: 'Error',
        description: 'Failed to save your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  async function handleConnect(matchUserId: string) {
    if (!user?.id) return;
    try {
      await initiateConnection(user.id, matchUserId);
      toast.success('Connection request sent');
      await loadMatches();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to connect');
    }
  }

  async function handleDecline(connectionId: string, matchUserId: string) {
    if (!user?.id) return;
    try {
      await updateConnectionState(connectionId, user.id, 'declined');
      toast.success('Match declined');
      await loadMatches();
    } catch (e: any) {
      try {
        const conn = await initiateConnection(user.id, matchUserId);
        await updateConnectionState(conn.id, user.id, 'declined');
        toast.success('Match declined');
        await loadMatches();
      } catch {
        toast.error(e?.message || 'Failed to decline');
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-roomie-purple" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-purple-600">
          <UserPlus className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
            Co-Ownership
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile and find compatible co-buyer partners
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'profile'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
            activeTab === 'matches'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Matches
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
          {/* Profile Completeness */}
          <ProfileCompletenessBar percentage={completeness} className="mb-6" />

          {/* Main Form */}
          <Card className="border-orange-200/30 shadow-lg mb-6">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {/* Financial Capacity */}
              <FinancialCapacitySection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />

              {/* Property Preferences */}
              <PropertyPreferencesSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />

              {/* Co-Ownership Preferences */}
              <CoOwnershipPrefsSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />

              {/* Personal Info */}
              <PersonalInfoSection
                formData={formData}
                onChange={handleChange}
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-2 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {existingProfileId ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="max-w-2xl">
          {matchesLoading ? (
            <LoadingSkeleton />
          ) : matchesError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">{matchesError}</p>
              <button
                onClick={loadMatches}
                className="mt-3 text-sm text-primary underline-offset-2 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No matches yet. Complete your co-ownership profile to get matched.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard
                  key={match.matchId}
                  match={match}
                  currentUserId={user?.id ?? ''}
                  onConnect={handleConnect}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
