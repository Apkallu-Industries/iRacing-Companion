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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_votes: {
        Row: {
          created_at: string
          kind: string
          target_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          kind: string
          target_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          kind?: string
          target_id?: string
          user_id?: string
        }
        Relationships: []
      }
      driver_fingerprint: {
        Row: {
          best_ever_s: number
          best_lap_sectors: Json | null
          best_per_sector: Json | null
          best_stdev_s: number | null
          car: string
          car_class: string | null
          earliest_build_date: string | null
          file_count: number
          latest_build_date: string | null
          median_best_s: number | null
          optimal_ever_s: number | null
          track: string
          track_length_known: boolean | null
          track_length_m: number | null
          trend: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_ever_s: number
          best_lap_sectors?: Json | null
          best_per_sector?: Json | null
          best_stdev_s?: number | null
          car: string
          car_class?: string | null
          earliest_build_date?: string | null
          file_count?: number
          latest_build_date?: string | null
          median_best_s?: number | null
          optimal_ever_s?: number | null
          track: string
          track_length_known?: boolean | null
          track_length_m?: number | null
          trend?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_ever_s?: number
          best_lap_sectors?: Json | null
          best_per_sector?: Json | null
          best_stdev_s?: number | null
          car?: string
          car_class?: string | null
          earliest_build_date?: string | null
          file_count?: number
          latest_build_date?: string | null
          median_best_s?: number | null
          optimal_ever_s?: number | null
          track?: string
          track_length_known?: boolean | null
          track_length_m?: number | null
          trend?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_lap_records: {
        Row: {
          car: string
          fuel_used_l: number | null
          id: string
          is_valid: boolean
          lap_time_s: number
          max_brake_pct: number | null
          max_throttle_pct: number | null
          peak_lat_g: number | null
          peak_lon_g: number | null
          recorded_at: string
          s1_s: number | null
          s2_s: number | null
          s3_s: number | null
          tire_avg_c: number | null
          track: string
          user_id: string
        }
        Insert: {
          car: string
          fuel_used_l?: number | null
          id?: string
          is_valid?: boolean
          lap_time_s: number
          max_brake_pct?: number | null
          max_throttle_pct?: number | null
          peak_lat_g?: number | null
          peak_lon_g?: number | null
          recorded_at?: string
          s1_s?: number | null
          s2_s?: number | null
          s3_s?: number | null
          tire_avg_c?: number | null
          track: string
          user_id: string
        }
        Update: {
          car?: string
          fuel_used_l?: number | null
          id?: string
          is_valid?: boolean
          lap_time_s?: number
          max_brake_pct?: number | null
          max_throttle_pct?: number | null
          peak_lat_g?: number | null
          peak_lon_g?: number | null
          recorded_at?: string
          s1_s?: number | null
          s2_s?: number | null
          s3_s?: number | null
          tire_avg_c?: number | null
          track?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_car_classes: {
        Row: {
          car: string
          car_class: string
          confidence: number | null
          created_at: string
          id: string
          published: boolean
          updated_at: string
          user_id: string
          votes: number
        }
        Insert: {
          car: string
          car_class: string
          confidence?: number | null
          created_at?: string
          id?: string
          published?: boolean
          updated_at?: string
          user_id: string
          votes?: number
        }
        Update: {
          car?: string
          car_class?: string
          confidence?: number | null
          created_at?: string
          id?: string
          published?: boolean
          updated_at?: string
          user_id?: string
          votes?: number
        }
        Relationships: []
      }
      shared_channel_layouts: {
        Row: {
          created_at: string
          id: string
          layout: Json
          name: string
          published: boolean
          updated_at: string
          user_id: string
          votes: number
        }
        Insert: {
          created_at?: string
          id?: string
          layout: Json
          name: string
          published?: boolean
          updated_at?: string
          user_id: string
          votes?: number
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          published?: boolean
          updated_at?: string
          user_id?: string
          votes?: number
        }
        Relationships: []
      }
      shared_gear_ratios: {
        Row: {
          car: string
          created_at: string
          id: string
          name: string | null
          published: boolean
          ratios: Json
          samples: Json | null
          updated_at: string
          user_id: string
          votes: number
        }
        Insert: {
          car: string
          created_at?: string
          id?: string
          name?: string | null
          published?: boolean
          ratios: Json
          samples?: Json | null
          updated_at?: string
          user_id: string
          votes?: number
        }
        Update: {
          car?: string
          created_at?: string
          id?: string
          name?: string | null
          published?: boolean
          ratios?: Json
          samples?: Json | null
          updated_at?: string
          user_id?: string
          votes?: number
        }
        Relationships: []
      }
      shared_laps: {
        Row: {
          cmp_lap: number | null
          created_at: string
          expires_at: string | null
          id: string
          ref_lap: number | null
          revoked_at: string | null
          session_id: string
          token: string
          user_id: string
          view_count: number
        }
        Insert: {
          cmp_lap?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ref_lap?: number | null
          revoked_at?: string | null
          session_id: string
          token: string
          user_id: string
          view_count?: number
        }
        Update: {
          cmp_lap?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ref_lap?: number | null
          revoked_at?: string | null
          session_id?: string
          token?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_laps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "telemetry_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          theme: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          theme: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          theme?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telemetry_sessions: {
        Row: {
          best_lap_s: number | null
          car: string | null
          created_at: string
          driver: string | null
          duration_s: number | null
          file_size: number | null
          fingerprint_delta: Json | null
          id: string
          lap_count: number | null
          name: string
          num_vars: number | null
          recorded_at: string | null
          setup_yaml: string | null
          storage_path: string
          tick_rate: number | null
          track: string | null
          user_id: string
        }
        Insert: {
          best_lap_s?: number | null
          car?: string | null
          created_at?: string
          driver?: string | null
          duration_s?: number | null
          file_size?: number | null
          fingerprint_delta?: Json | null
          id?: string
          lap_count?: number | null
          name: string
          num_vars?: number | null
          recorded_at?: string | null
          setup_yaml?: string | null
          storage_path: string
          tick_rate?: number | null
          track?: string | null
          user_id: string
        }
        Update: {
          best_lap_s?: number | null
          car?: string | null
          created_at?: string
          driver?: string | null
          duration_s?: number | null
          file_size?: number | null
          fingerprint_delta?: Json | null
          id?: string
          lap_count?: number | null
          name?: string
          num_vars?: number | null
          recorded_at?: string | null
          setup_yaml?: string | null
          storage_path?: string
          tick_rate?: number | null
          track?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          theme: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          theme?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          theme?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_community_votes: {
        Args: { _kind: string; _target_id: string }
        Returns: number
      }
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
