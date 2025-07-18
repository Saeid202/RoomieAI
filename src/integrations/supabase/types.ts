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
      co_owner: {
        Row: {
          age: number | null
          co_ownership_experience: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          investment_capacity: number[] | null
          investment_timeline: string | null
          occupation: string | null
          phone_number: string | null
          preferred_location: string | null
          property_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          co_ownership_experience?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          investment_capacity?: number[] | null
          investment_timeline?: string | null
          occupation?: string | null
          phone_number?: string | null
          preferred_location?: string | null
          property_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          co_ownership_experience?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          investment_capacity?: number[] | null
          investment_timeline?: string | null
          occupation?: string | null
          phone_number?: string | null
          preferred_location?: string | null
          property_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
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
          city: string
          created_at: string
          description: string | null
          furnished: string | null
          id: string
          images: string[] | null
          latitude: number | null
          lease_terms: string | null
          listing_title: string
          longitude: number | null
          monthly_rent: number
          nearby_amenities: string[] | null
          neighborhood: string | null
          parking: string | null
          pet_policy: string | null
          property_condition: string | null
          property_type: string
          public_transport_access: string | null
          roommate_preference: string | null
          security_deposit: number | null
          special_instructions: string | null
          square_footage: number | null
          state: string
          updated_at: string
          user_id: string
          utilities_included: string[] | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          created_at?: string
          description?: string | null
          furnished?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          lease_terms?: string | null
          listing_title: string
          longitude?: number | null
          monthly_rent: number
          nearby_amenities?: string[] | null
          neighborhood?: string | null
          parking?: string | null
          pet_policy?: string | null
          property_condition?: string | null
          property_type: string
          public_transport_access?: string | null
          roommate_preference?: string | null
          security_deposit?: number | null
          special_instructions?: string | null
          square_footage?: number | null
          state: string
          updated_at?: string
          user_id: string
          utilities_included?: string[] | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          created_at?: string
          description?: string | null
          furnished?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          lease_terms?: string | null
          listing_title?: string
          longitude?: number | null
          monthly_rent?: number
          nearby_amenities?: string[] | null
          neighborhood?: string | null
          parking?: string | null
          pet_policy?: string | null
          property_condition?: string | null
          property_type?: string
          public_transport_access?: string | null
          roommate_preference?: string | null
          security_deposit?: number | null
          special_instructions?: string | null
          square_footage?: number | null
          state?: string
          updated_at?: string
          user_id?: string
          utilities_included?: string[] | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: []
      }
      Properties: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
