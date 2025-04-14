
import { ProfileFormValues } from "@/types/profile";

export interface RoommateMatch {
  id: string;
  name: string;
  age: string;
  occupation: string;
  compatibilityScore: number;
  compatibilityBreakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    schedule: number;
    interests: number;
    cleanliness: number;
  };
  [key: string]: any;
}

export interface PropertyMatch {
  id: string;
  title: string;
  location: string;
  price: number;
  compatibilityScore: number;
  compatibilityBreakdown: {
    budget: number;
    location: number;
    lifestyle: number;
    amenities: number;
  };
  [key: string]: any;
}

export interface RoommateProfilePageProps {
  profileData: Partial<ProfileFormValues> | null;
  roommates: RoommateMatch[];
  properties: PropertyMatch[];
  selectedMatch: RoommateMatch | PropertyMatch | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleViewDetails: (match: RoommateMatch | PropertyMatch) => void;
  handleCloseDetails: () => void;
  findMatches: () => Promise<void>;
  handleSaveProfile: (formData: ProfileFormValues) => Promise<void>;
  handleRefreshProfile: () => Promise<void>;
  user: any;
}
