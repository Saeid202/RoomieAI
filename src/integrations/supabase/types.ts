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
      co_owner: {
        Row: {
          age: string | null
          co_ownership_experience: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: number
          investment_capacity: number[] | null
          investment_timeline: string | null
          occupation: string | null
          phone_number: string | null
          preferred_location: string | null
          property_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age?: string | null
          co_ownership_experience?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          investment_capacity?: number[] | null
          investment_timeline?: string | null
          occupation?: string | null
          phone_number?: string | null
          preferred_location?: string | null
          property_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age?: string | null
          co_ownership_experience?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          investment_capacity?: number[] | null
          investment_timeline?: string | null
          occupation?: string | null
          phone_number?: string | null
          preferred_location?: string | null
          property_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      roommate: {
        Row: {
          age: string | null
          atmosphere: string | null
          budget_range: number[] | null
          cleaning_frequency: string | null
          cleanliness: string | null
          cooking_sharing: string | null
          created_at: string | null
          daily_routine: string | null
          diet: string | null
          email: string | null
          family_over: string | null
          full_name: string | null
          gender: string | null
          guests_over: string | null
          has_pets: boolean | null
          hobbies: string[] | null
          hosting_friends: string | null
          housing_type: string | null
          id: string
          important_roommate_traits: string[] | null
          lease_term: string | null
          linkedin_profile: string | null
          lives_with_smokers: boolean | null
          living_space: string | null
          move_in_date: string | null
          overnight_guests: string | null
          pet_preference: string | null
          phone_number: string | null
          preferred_location: string | null
          roommate_age_preference: string | null
          roommate_gender_preference: string | null
          roommate_lifestyle_preference: string | null
          sleep_schedule: string | null
          smoking: boolean | null
          social_level: string | null
          stay_duration: string | null
          updated_at: string | null
          user_id: string | null
          work_location: string | null
          work_schedule: string | null
        }
        Insert: {
          age?: string | null
          atmosphere?: string | null
          budget_range?: number[] | null
          cleaning_frequency?: string | null
          cleanliness?: string | null
          cooking_sharing?: string | null
          created_at?: string | null
          daily_routine?: string | null
          diet?: string | null
          email?: string | null
          family_over?: string | null
          full_name?: string | null
          gender?: string | null
          guests_over?: string | null
          has_pets?: boolean | null
          hobbies?: string[] | null
          hosting_friends?: string | null
          housing_type?: string | null
          id?: string
          important_roommate_traits?: string[] | null
          lease_term?: string | null
          linkedin_profile?: string | null
          lives_with_smokers?: boolean | null
          living_space?: string | null
          move_in_date?: string | null
          overnight_guests?: string | null
          pet_preference?: string | null
          phone_number?: string | null
          preferred_location?: string | null
          roommate_age_preference?: string | null
          roommate_gender_preference?: string | null
          roommate_lifestyle_preference?: string | null
          sleep_schedule?: string | null
          smoking?: boolean | null
          social_level?: string | null
          stay_duration?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_location?: string | null
          work_schedule?: string | null
        }
        Update: {
          age?: string | null
          atmosphere?: string | null
          budget_range?: number[] | null
          cleaning_frequency?: string | null
          cleanliness?: string | null
          cooking_sharing?: string | null
          created_at?: string | null
          daily_routine?: string | null
          diet?: string | null
          email?: string | null
          family_over?: string | null
          full_name?: string | null
          gender?: string | null
          guests_over?: string | null
          has_pets?: boolean | null
          hobbies?: string[] | null
          hosting_friends?: string | null
          housing_type?: string | null
          id?: string
          important_roommate_traits?: string[] | null
          lease_term?: string | null
          linkedin_profile?: string | null
          lives_with_smokers?: boolean | null
          living_space?: string | null
          move_in_date?: string | null
          overnight_guests?: string | null
          pet_preference?: string | null
          phone_number?: string | null
          preferred_location?: string | null
          roommate_age_preference?: string | null
          roommate_gender_preference?: string | null
          roommate_lifestyle_preference?: string | null
          sleep_schedule?: string | null
          smoking?: boolean | null
          social_level?: string | null
          stay_duration?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_location?: string | null
          work_schedule?: string | null
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
