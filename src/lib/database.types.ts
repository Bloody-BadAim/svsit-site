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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accessory_definitions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          is_limited_time: boolean
          limited_time_end: string | null
          name: string
          preview_data: Json | null
          rarity: string
          shop_price: number | null
          stock: number | null
          unlock_rule: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_limited_time?: boolean
          limited_time_end?: string | null
          name: string
          preview_data?: Json | null
          rarity: string
          shop_price?: number | null
          stock?: number | null
          unlock_rule?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_limited_time?: boolean
          limited_time_end?: string | null
          name?: string
          preview_data?: Json | null
          rarity?: string
          shop_price?: number | null
          stock?: number | null
          unlock_rule?: Json | null
        }
        Relationships: []
      }
      badge_definitions: {
        Row: {
          auto_grant_rule: Json | null
          category: string
          description: string | null
          icon: string | null
          id: string
          name: string
          rarity: string
          xp_bonus: number
        }
        Insert: {
          auto_grant_rule?: Json | null
          category: string
          description?: string | null
          icon?: string | null
          id: string
          name: string
          rarity: string
          xp_bonus?: number
        }
        Update: {
          auto_grant_rule?: Json | null
          category?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          rarity?: string
          xp_bonus?: number
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          member_id: string
          proof_text: string | null
          proof_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          member_id: string
          proof_text?: string | null
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          member_id?: string
          proof_text?: string | null
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          active_from: string | null
          active_until: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          points: number
          proof_required: boolean | null
          proof_type: string | null
          title: string
          track_id: string | null
          track_order: number | null
          type: string
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          points: number
          proof_required?: boolean | null
          proof_type?: string | null
          title: string
          track_id?: string | null
          track_order?: number | null
          type: string
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          points?: number
          proof_required?: boolean | null
          proof_type?: string | null
          title?: string
          track_id?: string | null
          track_order?: number | null
          type?: string
        }
        Relationships: []
      }
      commissies: {
        Row: {
          beschrijving: string | null
          created_at: string | null
          emoji: string | null
          id: string
          naam: string
          slug: string
        }
        Insert: {
          beschrijving?: string | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          naam: string
          slug: string
        }
        Update: {
          beschrijving?: string | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          naam?: string
          slug?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          category: string | null
          checkin_code: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_date: string | null
          external_ticket_url: string | null
          id: string
          is_paid: boolean | null
          location: string | null
          notion_id: string | null
          price_members: number | null
          price_nonmembers: number | null
          recap_description: string | null
          recap_photos: string[] | null
          recap_published: boolean | null
          status: string | null
          stripe_price_id: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          checkin_code?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_date?: string | null
          external_ticket_url?: string | null
          id?: string
          is_paid?: boolean | null
          location?: string | null
          notion_id?: string | null
          price_members?: number | null
          price_nonmembers?: number | null
          recap_description?: string | null
          recap_photos?: string[] | null
          recap_published?: boolean | null
          status?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          capacity?: number | null
          category?: string | null
          checkin_code?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_date?: string | null
          external_ticket_url?: string | null
          id?: string
          is_paid?: boolean | null
          location?: string | null
          notion_id?: string | null
          price_members?: number | null
          price_nonmembers?: number | null
          recap_description?: string | null
          recap_photos?: string[] | null
          recap_published?: boolean | null
          status?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      levels: {
        Row: {
          cumulative_xp: number
          level: number
          tier: string
          title: string
          xp_required: number
        }
        Insert: {
          cumulative_xp: number
          level: number
          tier: string
          title: string
          xp_required: number
        }
        Update: {
          cumulative_xp?: number
          level?: number
          tier?: string
          title?: string
          xp_required?: number
        }
        Relationships: []
      }
      member_accessories: {
        Row: {
          accessory_id: string
          acquired_at: string
          acquired_via: string
          equipped: boolean
          id: string
          member_id: string
          position: Json | null
        }
        Insert: {
          accessory_id: string
          acquired_at?: string
          acquired_via: string
          equipped?: boolean
          id?: string
          member_id: string
          position?: Json | null
        }
        Update: {
          accessory_id?: string
          acquired_at?: string
          acquired_via?: string
          equipped?: boolean
          id?: string
          member_id?: string
          position?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "member_accessories_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessory_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_accessories_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_badges: {
        Row: {
          badge_id: string
          earned_at: string
          equipped: boolean
          equipped_slot: number | null
          id: string
          member_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          equipped?: boolean
          equipped_slot?: number | null
          id?: string
          member_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          equipped?: boolean
          equipped_slot?: number | null
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_badges_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_commissies: {
        Row: {
          commissie_id: string
          id: string
          joined_at: string | null
          member_id: string
          role_in_commissie: string
        }
        Insert: {
          commissie_id: string
          id?: string
          joined_at?: string | null
          member_id: string
          role_in_commissie?: string
        }
        Update: {
          commissie_id?: string
          id?: string
          joined_at?: string | null
          member_id?: string
          role_in_commissie?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_commissies_commissie_id_fkey"
            columns: ["commissie_id"]
            isOneToOne: false
            referencedRelation: "commissies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_commissies_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          accent_color: string | null
          active_badges: string[] | null
          active_skin: string | null
          coins_balance: number
          commissie: string | null
          commissie_voorstel: string | null
          created_at: string | null
          current_level: number
          custom_title: string | null
          display_name: string | null
          email: string
          hva_email: string | null
          id: string
          is_admin: boolean | null
          leaderboard_visible: boolean
          membership_active: boolean | null
          membership_expires_at: string | null
          membership_started_at: string | null
          password_hash: string | null
          points: number | null
          role: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          student_number: string | null
          total_xp: number
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          active_badges?: string[] | null
          active_skin?: string | null
          coins_balance?: number
          commissie?: string | null
          commissie_voorstel?: string | null
          created_at?: string | null
          current_level?: number
          custom_title?: string | null
          display_name?: string | null
          email: string
          hva_email?: string | null
          id?: string
          is_admin?: boolean | null
          leaderboard_visible?: boolean
          membership_active?: boolean | null
          membership_expires_at?: string | null
          membership_started_at?: string | null
          password_hash?: string | null
          points?: number | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          student_number?: string | null
          total_xp?: number
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          active_badges?: string[] | null
          active_skin?: string | null
          coins_balance?: number
          commissie?: string | null
          commissie_voorstel?: string | null
          created_at?: string | null
          current_level?: number
          custom_title?: string | null
          display_name?: string | null
          email?: string
          hva_email?: string | null
          id?: string
          is_admin?: boolean | null
          leaderboard_visible?: boolean
          membership_active?: boolean | null
          membership_expires_at?: string | null
          membership_started_at?: string | null
          password_hash?: string | null
          points?: number | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          student_number?: string | null
          total_xp?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          member_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          member_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          member_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          member_id: string
          paid_at: string | null
          status: string
          stripe_session_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          member_id: string
          paid_at?: string | null
          status?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          member_id?: string
          paid_at?: string | null
          status?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          created_at: string | null
          creators: string[] | null
          demo_url: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          member_ids: string[] | null
          repo_url: string | null
          tech_stack: string[] | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          creators?: string[] | null
          demo_url?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          member_ids?: string[] | null
          repo_url?: string | null
          tech_stack?: string[] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          creators?: string[] | null
          demo_url?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          member_ids?: string[] | null
          repo_url?: string | null
          tech_stack?: string[] | null
          title?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string
          member_id: string
          reward_id: string
          type: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          member_id: string
          reward_id: string
          type: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          member_id?: string
          reward_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          category: string | null
          created_at: string | null
          event_id: string | null
          event_name: string | null
          id: string
          member_id: string
          points: number
          reason: string
          scanned_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          event_id?: string | null
          event_name?: string | null
          id?: string
          member_id: string
          points: number
          reason: string
          scanned_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          event_id?: string | null
          event_name?: string | null
          id?: string
          member_id?: string
          points?: number
          reason?: string
          scanned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_transactions: {
        Row: {
          accessory_id: string
          coins_spent: number
          id: string
          member_id: string
          purchased_at: string
        }
        Insert: {
          accessory_id: string
          coins_spent: number
          id?: string
          member_id: string
          purchased_at?: string
        }
        Update: {
          accessory_id?: string
          coins_spent?: number
          id?: string
          member_id?: string
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_transactions_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessory_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          member_id: string | null
          name: string | null
          paid_amount: number | null
          status: string | null
          stripe_session_id: string | null
          ticket_number: string | null
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          member_id?: string | null
          name?: string | null
          paid_amount?: number | null
          status?: string | null
          stripe_session_id?: string | null
          ticket_number?: string | null
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          member_id?: string | null
          name?: string | null
          paid_amount?: number | null
          status?: string | null
          stripe_session_id?: string | null
          ticket_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      vacatures: {
        Row: {
          active: boolean | null
          company: string
          company_logo: string | null
          contact_email: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          requirements: string | null
          sponsor_id: string | null
          title: string
          type: string
          url: string | null
        }
        Insert: {
          active?: boolean | null
          company: string
          company_logo?: string | null
          contact_email?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          sponsor_id?: string | null
          title: string
          type?: string
          url?: string | null
        }
        Update: {
          active?: boolean | null
          company?: string
          company_logo?: string | null
          contact_email?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          sponsor_id?: string | null
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          category: string | null
          coins_amount: number
          created_at: string
          id: string
          member_id: string
          source: string
          source_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          coins_amount: number
          created_at?: string
          id?: string
          member_id: string
          source: string
          source_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          coins_amount?: number
          created_at?: string
          id?: string
          member_id?: string
          source?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_event_ticket: {
        Args: {
          p_email: string
          p_event_id: string
          p_member_id: string
          p_name: string
          p_paid_amount: number
          p_status: string
          p_ticket_number: string
        }
        Returns: {
          checked_in_at: string | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          member_id: string | null
          name: string | null
          paid_amount: number | null
          status: string | null
          stripe_session_id: string | null
          ticket_number: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin:
        | { Args: { check_email: string }; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      purchase_item:
        | {
            Args: { p_accessory_id: string; p_member_id: string }
            Returns: Json
          }
        | {
            Args: {
              p_accessory_id: string
              p_member_id: string
              p_price: number
            }
            Returns: Json
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
