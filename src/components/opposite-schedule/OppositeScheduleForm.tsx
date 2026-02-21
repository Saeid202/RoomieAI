import React, { useState, useEffect } from 'react';
import { Clock, Search, MessageSquare, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Section 1: Your Work Schedule */}
        <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Your Work Schedule
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Field 1: Work Schedule */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
                <Label htmlFor="work_schedule" className="text-sm font-semibold">
                  Work Schedule *
                </Label>
              </div>
              <select
                id="work_schedule"
                value={formData.work_schedule}
                onChange={(e) => handleInputChange('work_schedule', e.target.value)}
                className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
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

            {/* Field 2: Occupation */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
                <Label htmlFor="occupation" className="text-sm font-semibold">
                  Occupation
                </Label>
              </div>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="e.g., Software Engineer, Nurse"
                className="h-9 text-sm border-2 border-slate-300"
              />
            </div>

            {/* Field 3: Nationality */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
                <Label htmlFor="nationality" className="text-sm font-semibold">
                  Nationality
                </Label>
              </div>
              <select
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
              >
                <option value="">Select your nationality</option>
                {NATIONALITIES.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4: Property Type */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">4</span>
                <Label htmlFor="property_type" className="text-sm font-semibold">
                  Property Type *
                </Label>
              </div>
              <select
                id="property_type"
                value={formData.property_type}
                onChange={(e) => handleInputChange('property_type', e.target.value)}
                className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
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

        {/* Section 2: What You're Looking For */}
        <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-purple-600" />
            What You're Looking For
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Field 5: Preferred Roommate Schedule */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">5</span>
                <Label htmlFor="preferred_schedule" className="text-sm font-semibold">
                  Preferred Roommate Schedule *
                </Label>
              </div>
              <select
                id="preferred_schedule"
                value={formData.preferred_schedule}
                onChange={(e) => handleInputChange('preferred_schedule', e.target.value)}
                className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
                required
              >
                <option value="">Select preferred schedule</option>
                {SCHEDULE_OPTIONS.map((schedule) => (
                  <option key={schedule} value={schedule}>
                    {schedule}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 6: Preferred Nationality */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">6</span>
                <Label htmlFor="preferred_nationality" className="text-sm font-semibold">
                  Preferred Nationality
                </Label>
              </div>
              <select
                id="preferred_nationality"
                value={formData.preferred_nationality}
                onChange={(e) => handleInputChange('preferred_nationality', e.target.value)}
                className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
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

          {/* Field 7: Food Restrictions */}
          <div className="space-y-1.5 mt-4">
            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">7</span>
              <Label htmlFor="food_restrictions" className="text-sm font-semibold">
                Food Restrictions/Preferences
              </Label>
            </div>
            <Textarea
              id="food_restrictions"
              value={formData.food_restrictions}
              onChange={(e) => handleInputChange('food_restrictions', e.target.value)}
              placeholder="e.g., Vegetarian, Halal, No pork, Gluten-free"
              rows={3}
              className="text-sm border-2 border-slate-300"
            />
          </div>
        </div>

        {/* Section 3: Additional Information */}
        <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            Additional Information
          </h3>
          
          {/* Field 8: Additional Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">8</span>
              <Label htmlFor="additional_notes" className="text-sm font-semibold">
                Additional Notes
              </Label>
            </div>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              placeholder="Any other preferences or requirements..."
              rows={3}
              className="text-sm border-2 border-slate-300"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full button-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-10"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save and find my perfect match"}
          </Button>
        </div>
      </form>
    </div>
  );
}
