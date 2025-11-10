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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          id: string
          questions: Json
          text: string
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          questions: Json
          text: string
          title: string
          xp_reward: number
        }
        Update: {
          created_at?: string | null
          id?: string
          questions?: Json
          text?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      activity_submissions: {
        Row: {
          activity_id: string
          answers: Json
          created_at: string | null
          graded_at: string | null
          id: string
          score: number | null
          status: string
          student_id: string
        }
        Insert: {
          activity_id: string
          answers: Json
          created_at?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id: string
        }
        Update: {
          activity_id?: string
          answers?: Json
          created_at?: string | null
          graded_at?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_submissions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_state: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          used_challenges: string[] | null
          used_users: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          used_challenges?: string[] | null
          used_users?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          used_challenges?: string[] | null
          used_users?: string[] | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_text: string
          created_at: string
          id: string
          profile_id: string | null
        }
        Insert: {
          challenge_text: string
          created_at?: string
          id?: string
          profile_id?: string | null
        }
        Update: {
          challenge_text?: string
          created_at?: string
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string | null
          description: string | null
          has_music: boolean | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          has_music?: boolean | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          has_music?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          challenge_text: string | null
          created_at: string
          game_started: boolean | null
          id: string
          updated_at: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          challenge_text?: string | null
          created_at?: string
          game_started?: boolean | null
          id?: string
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          challenge_text?: string | null
          created_at?: string
          game_started?: boolean | null
          id?: string
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          location_name: string
          reply_to_id: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          location_name: string
          reply_to_id?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          location_name?: string
          reply_to_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_progress: {
        Row: {
          created_at: string | null
          id: string
          mission_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mission_id: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mission_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          professor_id: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          professor_id?: string | null
          title: string
          xp_reward: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          professor_id?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "missions_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          updated_at: string
          username: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          name: string
          photo_url?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          match_id: string
          question_id: number
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          match_id: string
          question_id: number
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          match_id?: string
          question_id?: number
          user_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          compatibility_percentage: number
          created_at: string
          id: string
          match_id: string
          updated_at: string
          user1_answers: Json
          user2_answers: Json
        }
        Insert: {
          compatibility_percentage: number
          created_at?: string
          id?: string
          match_id: string
          updated_at?: string
          user1_answers: Json
          user2_answers: Json
        }
        Update: {
          compatibility_percentage?: number
          created_at?: string
          id?: string
          match_id?: string
          updated_at?: string
          user1_answers?: Json
          user2_answers?: Json
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          element: string | null
          id: string
          is_professor: boolean | null
          name: string
          photo_url: string | null
          rank: string
          updated_at: string
          username: string
          xp: number
        }
        Insert: {
          created_at?: string
          element?: string | null
          id?: string
          is_professor?: boolean | null
          name: string
          photo_url?: string | null
          rank?: string
          updated_at?: string
          username: string
          xp?: number
        }
        Update: {
          created_at?: string
          element?: string | null
          id?: string
          is_professor?: boolean | null
          name?: string
          photo_url?: string | null
          rank?: string
          updated_at?: string
          username?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp: {
        Args: { user_id_param: string; xp_to_add: number }
        Returns: undefined
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
