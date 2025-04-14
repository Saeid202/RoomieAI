
import { ProfileFormValues } from "@/types/profile";

interface ProfileCompletionChecklistProps {
  profileData?: Partial<ProfileFormValues> | null;
}

export function ProfileCompletionChecklist({ profileData }: ProfileCompletionChecklistProps) {
  const isProfileComplete = profileData && profileData.fullName && profileData.age;
  const hasRoommatePreferences = profileData && 
    ((profileData.importantRoommateTraits && profileData.importantRoommateTraits.length > 0) || 
     profileData.roommateGenderPreference || 
     profileData.roommateAgePreference);

  return (
    <div className="max-w-md mx-auto bg-accent/20 rounded-lg p-4 mt-4">
      <h4 className="font-medium mb-2">Before we search:</h4>
      <ul className="text-sm text-left space-y-2">
        <li className="flex items-start">
          <span className={`mr-2 ${isProfileComplete ? 'text-green-500' : 'text-amber-500'}`}>
            {isProfileComplete ? '✓' : '○'}
          </span>
          <span>Fill out your <strong>About Me</strong> information</span>
        </li>
        <li className="flex items-start">
          <span className={`mr-2 ${hasRoommatePreferences ? 'text-green-500' : 'text-amber-500'}`}>
            {hasRoommatePreferences ? '✓' : '○'}
          </span>
          <span>Complete your <strong>Ideal Roommate</strong> preferences</span>
        </li>
        <li className="flex items-start">
          <span className="mr-2">✓</span>
          <span>Make sure to <strong>Save</strong> all your changes</span>
        </li>
      </ul>
    </div>
  );
}
