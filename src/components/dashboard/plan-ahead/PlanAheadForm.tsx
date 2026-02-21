import React, { useEffect, useState } from "react";
import { MapPin, Calendar, MessageSquare, Save, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { savePlanAheadProfile, getPlanAheadProfile } from "@/services/planAheadService";

// Removed unused constants for simplified form

export default function PlanAheadForm() {
  const [formData, setFormData] = useState({
    currentLocation: "",
    targetLocations: [] as string[],
    moveDate: "",
    propertyType: "",
    lookingForRoommate: "",
    roommateGenderPref: "",
    languagePref: "",
    additionalInfo: "",
  });

  const [newLocation, setNewLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 30);
    const defaultDateStr = defaultDate.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, moveDate: defaultDateStr }));
  }, []);

  // Load existing profile data when user is available
  useEffect(() => {
    if (!user) return;

    const loadExistingProfile = async () => {
      try {
        const existingProfile = await getPlanAheadProfile(user.id);
        if (existingProfile) {
          setFormData(existingProfile);
          toast({
            title: "Profile loaded",
            description: "Your existing preferences have been loaded.",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("Failed to load existing profile:", error);
        // Don't show error toast for this, as it's expected for new users
      }
    };

    loadExistingProfile();
  }, [user, toast]);

  const handleAddLocation = () => {
    const value = newLocation.trim();
    if (!value) return;
    if (formData.targetLocations.length >= 5) return;
    if (formData.targetLocations.includes(value)) return;

    setFormData((prev) => ({
      ...prev,
      targetLocations: [...prev.targetLocations, value],
    }));
    setNewLocation("");
  };

  const handleRemoveLocation = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.targetLocations];
      updated.splice(index, 1);
      return { ...prev, targetLocations: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please sign in",
        description: "Log in to save your plan ahead profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await savePlanAheadProfile(user.id, {
        currentLocation: formData.currentLocation,
        targetLocations: formData.targetLocations,
        moveDate: formData.moveDate,
        propertyType: formData.propertyType,
        lookingForRoommate: formData.lookingForRoommate,
        roommateGenderPref: formData.roommateGenderPref,
        languagePref: formData.languagePref,
        additionalInfo: formData.additionalInfo,
      });

      toast({
        title: "Saved",
        description: "Preferences saved. We’ll start finding matches.",
      });
    } catch (error) {
      console.error("Failed to save plan ahead profile", error);
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
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Ultra-Compact Organized Form */}
      <div className="space-y-3">
                {/* Section 1: Location Information */}
                <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    Location Information
                  </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Field 1: Current Location */}
            <div className="space-y-1.5">
        <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
                <Label htmlFor="currentLocation" className="text-sm font-semibold">Current location</Label>
        </div>
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) =>
                setFormData((p) => ({ ...p, currentLocation: e.target.value }))
              }
                placeholder="City or country"
              required
                className="h-9 text-sm border-2 border-slate-300"
            />
          </div>

            {/* Field 2: Target Locations */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
                <Label htmlFor="targetLocation" className="text-sm font-semibold">Target locations (max 5)</Label>
              </div>
              <div className="flex items-center gap-2">
              <Input
                id="targetLocation"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add cities"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
                  className="h-9 text-sm border-2 border-slate-300 flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddLocation}
                disabled={formData.targetLocations.length >= 5}
                  className="h-9 px-3 text-xs font-semibold shrink-0"
              >
                Add
              </Button>
            </div>
            {formData.targetLocations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.targetLocations.map((loc, i) => (
                    <Badge key={`${loc}-${i}`} variant="secondary" className="gap-1 text-xs px-2 py-1 font-medium">
                    {loc}
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(i)}
                      className="ml-1 text-muted-foreground hover:text-foreground font-bold"
                      aria-label={`Remove ${loc}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

            {/* Field 3: Planned Move Date */}
          <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
                <Label htmlFor="moveDate" className="text-sm font-semibold">Planned move date</Label>
              </div>
            <Input
              type="date"
              id="moveDate"
              value={formData.moveDate}
              onChange={(e) =>
                setFormData((p) => ({ ...p, moveDate: e.target.value }))
              }
              min={new Date(new Date().setDate(new Date().getDate() + 1))
                .toISOString()
                .split("T")[0]}
              required
                className="h-9 text-sm border-2 border-slate-300"
            />
          </div>
        </div>
        </div>

                {/* Section 2: Property & Living Preferences */}
                <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    Property & Living Preferences
                  </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Field 4: Property Type */}
        <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">4</span>
                <Label htmlFor="propertyType" className="text-sm font-semibold">Property type</Label>
              </div>
              <select
                id="propertyType"
                className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
                value={formData.propertyType}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, propertyType: e.target.value }))
                }
                required
              >
                <option value="">Select property type</option>
                <option value="studio">Studio Condominium</option>
                <option value="one-bed-room-share-cando">Shared One-Bedroom Condominium</option>
                <option value="two-bed-room-share-cando">Shared Two-Bedroom Condominium</option>
                <option value="entire-one-bed-room-cando">Entire One-Bedroom Condominium</option>
                <option value="entire-two-bed-room-cando">Entire Two-Bedroom Condominium</option>
                <option value="room-from-house">Private Room in a House</option>
                <option value="entire-house">Entire House</option>
                <option value="entire-basement">Entire Basement Unit</option>
                <option value="room-from-basement">Private Room in a Basement</option>
                <option value="shared-room">Shared Room (two occupants per room)</option>
                <option value="no-preference">No preference</option>
              </select>
        </div>

            {/* Field 5: Looking for Roommate */}
        <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">5</span>
                <Label className="text-sm font-semibold">Looking for roommate?</Label>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lookingForRoommate"
                    value="yes"
                    checked={formData.lookingForRoommate === "yes"}
              onChange={(e) =>
                      setFormData((p) => ({ ...p, lookingForRoommate: e.target.value }))
                    }
                    className="w-4 h-4 shrink-0"
                  />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lookingForRoommate"
                    value="no"
                    checked={formData.lookingForRoommate === "no"}
              onChange={(e) =>
                      setFormData((p) => ({ ...p, lookingForRoommate: e.target.value }))
                    }
                    className="rounded border-2-gray-300"
                  />
                  <span className="text-sm font-medium">No</span>
              </label>
          </div>
        </div>
          </div>
        </div>

                {/* Section 3: Roommate Preferences (Conditional) */}
                {formData.lookingForRoommate === "yes" && (
                  <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      Roommate Preferences
                    </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Field 6: Gender Preference */}
          <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">6</span>
                  <Label className="text-sm font-semibold">Gender preference</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded border-2 border-slate-300 bg-white hover:border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="roommateGenderPref"
                      value="any"
                      checked={formData.roommateGenderPref === "any"}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, roommateGenderPref: e.target.value }))
                      }
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-medium">Any</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded border-2 border-slate-300 bg-white hover:border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="roommateGenderPref"
                      value="male"
                      checked={formData.roommateGenderPref === "male"}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, roommateGenderPref: e.target.value }))
                      }
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-medium">Male</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded border-2 border-slate-300 bg-white hover:border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="roommateGenderPref"
                      value="female"
                      checked={formData.roommateGenderPref === "female"}
              onChange={(e) =>
                        setFormData((p) => ({ ...p, roommateGenderPref: e.target.value }))
                      }
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-medium">Female</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded border-2 border-slate-300 bg-white hover:border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="roommateGenderPref"
                      value="nonbinary"
                      checked={formData.roommateGenderPref === "nonbinary"}
              onChange={(e) =>
                        setFormData((p) => ({ ...p, roommateGenderPref: e.target.value }))
              }
                      className="w-4 h-4 shrink-0"
            />
                    <span className="text-sm font-medium">Non-binary</span>
                  </label>
          </div>
        </div>

          {/* Field 7: Language Preference */}
          <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">7</span>
                  <Label htmlFor="languagePref" className="text-sm font-semibold">Language preference</Label>
                </div>
                <select
                  id="languagePref"
                  className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-9"
                  value={formData.languagePref}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, languagePref: e.target.value }))
                  }
                  required={formData.lookingForRoommate === "yes"}
                >
                  <option value="">Select language</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="italian">Italian</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                  <option value="korean">Korean</option>
                  <option value="arabic">Arabic</option>
                  <option value="hindi">Hindi</option>
                  <option value="russian">Russian</option>
                  <option value="dutch">Dutch</option>
                  <option value="swedish">Swedish</option>
                  <option value="norwegian">Norwegian</option>
                  <option value="danish">Danish</option>
                  <option value="finnish">Finnish</option>
                  <option value="polish">Polish</option>
                  <option value="czech">Czech</option>
                  <option value="hungarian">Hungarian</option>
                  <option value="romanian">Romanian</option>
                  <option value="bulgarian">Bulgarian</option>
                  <option value="greek">Greek</option>
                  <option value="turkish">Turkish</option>
                  <option value="hebrew">Hebrew</option>
                  <option value="thai">Thai</option>
                  <option value="vietnamese">Vietnamese</option>
                  <option value="indonesian">Indonesian</option>
                  <option value="malay">Malay</option>
                  <option value="tagalog">Tagalog</option>
                  <option value="other">Other</option>
                </select>
              </div>
                </div>
          </div>
        )}
        </div>

      {/* Section 4: Additional Information */}
      <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-400">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-purple-600" />
          Additional Information
        </h3>
        
        <div className="space-y-1.5">
        <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">8</span>
            <Label htmlFor="additionalInfo" className="text-sm font-semibold">Anything else we should know?</Label>
        </div>
        <Textarea
          id="additionalInfo"
            rows={3}
          value={formData.additionalInfo}
          onChange={(e) =>
            setFormData((p) => ({ ...p, additionalInfo: e.target.value }))
          }
          placeholder="Special requirements, additional preferences, or other helpful information..."
            className="ml-7 text-sm"
        />
        </div>
      </div>

      <div className="pt-2">
          <Button type="submit" className="w-full button-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save and find my perfect match"}
        </Button>
      </div>
    </form>
  );
}


