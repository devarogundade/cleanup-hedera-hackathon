export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string;
          description: string;
          icon: string;
          id: string;
          rarity: string;
          requirement_type: string;
          requirement_value: number;
          title: string;
          xp: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          icon: string;
          id: string;
          rarity: string;
          requirement_type: string;
          requirement_value: number;
          title: string;
          xp: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          icon?: string;
          id?: string;
          rarity?: string;
          requirement_type?: string;
          requirement_value?: number;
          title?: string;
          xp?: number;
        };
        Relationships: [];
      };
      fractions: {
        Row: {
          created_at: string;
          donated: boolean;
          donor_id: string | null;
          id: number;
          position: number;
          not_allowed: boolean;
          round_id: number;
          token_id: number | null;
          transaction_id: string | null;
        };
        Insert: {
          created_at?: string;
          donated?: boolean;
          donor_id?: string | null;
          id?: number;
          position?: number;
          not_allowed?: boolean;
          round_id: number;
          token_id?: number | null;
          transaction_id?: string | null;
        };
        Update: {
          created_at?: string;
          donated?: boolean;
          donor_id?: string | null;
          id?: number;
          position?: number;
          not_allowed?: boolean;
          round_id?: number;
          token_id?: number | null;
          transaction_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fractions_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fractions_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          }
        ];
      };
      galleries: {
        Row: {
          caption: string | null;
          created_at: string | null;
          display_order: number | null;
          id: string;
          image_url: string;
          location: string | null;
          round_id: number;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url: string;
          location?: string | null;
          round_id: number;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string;
          location?: string | null;
          round_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "galleries_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          }
        ];
      };
      ngo_votes: {
        Row: {
          created_at: string;
          donation_id: string;
          id: string;
          ngo_id: string;
          round_id: number;
          user_id: string;
          voting_power: number;
        };
        Insert: {
          created_at?: string;
          donation_id: string;
          id?: string;
          ngo_id: string;
          round_id: number;
          user_id: string;
          voting_power: number;
        };
        Update: {
          created_at?: string;
          donation_id?: string;
          id?: string;
          ngo_id?: number;
          round_id?: number;
          user_id?: string;
          voting_power?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ngo_votes_donation_id_fkey";
            columns: ["donation_id"];
            isOneToOne: true;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ngo_votes_ngo_id_fkey";
            columns: ["ngo_id"];
            isOneToOne: false;
            referencedRelation: "ngos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ngo_votes_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ngo_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["account_id"];
          }
        ];
      };
      ngos: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          logo: string;
          name: string;
          website: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id: string;
          logo: string;
          name: string;
          website: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          logo?: string;
          name?: string;
          website?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          account_id: string;
          avatar_url: string | null;
          created_at: string;
          current_streak: number;
          level: number;
          total_claimed_rewards: number;
          total_donation_value: number;
          total_donations: number;
          total_fractions: number;
          total_nfts: number;
          total_rewards: number;
          total_rewards_value: number;
          total_xp: number;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          account_id: string;
          avatar_url?: string | null;
          created_at?: string;
          current_streak?: number;
          level?: number;
          total_claimed_rewards?: number;
          total_donation_value?: number;
          total_donations?: number;
          total_fractions?: number;
          total_nfts?: number;
          total_rewards?: number;
          total_rewards_value?: number;
          total_xp?: number;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          account_id?: string;
          avatar_url?: string | null;
          created_at?: string;
          current_streak?: number;
          level?: number;
          total_claimed_rewards?: number;
          total_donation_value?: number;
          total_donations?: number;
          total_fractions?: number;
          total_nfts?: number;
          total_rewards?: number;
          total_rewards_value?: number;
          total_xp?: number;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          created_at: string;
          description: string;
          icon: string | null;
          id: number;
          rarity: string | null;
          requirement_level: number | null;
          requirement_xp: number | null;
          title: string;
          type: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          icon?: string | null;
          id?: number;
          rarity?: string | null;
          requirement_level?: number | null;
          requirement_xp?: number | null;
          title: string;
          type: string;
          value: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          icon?: string | null;
          id?: number;
          rarity?: string | null;
          requirement_level?: number | null;
          requirement_xp?: number | null;
          title?: string;
          type?: string;
          value?: string;
        };
        Relationships: [];
      };
      rounds: {
        Row: {
          contract_id: string | null;
          created_at: string;
          donated_fractions: number;
          end_date: string;
          id: number;
          image_url: string | null;
          location_coordinates: string;
          location_description: string | null;
          location_name: string;
          participant_count: number;
          start_date: string;
          total_amount: number;
          total_donations: number;
          total_fractions: number;
          total_votes: number;
          total_withdrawals: number;
          type: string;
          unit_value: number | null;
          winning_ngo_id: number | null;
        };
        Insert: {
          contract_id?: string | null;
          created_at?: string;
          donated_fractions?: number;
          end_date: string;
          id: number;
          image_url?: string | null;
          location_coordinates: string;
          location_description?: string | null;
          location_name: string;
          participant_count?: number;
          start_date: string;
          total_amount?: number;
          total_donations?: number;
          total_fractions?: number;
          total_votes?: number;
          total_withdrawals?: number;
          type: string;
          unit_value?: number | null;
          winning_ngo_id?: number | null;
        };
        Update: {
          contract_id?: string | null;
          created_at?: string;
          donated_fractions?: number;
          end_date?: string;
          id?: number;
          image_url?: string | null;
          location_coordinates?: string;
          location_description?: string | null;
          location_name?: string;
          participant_count?: number;
          start_date?: string;
          total_amount?: number;
          total_donations?: number;
          total_fractions?: number;
          total_votes?: number;
          total_withdrawals?: number;
          type?: string;
          unit_value?: number | null;
          winning_ngo_id?: number | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          amount_in_hbar: number;
          amount_in_ngn: number;
          created_at: string;
          currency: string;
          fraction_ids: number[];
          id: string;
          message: string | null;
          nft_token_ids: string[] | null;
          ngo_id: string;
          round_id: number;
          status: string;
          transaction_hash: string;
          type: string;
          user_id: string;
          voting_power: number;
          xp_earned: number;
        };
        Insert: {
          amount: number;
          amount_in_hbar: number;
          amount_in_ngn: number;
          created_at?: string;
          currency: string;
          fraction_ids: number[];
          id?: string;
          message?: string | null;
          nft_token_ids?: string[] | null;
          ngo_id: string;
          round_id: number;
          status?: string;
          transaction_hash: string;
          type?: string;
          user_id: string;
          voting_power: number;
          xp_earned: number;
        };
        Update: {
          amount?: number;
          amount_in_hbar?: number;
          amount_in_ngn?: number;
          created_at?: string;
          currency?: string;
          fraction_ids?: number[];
          id?: string;
          message?: string | null;
          nft_token_ids?: string[] | null;
          ngo_id?: number;
          round_id?: number;
          status?: string;
          transaction_hash?: string;
          type?: string;
          user_id?: string;
          voting_power?: number;
          xp_earned?: number;
        };
        Relationships: [
          {
            foreignKeyName: "donations_ngo_id_fkey";
            columns: ["ngo_id"];
            isOneToOne: false;
            referencedRelation: "ngos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donations_round_id_fkey";
            columns: ["round_id"];
            isOneToOne: false;
            referencedRelation: "rounds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["account_id"];
          }
        ];
      };
      user_achievements: {
        Row: {
          achievement_id: string;
          created_at: string;
          id: string;
          progress_current: number;
          progress_total: number;
          unlocked_at: string | null;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          created_at?: string;
          id?: string;
          progress_current?: number;
          progress_total: number;
          unlocked_at?: string | null;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          created_at?: string;
          id?: string;
          progress_current?: number;
          progress_total?: number;
          unlocked_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["account_id"];
          }
        ];
      };
      user_rewards: {
        Row: {
          claimed_date: string | null;
          created_at: string;
          earned_date: string | null;
          id: string;
          progress_current: number;
          progress_total: number;
          reward_id: number;
          status: string;
          user_id: string;
        };
        Insert: {
          claimed_date?: string | null;
          created_at?: string;
          earned_date?: string | null;
          id?: string;
          progress_current?: number;
          progress_total: number;
          reward_id: number;
          status?: string;
          user_id: string;
        };
        Update: {
          claimed_date?: string | null;
          created_at?: string;
          earned_date?: string | null;
          id?: string;
          progress_current?: number;
          progress_total?: number;
          reward_id?: number;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey";
            columns: ["reward_id"];
            isOneToOne: false;
            referencedRelation: "rewards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["account_id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_guest_profile: { Args: never; Returns: string };
      increment_profile_stats: {
        Args: {
          donation_amount: number;
          fraction_amount: number;
          nft_amount: number;
          profile_id: string;
          xp_amount: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
