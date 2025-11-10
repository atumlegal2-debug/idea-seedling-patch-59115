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
      active_diseases: {
        Row: {
          cured_at: string | null
          disease_id: string
          id: string
          infected_at: string
          is_active: boolean
          profile_id: string
        }
        Insert: {
          cured_at?: string | null
          disease_id: string
          id?: string
          infected_at?: string
          is_active?: boolean
          profile_id: string
        }
        Update: {
          cured_at?: string | null
          disease_id?: string
          id?: string
          infected_at?: string
          is_active?: boolean
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_diseases_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_menu_items: {
        Row: {
          alcoholism_effect: number | null
          created_at: string
          created_by_profile_id: string
          display_order: number | null
          establishment: string
          hunger_effect: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_on_sale: boolean | null
          item_description: string
          item_name: string
          item_type: string
          preparation_time: number
          price: number
          sale_price: number | null
          thirst_effect: number | null
        }
        Insert: {
          alcoholism_effect?: number | null
          created_at?: string
          created_by_profile_id: string
          display_order?: number | null
          establishment: string
          hunger_effect?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_on_sale?: boolean | null
          item_description: string
          item_name: string
          item_type: string
          preparation_time?: number
          price?: number
          sale_price?: number | null
          thirst_effect?: number | null
        }
        Update: {
          alcoholism_effect?: number | null
          created_at?: string
          created_by_profile_id?: string
          display_order?: number | null
          establishment?: string
          hunger_effect?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_on_sale?: boolean | null
          item_description?: string
          item_name?: string
          item_type?: string
          preparation_time?: number
          price?: number
          sale_price?: number | null
          thirst_effect?: number | null
        }
        Relationships: []
      }
      daily_item_creations: {
        Row: {
          creation_date: string
          establishment: string
          id: string
          items_created: number
          last_creation_at: string | null
          profile_id: string
        }
        Insert: {
          creation_date?: string
          establishment: string
          id?: string
          items_created?: number
          last_creation_at?: string | null
          profile_id: string
        }
        Update: {
          creation_date?: string
          establishment?: string
          id?: string
          items_created?: number
          last_creation_at?: string | null
          profile_id?: string
        }
        Relationships: []
      }
      diseases: {
        Row: {
          description: string
          emoji_description: string
          health_loss: number
          hospital_time: number
          id: string
          image_url: string | null
          name: string
          symptoms: string
        }
        Insert: {
          description: string
          emoji_description: string
          health_loss: number
          hospital_time: number
          id?: string
          image_url?: string | null
          name: string
          symptoms: string
        }
        Update: {
          description?: string
          emoji_description?: string
          health_loss?: number
          hospital_time?: number
          id?: string
          image_url?: string | null
          name?: string
          symptoms?: string
        }
        Relationships: []
      }
      drink_collection: {
        Row: {
          drink_id: string
          id: string
          profile_id: string
          quantity: number
          unlocked_at: string
        }
        Insert: {
          drink_id: string
          id?: string
          profile_id: string
          quantity?: number
          unlocked_at?: string
        }
        Update: {
          drink_id?: string
          id?: string
          profile_id?: string
          quantity?: number
          unlocked_at?: string
        }
        Relationships: []
      }
      employee_preparations: {
        Row: {
          created_at: string | null
          establishment: string
          finish_at: string | null
          id: string
          item_name: string
          item_type: string
          profile_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          establishment: string
          finish_at?: string | null
          id?: string
          item_name: string
          item_type: string
          profile_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          establishment?: string
          finish_at?: string | null
          id?: string
          item_name?: string
          item_type?: string
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_preparations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_employees: {
        Row: {
          establishment: string
          hired_at: string
          id: string
          profile_id: string
        }
        Insert: {
          establishment: string
          hired_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          establishment?: string
          hired_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: []
      }
      establishment_inventory: {
        Row: {
          created_at: string
          establishment: string
          id: string
          item_name: string
          last_restocked_at: string | null
          max_stock: number
          restock_price: number
          restocking_until: string | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          establishment: string
          id?: string
          item_name: string
          last_restocked_at?: string | null
          max_stock?: number
          restock_price: number
          restocking_until?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          establishment?: string
          id?: string
          item_name?: string
          last_restocked_at?: string | null
          max_stock?: number
          restock_price?: number
          restocking_until?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      establishment_status: {
        Row: {
          closed_at: string | null
          establishment: string
          id: string
          is_open: boolean
          restocking_until: string | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          establishment: string
          id?: string
          is_open?: boolean
          restocking_until?: string | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          establishment?: string
          id?: string
          is_open?: boolean
          restocking_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string
          custom_effects: Json | null
          expires_at: string | null
          id: string
          image_url: string | null
          item_name: string
          item_type: string
          profile_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          custom_effects?: Json | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          item_name: string
          item_type: string
          profile_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          custom_effects?: Json | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          item_name?: string
          item_type?: string
          profile_id?: string
          quantity?: number
        }
        Relationships: []
      }
      item_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          item_name: string
          item_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          item_name: string
          item_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          item_name?: string
          item_type?: string | null
        }
        Relationships: []
      }
      medical_appointments: {
        Row: {
          appointment_description: string | null
          appointment_name: string
          approved_at: string | null
          completed_at: string | null
          consultation_time: number
          created_at: string
          health_increase: number
          id: string
          price: number
          profile_id: string
          status: string
        }
        Insert: {
          appointment_description?: string | null
          appointment_name: string
          approved_at?: string | null
          completed_at?: string | null
          consultation_time: number
          created_at?: string
          health_increase: number
          id?: string
          price: number
          profile_id: string
          status?: string
        }
        Update: {
          appointment_description?: string | null
          appointment_name?: string
          approved_at?: string | null
          completed_at?: string | null
          consultation_time?: number
          created_at?: string
          health_increase?: number
          id?: string
          price?: number
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_customizations: {
        Row: {
          created_at: string | null
          custom_price: number | null
          establishment: string
          id: string
          is_active: boolean | null
          is_on_sale: boolean | null
          item_id: string
          sale_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_price?: number | null
          establishment: string
          id?: string
          is_active?: boolean | null
          is_on_sale?: boolean | null
          item_id: string
          sale_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_price?: number | null
          establishment?: string
          id?: string
          is_active?: boolean | null
          is_on_sale?: boolean | null
          item_id?: string
          sale_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          accepted_at: string | null
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_anonymous: boolean
          recipient_name: string | null
          recipient_profile_link: string | null
          sender_profile_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean
          recipient_name?: string | null
          recipient_profile_link?: string | null
          sender_profile_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean
          recipient_name?: string | null
          recipient_profile_link?: string | null
          sender_profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          delivery_code: string | null
          delivery_location: string | null
          delivery_started_at: string | null
          delivery_type: string
          establishment: string
          finish_at: string | null
          id: string
          item_effects: Json | null
          item_name: string
          item_price: number
          item_type: string | null
          preparation_time: number
          profile_id: string
          quantity: number
          served_at: string | null
          status: string
          total_price: number
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          delivery_code?: string | null
          delivery_location?: string | null
          delivery_started_at?: string | null
          delivery_type?: string
          establishment: string
          finish_at?: string | null
          id?: string
          item_effects?: Json | null
          item_name: string
          item_price: number
          item_type?: string | null
          preparation_time: number
          profile_id: string
          quantity?: number
          served_at?: string | null
          status?: string
          total_price: number
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          delivery_code?: string | null
          delivery_location?: string | null
          delivery_started_at?: string | null
          delivery_type?: string
          establishment?: string
          finish_at?: string | null
          id?: string
          item_effects?: Json | null
          item_name?: string
          item_price?: number
          item_type?: string | null
          preparation_time?: number
          profile_id?: string
          quantity?: number
          served_at?: string | null
          status?: string
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          alcoholism: number
          health: number
          hunger: number
          id: string
          profile_id: string
          thirst: number
          updated_at: string
        }
        Insert: {
          alcoholism?: number
          health?: number
          hunger?: number
          id?: string
          profile_id: string
          thirst?: number
          updated_at?: string
        }
        Update: {
          alcoholism?: number
          health?: number
          hunger?: number
          id?: string
          profile_id?: string
          thirst?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          age_group_last_updated: string | null
          created_at: string
          id: string
          last_rancho_use: string | null
          last_roulette_spin: string | null
          name: string
          role: string | null
          username: string
          wallet_balance: number
        }
        Insert: {
          age_group?: string | null
          age_group_last_updated?: string | null
          created_at?: string
          id?: string
          last_rancho_use?: string | null
          last_roulette_spin?: string | null
          name: string
          role?: string | null
          username: string
          wallet_balance?: number
        }
        Update: {
          age_group?: string | null
          age_group_last_updated?: string | null
          created_at?: string
          id?: string
          last_rancho_use?: string | null
          last_roulette_spin?: string | null
          name?: string
          role?: string | null
          username?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      refrigerator_items: {
        Row: {
          alcoholism_effect: number | null
          establishment: string
          expires_at: string
          hunger_effect: number | null
          id: string
          image_url: string | null
          is_custom: boolean | null
          item_description: string | null
          item_id: string | null
          item_name: string
          item_type: string
          preparation_time: number
          price: number
          stored_at: string | null
          thirst_effect: number | null
        }
        Insert: {
          alcoholism_effect?: number | null
          establishment: string
          expires_at?: string
          hunger_effect?: number | null
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          item_description?: string | null
          item_id?: string | null
          item_name: string
          item_type: string
          preparation_time: number
          price: number
          stored_at?: string | null
          thirst_effect?: number | null
        }
        Update: {
          alcoholism_effect?: number | null
          establishment?: string
          expires_at?: string
          hunger_effect?: number | null
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          item_description?: string | null
          item_id?: string | null
          item_name?: string
          item_type?: string
          preparation_time?: number
          price?: number
          stored_at?: string | null
          thirst_effect?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          from_profile_id: string
          id: string
          to_profile_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_profile_id: string
          id?: string
          to_profile_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_profile_id?: string
          id?: string
          to_profile_id?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          created_at: string | null
          drink_uses_left: number
          establishment: string
          food_uses_left: number
          id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          drink_uses_left?: number
          establishment: string
          food_uses_left?: number
          id?: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          drink_uses_left?: number
          establishment?: string
          food_uses_left?: number
          id?: string
          profile_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_medical_appointment: {
        Args: { appointment_id_param: string }
        Returns: undefined
      }
      decrement_stock: {
        Args: { est_name: string; item: string; qty: number }
        Returns: undefined
      }
      delete_expired_refrigerator_items: { Args: never; Returns: undefined }
      increment_daily_creation: {
        Args: {
          p_creation_date: string
          p_establishment: string
          p_profile_id: string
        }
        Returns: undefined
      }
      increment_stock: {
        Args: { est_name: string; item: string; qty: number }
        Returns: undefined
      }
      transfer_balance: {
        Args: {
          receiver_id: string
          sender_id: string
          transfer_amount: number
        }
        Returns: undefined
      }
      update_establishment_status: {
        Args: { establishment_name: string; new_status: boolean }
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
