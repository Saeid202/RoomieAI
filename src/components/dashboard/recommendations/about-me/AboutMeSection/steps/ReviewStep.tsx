import { useFormContext } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Briefcase, Home, Heart, Utensils } from "lucide-react";

// Helper function to format display values
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatDisplayValue = (value: any, fieldName: string) => {
  if (!value && value !== false && value !== 0) return "Not specified";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.join(", ");
  }

  if (fieldName === "gender") {
    const genderMap: { [key: string]: string } = {
      "male": "Male",
      "female": "Female",
      "lesbian": "Lesbian",
      "gay": "Gay",
      "bisexual": "Bisexual",
      "transgender": "Transgender",
      "non-binary": "Non-binary",
      "prefer-not-to-say": "Prefer not to say"
    };
    return genderMap[value] || value;
  }

  if (fieldName === "workLocation") {
    const workLocationMap: { [key: string]: string } = {
      "remote": "Work from home",
      "office": "Go to office",
      "hybrid": "Hybrid (both)"
    };
    return workLocationMap[value] || value;
  }

  if (fieldName === "workSchedule") {
    const workScheduleMap: { [key: string]: string } = {
      "dayShift": "Day shift",
      "afternoonShift": "Afternoon shift",
      "overnightShift": "Overnight shift"
    };
    return workScheduleMap[value] || value;
  }

  if (fieldName === "diet") {
    const dietMap: { [key: string]: string } = {
      "vegetarian": "Vegetarian",
      "halal": "Halal only",
      "kosher": "Kosher only",
      "noPreference": "No restrictions",
      "other": "Other"
    };
    return dietMap[value] || value;
  }

  if (fieldName === "housingType") {
    const housingMap: { [key: string]: string } = {
      "apartment": "Apartment",
      "house": "House"
    };
    return housingMap[value] || value;
  }

  if (fieldName === "livingSpace") {
    const livingSpaceMap: { [key: string]: string } = {
      "privateRoom": "Private Room",
      "sharedRoom": "Shared Room",
      "entirePlace": "Entire Place"
    };
    return livingSpaceMap[value] || value;
  }

  if (typeof value === "string") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  return value.toString();
};

export function ReviewStep() {
  const form = useFormContext<ProfileFormValues>();
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-green-600 mb-2">Ready to Complete Your Profile! 🎉</h3>
        <p className="text-muted-foreground">Review your information before saving</p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-blue-500" />
              <h4 className="text-lg font-semibold">Personal Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="font-medium">{formatDisplayValue(formData.fullName, "fullName")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p className="font-medium">{formatDisplayValue(formData.age, "age")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="font-medium">{formatDisplayValue(formData.gender, "gender")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Background Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-green-500" />
              <h4 className="text-lg font-semibold">Contact & Background</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{formatDisplayValue(formData.email, "email")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="font-medium">{formatDisplayValue(formData.phoneNumber, "phoneNumber")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                <p className="font-medium">{formatDisplayValue(formData.nationality, "nationality")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Language</label>
                <p className="font-medium">{formatDisplayValue(formData.language, "language")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ethnicity</label>
                <p className="font-medium">{formatDisplayValue(formData.ethnicity, "ethnicity")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Religion</label>
                <p className="font-medium">{formatDisplayValue(formData.religion, "religion")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work & Lifestyle Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-5 w-5 text-purple-500" />
              <h4 className="text-lg font-semibold">Work & Lifestyle</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                <p className="font-medium">{formatDisplayValue(formData.occupation, "occupation")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Work Location</label>
                <p className="font-medium">{formatDisplayValue(formData.workLocation, "workLocation")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Work Schedule</label>
                <p className="font-medium">{formatDisplayValue(formData.workSchedule, "workSchedule")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dietary Preference</label>
                <p className="font-medium">
                  {formatDisplayValue(formData.diet, "diet")}
                  {formData.diet === "other" && formData.dietOther && ` - ${formData.dietOther}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Housing Preferences Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="h-5 w-5 text-orange-500" />
              <h4 className="text-lg font-semibold">Housing Preferences</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Locations</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.preferredLocation?.map((location, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Housing Type</label>
                <p className="font-medium">{formatDisplayValue(formData.housingType, "housingType")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Living Space</label>
                <p className="font-medium">{formatDisplayValue(formData.livingSpace, "livingSpace")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                <p className="font-medium">${formData.budgetRange?.[0]} - ${formData.budgetRange?.[1]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle Habits Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <h4 className="text-lg font-semibold">Lifestyle Habits</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Smoking</label>
                <p className="font-medium">{formatDisplayValue(formData.smoking, "smoking")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Comfortable with Smokers</label>
                <p className="font-medium">{formatDisplayValue(formData.livesWithSmokers, "livesWithSmokers")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Has Pets</label>
                <p className="font-medium">{formatDisplayValue(formData.hasPets, "hasPets")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Profile Visibility</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.profileVisibility?.map((visibility, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {visibility}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hobbies & Interests Card */}
        {formData.hobbies && formData.hobbies.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="h-5 w-5 text-indigo-500" />
                <h4 className="text-lg font-semibold">Hobbies & Interests</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.hobbies.map((hobby, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">i</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Ready to Save?</h4>
            <p className="text-blue-700 text-sm">
              Your profile looks great! Click the "Save Profile" button below to complete your registration.
              You can always edit this information later from your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
