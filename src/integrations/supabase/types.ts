export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_code: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_code: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      carbon_calculations: {
        Row: {
          created_at: string
          energy_kg: number
          food_kg: number
          id: string
          inputs: Json
          period: string
          total_kg: number
          transport_kg: number
          user_id: string
          waste_kg: number
        }
        Insert: {
          created_at?: string
          energy_kg?: number
          food_kg?: number
          id?: string
          inputs?: Json
          period?: string
          total_kg?: number
          transport_kg?: number
          user_id: string
          waste_kg?: number
        }
        Update: {
          created_at?: string
          energy_kg?: number
          food_kg?: number
          id?: string
          inputs?: Json
          period?: string
          total_kg?: number
          transport_kg?: number
          user_id?: string
          waste_kg?: number
        }
        Relationships: []
      }
      emission_factors: {
        Row: {
          category: string
          factor: number
          id: string
          key: string
          label: string
          methodology: string | null
          source: string
          unit: string
        }
        Insert: {
          category: string
          factor: number
          id?: string
          key: string
          label: string
          methodology?: string | null
          source: string
          unit: string
        }
        Update: {
          category?: string
          factor?: number
          id?: string
          key?: string
          label?: string
          methodology?: string | null
          source?: string
          unit?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          created_at: string
          current_value: number
          deadline: string | null
          id: string
          status: string
          target_value: number
          title: string
          unit: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          status?: string
          target_value: number
          title: string
          unit?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          status?: string
          target_value?: number
          title?: string
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          campus: string | null
          created_at: string
          department: string | null
          display_name: string
          eco_points: number
          id: string
          onboarded: boolean
          reduction_target_pct: number
          role_type: string
          share_on_leaderboard: boolean
          streak_days: number
          updated_at: string
        }
        Insert: {
          campus?: string | null
          created_at?: string
          department?: string | null
          display_name?: string
          eco_points?: number
          id: string
          onboarded?: boolean
          reduction_target_pct?: number
          role_type?: string
          share_on_leaderboard?: boolean
          streak_days?: number
          updated_at?: string
        }
        Update: {
          campus?: string | null
          created_at?: string
          department?: string | null
          display_name?: string
          eco_points?: number
          id?: string
          onboarded?: boolean
          reduction_target_pct?: number
          role_type?: string
          share_on_leaderboard?: boolean
          streak_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          impact_kg: number
          rank: number
          source: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          impact_kg?: number
          rank?: number
          source?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          impact_kg?: number
          rank?: number
          source?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      travel_records: {
        Row: {
          co2e_kg: number
          created_at: string
          destination_label: string
          distance_km: number
          distance_source: string
          id: string
          mode: string
          origin_label: string
          trips_per_week: number
          user_id: string
        }
        Insert: {
          co2e_kg?: number
          created_at?: string
          destination_label: string
          distance_km: number
          distance_source?: string
          id?: string
          mode: string
          origin_label: string
          trips_per_week?: number
          user_id: string
        }
        Update: {
          co2e_kg?: number
          created_at?: string
          destination_label?: string
          distance_km?: number
          distance_source?: string
          id?: string
          mode?: string
          origin_label?: string
          trips_per_week?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      campus_analytics: {
        Args: never
        Returns: {
          energy_kg: number
          food_kg: number
          participants: number
          total_kg: number
          transport_kg: number
          waste_kg: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      leaderboard: {
        Args: { _limit?: number }
        Returns: {
          department: string
          display_name: string
          eco_points: number
          streak_days: number
        }[]
      }
    }
    Enums: {
      app_role: "student" | "faculty" | "admin"
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
      app_role: ["student", "faculty", "admin"],
    },
  },
} as const
