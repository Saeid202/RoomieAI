export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
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
          id: string
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
      "real estate": {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
