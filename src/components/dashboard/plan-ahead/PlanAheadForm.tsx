import React, { useEffect, useState } from "react";
import { Lightbulb, MapPin, Calendar, MessageSquare, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const ageRanges = ["18-24", "25-30", "31-40", "41-50", "51+"] as const;
const genderOptions = ["any", "male", "female", "nonbinary"] as const;
const petOptions = ["yes", "no", "nopref"] as const;
const smokeOptions = ["yes", "no", "nopref"] as const;

export default function PlanAheadForm() {
  const [formData, setFormData] = useState({
    currentLocation: "",
    targetLocations: [] as string[],
    moveDate: "",
    ageRange: "",
    genderPref: "any",
    nationality: "",
    languagePref: "",
    dietaryPref: {
      none: false,
      veg: false,
      vegan: false,
      gluten: false,
      kosher: false,
      halal: false,
    },
    occupationPref: {
      student: false,
      professional: false,
      freelancer: false,
      remote: false,
      none: false,
    },
    workSchedulePref: "",
    ethnicityPref: "",
    religionPref: "",
    petPref: "nopref",
    smokePref: "nopref",
    additionalInfo: "",
  });

  const [newLocation, setNewLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 30);
    const defaultDateStr = defaultDate.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, moveDate: defaultDateStr }));
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // eslint-disable-next-line no-alert
      alert(
        "Your preferences have been saved! Our AI is now finding your perfect co-living match."
      );
      setIsSubmitting(false);
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
          AI tip
        </div>
        <p className="mt-1">
          The more details you provide, the better our AI can match you with compatible roommates and living spaces.
        </p>
      </div>

      {/* Location Preferences */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Location preferences</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentLocation">Current location</Label>
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) =>
                setFormData((p) => ({ ...p, currentLocation: e.target.value }))
              }
              placeholder="City or country where you currently live"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetLocation">Target locations (max 5)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="targetLocation"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add cities or countries"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddLocation}
                disabled={formData.targetLocations.length >= 5}
              >
                Add
              </Button>
            </div>
            {formData.targetLocations.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.targetLocations.map((loc, i) => (
                  <Badge key={`${loc}-${i}`} variant="secondary" className="gap-1">
                    {loc}
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(i)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${loc}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="moveDate">Planned move date</Label>
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
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Lifestyle & Schedule */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Lifestyle & schedule</h3>
        </div>

        <div className="space-y-2">
          <Label>Your age range</Label>
          <RadioGroup
            value={formData.ageRange}
            onValueChange={(value) =>
              setFormData((p) => ({ ...p, ageRange: value }))
            }
            className="grid grid-cols-2 gap-2"
          >
            {ageRanges.map((range) => (
              <div key={range} className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem value={range} id={`age-${range}`} />
                <Label htmlFor={`age-${range}`}>{range}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Gender preference for roommate</Label>
          <RadioGroup
            value={formData.genderPref}
            onValueChange={(value) =>
              setFormData((p) => ({ ...p, genderPref: value }))
            }
            className="grid grid-cols-2 gap-2"
          >
            {genderOptions.map((g) => (
              <div key={g} className="flex items-center gap-2 rounded-md border p-2">
                <RadioGroupItem value={g} id={`gender-${g}`} />
                <Label htmlFor={`gender-${g}`}>
                  {g === "any"
                    ? "No preference"
                    : g === "nonbinary"
                    ? "Non-binary"
                    : g.charAt(0).toUpperCase() + g.slice(1)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality preference (optional)</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nationality: e.target.value }))
              }
              placeholder="e.g., American, European, Asian"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="languagePref">Language preference</Label>
            <Input
              id="languagePref"
              value={formData.languagePref}
              onChange={(e) =>
                setFormData((p) => ({ ...p, languagePref: e.target.value }))
              }
              placeholder="e.g., English, Spanish, French"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dietary preferences</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "none", label: "No restrictions" },
              { key: "veg", label: "Vegetarian" },
              { key: "vegan", label: "Vegan" },
              { key: "gluten", label: "Gluten-free" },
              { key: "kosher", label: "Kosher" },
              { key: "halal", label: "Halal" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  checked={formData.dietaryPref[item.key as keyof typeof formData.dietaryPref]}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({
                      ...p,
                      dietaryPref: {
                        ...p.dietaryPref,
                        [item.key]: Boolean(checked),
                      },
                    }))
                  }
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Roommate occupation preference</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "student", label: "Student" },
              { key: "professional", label: "Professional" },
              { key: "freelancer", label: "Freelancer" },
              { key: "remote", label: "Remote worker" },
              { key: "none", label: "No preference" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox
                  checked={formData.occupationPref[item.key as keyof typeof formData.occupationPref]}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({
                      ...p,
                      occupationPref: {
                        ...p.occupationPref,
                        [item.key]: Boolean(checked),
                      },
                    }))
                  }
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workSchedulePref">Work schedule preference for roommate</Label>
          <select
            id="workSchedulePref"
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            value={formData.workSchedulePref}
            onChange={(e) =>
              setFormData((p) => ({ ...p, workSchedulePref: e.target.value }))
            }
            required
          >
            <option value="">Select preferred schedule</option>
            <option value="same">Same as mine</option>
            <option value="9to5">9 AM - 5 PM</option>
            <option value="flexible">Flexible hours</option>
            <option value="nightShift">Night shift</option>
            <option value="shiftWorker">Shift worker</option>
            <option value="student">Student schedule</option>
            <option value="remote">Remote/Freelance</option>
            <option value="none">No preference</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ethnicityPref">Ethnicity preference (optional)</Label>
            <Input
              id="ethnicityPref"
              value={formData.ethnicityPref}
              onChange={(e) =>
                setFormData((p) => ({ ...p, ethnicityPref: e.target.value }))
              }
              placeholder="e.g., Caucasian, Hispanic, Asian"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="religionPref">Religion preference (optional)</Label>
            <Input
              id="religionPref"
              value={formData.religionPref}
              onChange={(e) =>
                setFormData((p) => ({ ...p, religionPref: e.target.value }))
              }
              placeholder="e.g., Christian, Muslim, Jewish"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pet preference</Label>
            <RadioGroup
              value={formData.petPref}
              onValueChange={(value) =>
                setFormData((p) => ({ ...p, petPref: value }))
              }
              className="grid grid-cols-2 gap-2"
            >
              {petOptions.map((opt) => (
                <div key={opt} className="flex items-center gap-2 rounded-md border p-2">
                  <RadioGroupItem value={opt} id={`pet-${opt}`} />
                  <Label htmlFor={`pet-${opt}`}>
                    {opt === "yes" ? "Pets allowed" : opt === "no" ? "No pets" : "No preference"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Smoking preference</Label>
            <RadioGroup
              value={formData.smokePref}
              onValueChange={(value) =>
                setFormData((p) => ({ ...p, smokePref: value }))
              }
              className="grid grid-cols-2 gap-2"
            >
              {smokeOptions.map((opt) => (
                <div key={opt} className="flex items-center gap-2 rounded-md border p-2">
                  <RadioGroupItem value={opt} id={`smoke-${opt}`} />
                  <Label htmlFor={`smoke-${opt}`}>
                    {opt === "yes" ? "Smoking allowed" : opt === "no" ? "Non-smoking only" : "No preference"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </section>

      <Separator />

      {/* Additional Preferences */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Additional preferences</h3>
        </div>
        <Label htmlFor="additionalInfo">Anything else we should know?</Label>
        <Textarea
          id="additionalInfo"
          rows={4}
          value={formData.additionalInfo}
          onChange={(e) =>
            setFormData((p) => ({ ...p, additionalInfo: e.target.value }))
          }
          placeholder="Special requirements, additional preferences, or other helpful information..."
        />
      </section>

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save and find my perfect match"}
        </Button>
      </div>
    </form>
  );
}
