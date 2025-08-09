export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Both: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_ahead_matches: {
        Row: {
          compatibility_score: number
          created_at: string | null
          id: string
          match_factors: Json | null
          matched_profile_id: string
          matched_user_action: string | null
          matched_user_id: string
          profile_id: string
          status: string | null
          updated_at: string | null
          user_action: string | null
          user_id: string
        }
        Insert: {
          compatibility_score: number
          created_at?: string | null
          id?: string
          match_factors?: Json | null
          matched_profile_id: string
          matched_user_action?: string | null
          matched_user_id: string
          profile_id: string
          status?: string | null
          updated_at?: string | null
          user_action?: string | null
          user_id: string
        }
        Update: {
          compatibility_score?: number
          created_at?: string | null
          id?: string
          match_factors?: Json | null
          matched_profile_id?: string
          matched_user_action?: string | null
          matched_user_id?: string
          profile_id?: string
          status?: string | null
          updated_at?: string | null
          user_action?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_ahead_matches_matched_profile_id_fkey"
            columns: ["matched_profile_id"]
            isOneToOne: false
            referencedRelation: "plan_ahead_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_ahead_matches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "plan_ahead_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_ahead_profiles: {
        Row: {
          accessibility_needs: string[] | null
          additional_notes: string | null
          age_range_preference: number[] | null
          auto_match_enabled: boolean | null
          budget_range: number[]
          cleanliness_level: number | null
          communication_frequency: string | null
          created_at: string | null
          current_city: string | null
          current_country: string | null
          current_state: string | null
          daily_schedule: string | null
          flexibility_weeks: number | null
          flexible_move_date: boolean | null
          gender_preference: string[] | null
          guest_policy: string | null
          housing_search_status:
            | Database["public"]["Enums"]["housing_search_status"]
            | null
          id: string
          is_active: boolean | null
          lease_duration_preference: string | null
          lifestyle_compatibility: string[] | null
          looking_for_roommate: boolean | null
          match_notification_preferences: string[] | null
          max_distance_from_target: number | null
          max_roommates: number | null
          move_reason: string | null
          noise_tolerance: string | null
          pet_preferences: string | null
          pet_situation: string | null
          planned_move_date: string
          preferred_housing_types: string[]
          preferred_living_arrangements: string[]
          prior_roommate_experience: string | null
          profile_completion_percentage: number | null
          profile_visibility: string | null
          room_type_preference: string | null
          school_situation: string | null
          shared_interests: string[] | null
          smoking_preference: string | null
          social_level: string | null
          special_requirements: string[] | null
          substance_policies: string[] | null
          target_cities: string[]
          target_states: string[]
          timeline_status:
            | Database["public"]["Enums"]["move_timeline_status"]
            | null
          updated_at: string | null
          user_id: string
          willing_to_relocate_anywhere: boolean | null
          work_situation: string | null
        }
        Insert: {
          accessibility_needs?: string[] | null
          additional_notes?: string | null
          age_range_preference?: number[] | null
          auto_match_enabled?: boolean | null
          budget_range: number[]
          cleanliness_level?: number | null
          communication_frequency?: string | null
          created_at?: string | null
          current_city?: string | null
          current_country?: string | null
          current_state?: string | null
          daily_schedule?: string | null
          flexibility_weeks?: number | null
          flexible_move_date?: boolean | null
          gender_preference?: string[] | null
          guest_policy?: string | null
          housing_search_status?:
            | Database["public"]["Enums"]["housing_search_status"]
            | null
          id?: string
          is_active?: boolean | null
          lease_duration_preference?: string | null
          lifestyle_compatibility?: string[] | null
          looking_for_roommate?: boolean | null
          match_notification_preferences?: string[] | null
          max_distance_from_target?: number | null
          max_roommates?: number | null
          move_reason?: string | null
          noise_tolerance?: string | null
          pet_preferences?: string | null
          pet_situation?: string | null
          planned_move_date: string
          preferred_housing_types: string[]
          preferred_living_arrangements: string[]
          prior_roommate_experience?: string | null
          profile_completion_percentage?: number | null
          profile_visibility?: string | null
          room_type_preference?: string | null
          school_situation?: string | null
          shared_interests?: string[] | null
          smoking_preference?: string | null
          social_level?: string | null
          special_requirements?: string[] | null
          substance_policies?: string[] | null
          target_cities: string[]
          target_states: string[]
          timeline_status?:
            | Database["public"]["Enums"]["move_timeline_status"]
            | null
          updated_at?: string | null
          user_id: string
          willing_to_relocate_anywhere?: boolean | null
          work_situation?: string | null
        }
        Update: {
          accessibility_needs?: string[] | null
          additional_notes?: string | null
          age_range_preference?: number[] | null
          auto_match_enabled?: boolean | null
          budget_range?: number[]
          cleanliness_level?: number | null
          communication_frequency?: string | null
          created_at?: string | null
          current_city?: string | null
          current_country?: string | null
          current_state?: string | null
          daily_schedule?: string | null
          flexibility_weeks?: number | null
          flexible_move_date?: boolean | null
          gender_preference?: string[] | null
          guest_policy?: string | null
          housing_search_status?:
            | Database["public"]["Enums"]["housing_search_status"]
            | null
          id?: string
          is_active?: boolean | null
          lease_duration_preference?: string | null
          lifestyle_compatibility?: string[] | null
          looking_for_roommate?: boolean | null
          match_notification_preferences?: string[] | null
          max_distance_from_target?: number | null
          max_roommates?: number | null
          move_reason?: string | null
          noise_tolerance?: string | null
          pet_preferences?: string | null
          pet_situation?: string | null
          planned_move_date?: string
          preferred_housing_types?: string[]
          preferred_living_arrangements?: string[]
          prior_roommate_experience?: string | null
          profile_completion_percentage?: number | null
          profile_visibility?: string | null
          room_type_preference?: string | null
          school_situation?: string | null
          shared_interests?: string[] | null
          smoking_preference?: string | null
          social_level?: string | null
          special_requirements?: string[] | null
          substance_policies?: string[] | null
          target_cities?: string[]
          target_states?: string[]
          timeline_status?:
            | Database["public"]["Enums"]["move_timeline_status"]
            | null
          updated_at?: string | null
          user_id?: string
          willing_to_relocate_anywhere?: boolean | null
          work_situation?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          telegram_id: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          telegram_id?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          telegram_id?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          available_date: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          description: string | null
          furnished: boolean | null
          id: string
          images: string[] | null
          lease_duration: string | null
          listing_title: string
          monthly_rent: number
          nearby_amenities: string[] | null
          neighborhood: string | null
          parking: string | null
          pet_policy: string | null
          property_type: string
          public_transport_access: string | null
          roommate_preference: string | null
          security_deposit: number | null
          special_instructions: string | null
          square_footage: number | null
          state: string | null
          updated_at: string | null
          user_id: string
          utilities_included: string[] | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string
          images?: string[] | null
          lease_duration?: string | null
          listing_title: string
          monthly_rent: number
          nearby_amenities?: string[] | null
          neighborhood?: string | null
          parking?: string | null
          pet_policy?: string | null
          property_type: string
          public_transport_access?: string | null
          roommate_preference?: string | null
          security_deposit?: number | null
          special_instructions?: string | null
          square_footage?: number | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          utilities_included?: string[] | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string
          images?: string[] | null
          lease_duration?: string | null
          listing_title?: string
          monthly_rent?: number
          nearby_amenities?: string[] | null
          neighborhood?: string | null
          parking?: string | null
          pet_policy?: string | null
          property_type?: string
          public_transport_access?: string | null
          roommate_preference?: string | null
          security_deposit?: number | null
          special_instructions?: string | null
          square_footage?: number | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          utilities_included?: string[] | null
          zip_code?: string | null
        }
        Relationships: []
      }
      roommate: {
        Row: {
          age: number | null
          age_range_preference: number[] | null
          age_range_preference_importance: string | null
          budget_range: number[] | null
          created_at: string
          diet: string | null
          diet_other: string | null
          dietary_other: string | null
          dietary_preferences: string | null
          dietary_preferences_importance: string | null
          email: string | null
          ethnicity: string | null
          ethnicity_other: string | null
          ethnicity_preference: string | null
          ethnicity_preference_importance: string | null
          full_name: string | null
          gender: string | null
          gender_preference: string[] | null
          gender_preference_importance: string | null
          has_pets: boolean | null
          hobbies: string[] | null
          housing_preference: string[] | null
          housing_preference_importance: string | null
          housing_type: string | null
          id: string
          important_roommate_traits: string[] | null
          language: string | null
          language_preference: string | null
          language_preference_importance: string | null
          language_specific: string | null
          linkedin_profile: string | null
          lives_with_smokers: boolean | null
          living_space: string | null
          move_in_date_end: string | null
          move_in_date_start: string | null
          nationality: string | null
          nationality_custom: string | null
          nationality_preference: string | null
          nationality_preference_importance: string | null
          occupation: string | null
          occupation_preference: boolean | null
          occupation_preference_importance: string | null
          occupation_specific: string | null
          pet_preference: string | null
          pet_preference_enum: string | null
          pet_preference_importance: string | null
          pet_specification: string | null
          pet_type: string | null
          phone_number: string | null
          preferred_location: string[] | null
          profile_visibility: string[] | null
          religion: string | null
          religion_other: string | null
          religion_preference: string | null
          religion_preference_importance: string | null
          rent_option: string | null
          roommate_gender_preference: string | null
          roommate_hobbies: string[] | null
          roommate_lifestyle_preference: string | null
          smoking: boolean | null
          smoking_preference: string | null
          smoking_preference_importance: string | null
          updated_at: string
          user_id: string
          work_location: string | null
          work_location_legacy: string | null
          work_schedule: string | null
          work_schedule_preference: string | null
          work_schedule_preference_importance: string | null
        }
        Insert: {
          age?: number | null
          age_range_preference?: number[] | null
          age_range_preference_importance?: string | null
          budget_range?: number[] | null
          created_at?: string
          diet?: string | null
          diet_other?: string | null
          dietary_other?: string | null
          dietary_preferences?: string | null
          dietary_preferences_importance?: string | null
          email?: string | null
          ethnicity?: string | null
          ethnicity_other?: string | null
          ethnicity_preference?: string | null
          ethnicity_preference_importance?: string | null
          full_name?: string | null
          gender?: string | null
          gender_preference?: string[] | null
          gender_preference_importance?: string | null
          has_pets?: boolean | null
          hobbies?: string[] | null
          housing_preference?: string[] | null
          housing_preference_importance?: string | null
          housing_type?: string | null
          id?: string
          important_roommate_traits?: string[] | null
          language?: string | null
          language_preference?: string | null
          language_preference_importance?: string | null
          language_specific?: string | null
          linkedin_profile?: string | null
          lives_with_smokers?: boolean | null
          living_space?: string | null
          move_in_date_end?: string | null
          move_in_date_start?: string | null
          nationality?: string | null
          nationality_custom?: string | null
          nationality_preference?: string | null
          nationality_preference_importance?: string | null
          occupation?: string | null
          occupation_preference?: boolean | null
          occupation_preference_importance?: string | null
          occupation_specific?: string | null
          pet_preference?: string | null
          pet_preference_enum?: string | null
          pet_preference_importance?: string | null
          pet_specification?: string | null
          pet_type?: string | null
          phone_number?: string | null
          preferred_location?: string[] | null
          profile_visibility?: string[] | null
          religion?: string | null
          religion_other?: string | null
          religion_preference?: string | null
          religion_preference_importance?: string | null
          rent_option?: string | null
          roommate_gender_preference?: string | null
          roommate_hobbies?: string[] | null
          roommate_lifestyle_preference?: string | null
          smoking?: boolean | null
          smoking_preference?: string | null
          smoking_preference_importance?: string | null
          updated_at?: string
          user_id: string
          work_location?: string | null
          work_location_legacy?: string | null
          work_schedule?: string | null
          work_schedule_preference?: string | null
          work_schedule_preference_importance?: string | null
        }
        Update: {
          age?: number | null
          age_range_preference?: number[] | null
          age_range_preference_importance?: string | null
          budget_range?: number[] | null
          created_at?: string
          diet?: string | null
          diet_other?: string | null
          dietary_other?: string | null
          dietary_preferences?: string | null
          dietary_preferences_importance?: string | null
          email?: string | null
          ethnicity?: string | null
          ethnicity_other?: string | null
          ethnicity_preference?: string | null
          ethnicity_preference_importance?: string | null
          full_name?: string | null
          gender?: string | null
          gender_preference?: string[] | null
          gender_preference_importance?: string | null
          has_pets?: boolean | null
          hobbies?: string[] | null
          housing_preference?: string[] | null
          housing_preference_importance?: string | null
          housing_type?: string | null
          id?: string
          important_roommate_traits?: string[] | null
          language?: string | null
          language_preference?: string | null
          language_preference_importance?: string | null
          language_specific?: string | null
          linkedin_profile?: string | null
          lives_with_smokers?: boolean | null
          living_space?: string | null
          move_in_date_end?: string | null
          move_in_date_start?: string | null
          nationality?: string | null
          nationality_custom?: string | null
          nationality_preference?: string | null
          nationality_preference_importance?: string | null
          occupation?: string | null
          occupation_preference?: boolean | null
          occupation_preference_importance?: string | null
          occupation_specific?: string | null
          pet_preference?: string | null
          pet_preference_enum?: string | null
          pet_preference_importance?: string | null
          pet_specification?: string | null
          pet_type?: string | null
          phone_number?: string | null
          preferred_location?: string[] | null
          profile_visibility?: string[] | null
          religion?: string | null
          religion_other?: string | null
          religion_preference?: string | null
          religion_preference_importance?: string | null
          rent_option?: string | null
          roommate_gender_preference?: string | null
          roommate_hobbies?: string[] | null
          roommate_lifestyle_preference?: string | null
          smoking?: boolean | null
          smoking_preference?: string | null
          smoking_preference_importance?: string | null
          updated_at?: string
          user_id?: string
          work_location?: string | null
          work_location_legacy?: string | null
          work_schedule?: string | null
          work_schedule_preference?: string | null
          work_schedule_preference_importance?: string | null
        }
        Relationships: []
      }
      telegram_profiles: {
        Row: {
          budget: number | null
          city: string | null
          created_at: string | null
          gender: string | null
          id: string
          lifestyle: string | null
          pets: boolean | null
          smoker: boolean | null
          telegram_id: number
          username: string | null
        }
        Insert: {
          budget?: number | null
          city?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          lifestyle?: string | null
          pets?: boolean | null
          smoker?: boolean | null
          telegram_id: number
          username?: string | null
        }
        Update: {
          budget?: number | null
          city?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          lifestyle?: string | null
          pets?: boolean | null
          smoker?: boolean | null
          telegram_id?: number
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "landlord" | "seeker" | "developer"
      housing_search_status:
        | "not_started"
        | "actively_searching"
        | "applications_submitted"
        | "offer_received"
        | "signed_lease"
      move_timeline_status: "planning" | "active" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "landlord", "seeker", "developer"],
      housing_search_status: [
        "not_started",
        "actively_searching",
        "applications_submitted",
        "offer_received",
        "signed_lease",
      ],
      move_timeline_status: ["planning", "active", "completed", "cancelled"],
    },
  },
} as const
