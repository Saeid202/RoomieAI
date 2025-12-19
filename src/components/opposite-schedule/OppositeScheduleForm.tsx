import React, { useState, useEffect } from 'react';
import { Clock, User, Home, Search, DollarSign, MapPin, MessageSquare, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { OppositeScheduleFormData } from '@/types/oppositeSchedule';
import { saveOppositeScheduleProfile, getOppositeScheduleProfile } from '@/services/oppositeScheduleService';

interface OppositeScheduleFormProps {
  onProfileSaved?: () => void;
}

const NATIONALITIES = [
  'Canadian', 'American', 'British', 'Australian', 'German', 'French', 'Italian', 'Spanish',
  'Portuguese', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech',
  'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Turkish', 'Russian', 'Ukrainian', 'Chinese',
  'Japanese', 'Korean', 'Vietnamese', 'Thai', 'Filipino', 'Indian', 'Pakistani', 'Bangladeshi',
  'Sri Lankan', 'Nepalese', 'Afghan', 'Iranian', 'Iraqi', 'Lebanese', 'Jordanian', 'Egyptian',
  'Moroccan', 'Tunisian', 'Algerian', 'Nigerian', 'Kenyan', 'South African', 'Brazilian',
  'Argentinian', 'Chilean', 'Mexican', 'Colombian', 'Peruvian', 'Venezuelan', 'Other'
];

const PROPERTY_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'one-bedroom', label: 'One Bedroom' },
  { value: 'two-bedroom', label: 'Two Bedroom' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'basement', label: 'Basement Unit' },
  { value: 'no-preference', label: 'No Preference' }
];

const SCHEDULE_OPTIONS = [
  '9-5 PM (Day Shift)',
  'Night Shift (11 PM - 7 AM)',
  'Evening Shift (3 PM - 11 PM)',
  'Morning Shift (6 AM - 2 PM)',
  'Rotating Schedule',
  'Weekend Work',
  'Flexible Hours',
  'Part-time',
  'Other'
];

export default function OppositeScheduleForm({ onProfileSaved }: OppositeScheduleFormProps) {
  const [formData, setFormData] = useState<OppositeScheduleFormData>({
    work_schedule: '',
    occupation: '',
    nationality: '',
    property_type: '',
    preferred_schedule: '',
    preferred_nationality: '',
    food_restrictions: '',
    additional_notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load existing profile on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        const profile = await getOppositeScheduleProfile(user.id);
        if (profile) {
          setFormData({
            work_schedule: profile.work_schedule || '',
            occupation: profile.occupation || '',
            nationality: profile.nationality || '',
            property_type: profile.property_type || '',
            preferred_schedule: profile.preferred_schedule || '',
            preferred_nationality: profile.preferred_nationality || '',
            food_restrictions: profile.food_restrictions || '',
            additional_notes: profile.additional_notes || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
    
    loadProfile();
  }, [user]);

  const handleInputChange = (field: keyof OppositeScheduleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "Log in to save your opposite schedule profile.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.work_schedule || !formData.property_type || !formData.preferred_schedule) {
      toast({
        title: "Missing required fields",
        description: "Please fill in your work schedule, property type, and preferred roommate schedule.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await saveOppositeScheduleProfile(user.id, formData);
      
      toast({
        title: "Profile saved",
        description: "Your opposite schedule room sharing profile has been saved.",
      });
      
      // Call the callback if provided
      if (onProfileSaved) {
        onProfileSaved();
      }
    } catch (error) {
      console.error('Failed to save opposite schedule profile', error);
      toast({
        title: "Save failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-purple-100 to-purple-200 p-8 text-purple-900 shadow">
          <div className="absolute inset-0 bg-white/20"></div>
          
          <div className="relative z-10 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight mb-2 text-purple-900">
              Opposite Schedule Room Sharing
            </CardTitle>
            <CardDescription className="text-purple-600 text-lg">
              Find roommates with opposite work schedules - perfect for shared living spaces
            </CardDescription>
          </div>

          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/30 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/20 rounded-full"></div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Your Work Schedule */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Your Work Schedule</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work_schedule" className="text-sm font-medium">
                    Work Schedule *
                  </Label>
                  <select
                    id="work_schedule"
                    value={formData.work_schedule}
                    onChange={(e) => handleInputChange('work_schedule', e.target.value)}
                    className="w-full h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300 px-4"
                    required
                  >
                    <option value="">Select your work schedule</option>
                    {SCHEDULE_OPTIONS.map((schedule) => (
                      <option key={schedule} value={schedule}>
                        {schedule}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm font-medium">
                    Occupation
                  </Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="e.g., Software Engineer, Nurse, Teacher"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-sm font-medium">
                    Nationality
                  </Label>
                  <select
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300 px-4"
                  >
                    <option value="">Select your nationality</option>
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type" className="text-sm font-medium">
                    Property Type *
                  </Label>
                  <select
                    id="property_type"
                    value={formData.property_type}
                    onChange={(e) => handleInputChange('property_type', e.target.value)}
                    className="w-full h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300 px-4"
                    required
                  >
                    <option value="">Select property type</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2: What You're Looking For */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">What You're Looking For</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_schedule" className="text-sm font-medium">
                    Preferred Roommate Schedule *
                  </Label>
                  <select
                    id="preferred_schedule"
                    value={formData.preferred_schedule}
                    onChange={(e) => handleInputChange('preferred_schedule', e.target.value)}
                    className="w-full h-12 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 hover:border-gray-300 px-4"
                    required
                  >
                    <option value="">Select preferred roommate schedule</option>
                    {SCHEDULE_OPTIONS.map((schedule) => (
                      <option key={schedule} value={schedule}>
                        {schedule}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_nationality" className="text-sm font-medium">
                    Preferred Nationality
                  </Label>
                  <select
                    id="preferred_nationality"
                    value={formData.preferred_nationality}
                    onChange={(e) => handleInputChange('preferred_nationality', e.target.value)}
                    className="w-full h-12 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 hover:border-gray-300 px-4"
                  >
                    <option value="">Any nationality</option>
                    {NATIONALITIES.map((nationality) => (
                      <option key={nationality} value={nationality}>
                        {nationality}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="food_restrictions" className="text-sm font-medium">
                  Food Restrictions/Preferences
                </Label>
                <Textarea
                  id="food_restrictions"
                  value={formData.food_restrictions}
                  onChange={(e) => handleInputChange('food_restrictions', e.target.value)}
                  placeholder="e.g., Vegetarian, Halal, No pork, Gluten-free, etc."
                  rows={3}
                  className="text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                />
              </div>
            </div>

            <Separator />

            {/* Section 3: Additional Preferences */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Additional Preferences</h3>
              </div>
              

              <div className="space-y-2">
                <Label htmlFor="additional_notes" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                  placeholder="Any other preferences or requirements..."
                  rows={3}
                  className="text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                disabled={isSubmitting}
              >
                <Save className="mr-3 h-6 w-6" />
                {isSubmitting ? "Saving Profile..." : "Save Opposite Schedule Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
