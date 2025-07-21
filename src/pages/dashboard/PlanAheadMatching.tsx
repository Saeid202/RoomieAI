import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { planAheadService } from "@/services/planAheadService";
import { planAheadMatchingService } from "@/services/planAheadMatchingService";
import type { PlanAheadFormData } from "@/types/planAhead";
import { useAuth } from "@/hooks/useAuth";

export default function PlanAheadMatchingPage() {
  const [formData, setFormData] = useState({
    // Move Timeline
    plannedMoveDate: null as Date | null,
    moveFlexibility: "",
    advanceNotice: "",
    
    // Move Details
    reasonForMove: "",
    customReason: "",
    currentLocation: "",
    targetLocations: [""],
    
    // Housing Preferences
    housingType: "",
    budgetRange: { min: "", max: "" },
    budgetFlexibility: "",
    roomType: "",
    
    // Lifestyle & Preferences
    workSchedule: "",
    schoolSchedule: "",
    lifestyle: "",
    smoker: "",
    pets: "",
    
    // Roommate Preferences
    roommateCount: "",
    genderPreference: "",
    ageRangePreference: { min: "", max: "" },
    importantTraits: [] as string[],
    
    // Special Requirements
    specialNeeds: "",
    transportationNeeds: "",
    additionalRequirements: "",
    
    // Communication Preferences
    contactFrequency: "",
    preferredContact: "",
    
    // Profile Settings
    profileVisibility: "",
    shareTimeline: false,
  });

  const { toast } = useToast();

  const moveReasons = [
    "Starting college/university",
    "Starting graduate school", 
    "New job/work relocation",
    "Internship",
    "Personal relocation",
    "Other"
  ];

  const handleLocationAdd = () => {
    setFormData(prev => ({
      ...prev,
      targetLocations: [...prev.targetLocations, ""]
    }));
  };

  const handleLocationRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetLocations: prev.targetLocations.filter((_, i) => i !== index)
    }));
  };

  const handleLocationChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      targetLocations: prev.targetLocations.map((loc, i) => i === index ? value : loc)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.plannedMoveDate) {
      toast({
        title: "Missing Information",
        description: "Please select your planned move date",
        variant: "destructive"
      });
      return;
    }

    if (!formData.reasonForMove) {
      toast({
        title: "Missing Information", 
        description: "Please select your reason for moving",
        variant: "destructive"
      });
      return;
    }

    // TODO: Submit form data
    toast({
      title: "Plan Ahead Profile Created!",
      description: "We'll start matching you with others who have similar timelines and preferences.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Plan Ahead Smart Move In Matching</h1>
        <p className="text-muted-foreground mt-1">
          Plan your future move and connect with others who share your timeline and destination
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Move Timeline Section */}
        <Card>
          <CardHeader>
            <CardTitle>Move Timeline</CardTitle>
            <CardDescription>When are you planning to move?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Planned Move-In Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.plannedMoveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.plannedMoveDate ? (
                      format(formData.plannedMoveDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.plannedMoveDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, plannedMoveDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date Flexibility</Label>
              <Select value={formData.moveFlexibility} onValueChange={(value) => setFormData(prev => ({ ...prev, moveFlexibility: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How flexible are you with your move date?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Must be exact date</SelectItem>
                  <SelectItem value="week">Within a week</SelectItem>
                  <SelectItem value="month">Within a month</SelectItem>
                  <SelectItem value="flexible">Very flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>How much advance notice do you need?</Label>
              <Select value={formData.advanceNotice} onValueChange={(value) => setFormData(prev => ({ ...prev, advanceNotice: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select advance notice needed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 month</SelectItem>
                  <SelectItem value="2months">2 months</SelectItem>
                  <SelectItem value="3months">3 months</SelectItem>
                  <SelectItem value="6months">6+ months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Move Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Move Details</CardTitle>
            <CardDescription>Tell us about your move</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Reason for Move *</Label>
              <Select value={formData.reasonForMove} onValueChange={(value) => setFormData(prev => ({ ...prev, reasonForMove: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Why are you moving?" />
                </SelectTrigger>
                <SelectContent>
                  {moveReasons.map(reason => (
                    <SelectItem key={reason} value={reason.toLowerCase().replace(/[^a-z0-9]/g, '')}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.reasonForMove === 'other' && (
              <div className="space-y-2">
                <Label>Please specify</Label>
                <Input
                  value={formData.customReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
                  placeholder="Describe your reason for moving"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Current Location</Label>
              <Input
                value={formData.currentLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                placeholder="City, State/Country where you currently live"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Locations</Label>
              <p className="text-sm text-muted-foreground">Where are you looking to move? (Add multiple if flexible)</p>
              {formData.targetLocations.map((location, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={location}
                    onChange={(e) => handleLocationChange(index, e.target.value)}
                    placeholder="City, State/Country"
                    className="flex-1"
                  />
                  {formData.targetLocations.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLocationRemove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLocationAdd}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Housing Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Housing Preferences</CardTitle>
            <CardDescription>What type of housing are you looking for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Housing Type</Label>
              <Select value={formData.housingType} onValueChange={(value) => setFormData(prev => ({ ...prev, housingType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="dorm">Dorm/Student Housing</SelectItem>
                  <SelectItem value="shared">Shared Housing</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={formData.roomType} onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private room</SelectItem>
                  <SelectItem value="shared">Shared room</SelectItem>
                  <SelectItem value="studio">Studio/Own place</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget Range (Monthly)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={formData.budgetRange.min}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, min: e.target.value }
                  }))}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={formData.budgetRange.max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    budgetRange: { ...prev.budgetRange, max: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Budget Flexibility</Label>
              <Select value={formData.budgetFlexibility} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetFlexibility: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How flexible is your budget?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Must stay within budget</SelectItem>
                  <SelectItem value="slight">10-15% flexibility</SelectItem>
                  <SelectItem value="moderate">20-30% flexibility</SelectItem>
                  <SelectItem value="flexible">Very flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle Section */}
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle & Schedule</CardTitle>
            <CardDescription>Help us match you with compatible roommates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Work Schedule (if applicable)</Label>
              <Select value={formData.workSchedule} onValueChange={(value) => setFormData(prev => ({ ...prev, workSchedule: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9to5">9-5 weekdays</SelectItem>
                  <SelectItem value="flexible">Flexible/remote</SelectItem>
                  <SelectItem value="evenings">Evenings</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="none">Not working</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>School Schedule (if applicable)</Label>
              <Select value={formData.schoolSchedule} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolSchedule: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full-time student</SelectItem>
                  <SelectItem value="parttime">Part-time student</SelectItem>
                  <SelectItem value="graduate">Graduate student</SelectItem>
                  <SelectItem value="online">Online student</SelectItem>
                  <SelectItem value="none">Not in school</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Lifestyle Preferences</Label>
              <RadioGroup value={formData.smoker} onValueChange={(value) => setFormData(prev => ({ ...prev, smoker: value }))}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="smoker-yes" />
                  <Label htmlFor="smoker-yes">I smoke</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="smoker-no" />
                  <Label htmlFor="smoker-no">I don't smoke</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasionally" id="smoker-occasionally" />
                  <Label htmlFor="smoker-occasionally">I smoke occasionally</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Pets</Label>
              <RadioGroup value={formData.pets} onValueChange={(value) => setFormData(prev => ({ ...prev, pets: value }))}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="have" id="pets-have" />
                  <Label htmlFor="pets-have">I have pets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="pets-none" />
                  <Label htmlFor="pets-none">I don't have pets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planning" id="pets-planning" />
                  <Label htmlFor="pets-planning">I'm planning to get pets</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Roommate Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Roommate Preferences</CardTitle>
            <CardDescription>What are you looking for in roommates?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Preferred Number of Roommates</Label>
              <Select value={formData.roommateCount} onValueChange={(value) => setFormData(prev => ({ ...prev, roommateCount: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How many roommates?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None (live alone)</SelectItem>
                  <SelectItem value="1">1 roommate</SelectItem>
                  <SelectItem value="2">2 roommates</SelectItem>
                  <SelectItem value="3">3 roommates</SelectItem>
                  <SelectItem value="4+">4+ roommates</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender Preference</Label>
              <Select value={formData.genderPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, genderPreference: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any preference?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any gender</SelectItem>
                  <SelectItem value="same">Same gender</SelectItem>
                  <SelectItem value="female">Female roommates</SelectItem>
                  <SelectItem value="male">Male roommates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Age Range</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min age"
                  value={formData.ageRangePreference.min}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ageRangePreference: { ...prev.ageRangePreference, min: e.target.value }
                  }))}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max age"
                  value={formData.ageRangePreference.max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    ageRangePreference: { ...prev.ageRangePreference, max: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Requirements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Special Requirements</CardTitle>
            <CardDescription>Any special needs or requirements for your move?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Accessibility or Special Needs</Label>
              <Textarea
                value={formData.specialNeeds}
                onChange={(e) => setFormData(prev => ({ ...prev, specialNeeds: e.target.value }))}
                placeholder="Any accessibility requirements, medical needs, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Transportation Needs</Label>
              <Textarea
                value={formData.transportationNeeds}
                onChange={(e) => setFormData(prev => ({ ...prev, transportationNeeds: e.target.value }))}
                placeholder="Proximity to public transport, parking needs, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Requirements</Label>
              <Textarea
                value={formData.additionalRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                placeholder="Any other important requirements or preferences"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>How would you like to connect with potential matches?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Contact Frequency</Label>
              <Select value={formData.contactFrequency} onValueChange={(value) => setFormData(prev => ({ ...prev, contactFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How often should we contact you about matches?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily updates</SelectItem>
                  <SelectItem value="weekly">Weekly summaries</SelectItem>
                  <SelectItem value="monthly">Monthly updates</SelectItem>
                  <SelectItem value="asneeded">Only when there's a good match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Contact Method</Label>
              <Select value={formData.preferredContact} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContact: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="How should we contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Through platform messaging</SelectItem>
                  <SelectItem value="email">Email notifications</SelectItem>
                  <SelectItem value="both">Both platform and email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shareTimeline"
                checked={formData.shareTimeline}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shareTimeline: checked as boolean }))}
              />
              <Label htmlFor="shareTimeline">
                Share my move timeline with potential matches
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Create Plan Ahead Profile
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Your profile will be visible to other users planning moves with similar timelines and locations.
              You can update your preferences anytime before your move date.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}