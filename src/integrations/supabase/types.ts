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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          asset_class: string | null
          balance: number | null
          business_unit: string | null
          can_authorize_holders: boolean | null
          can_clawback: boolean | null
          can_create_channels: boolean | null
          can_create_escrows: boolean | null
          can_freeze: boolean | null
          can_issue_tokens: boolean | null
          can_manage_amm: boolean | null
          can_mint_nfts: boolean | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          created_by_name: string | null
          description: string | null
          did_document: string | null
          did_method: string | null
          encrypted_seed: string | null
          expiration_date: string | null
          external_ref_id: string | null
          funded_at: string | null
          id: string
          identity_verified: boolean | null
          is_authorized: boolean
          jurisdiction: string | null
          kyc_binding_id: string | null
          last_synced_at: string | null
          multi_sign_config_id: string | null
          multi_sign_enabled: boolean
          multi_sign_quorum: number | null
          multi_sign_signers: number | null
          name: string
          network: string
          permission_dex_status: string
          project_ids: string[] | null
          public_key: string | null
          purpose_code: string | null
          requires_destination_tag: boolean | null
          review_frequency: string | null
          risk_tier: string | null
          role: string
          status: string
          tags: string[] | null
          vc_issuer_capable: boolean | null
          verifiable_credentials: string[] | null
          xrpl_address: string
        }
        Insert: {
          asset_class?: string | null
          balance?: number | null
          business_unit?: string | null
          can_authorize_holders?: boolean | null
          can_clawback?: boolean | null
          can_create_channels?: boolean | null
          can_create_escrows?: boolean | null
          can_freeze?: boolean | null
          can_issue_tokens?: boolean | null
          can_manage_amm?: boolean | null
          can_mint_nfts?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          created_by_name?: string | null
          description?: string | null
          did_document?: string | null
          did_method?: string | null
          encrypted_seed?: string | null
          expiration_date?: string | null
          external_ref_id?: string | null
          funded_at?: string | null
          id?: string
          identity_verified?: boolean | null
          is_authorized?: boolean
          jurisdiction?: string | null
          kyc_binding_id?: string | null
          last_synced_at?: string | null
          multi_sign_config_id?: string | null
          multi_sign_enabled?: boolean
          multi_sign_quorum?: number | null
          multi_sign_signers?: number | null
          name: string
          network?: string
          permission_dex_status?: string
          project_ids?: string[] | null
          public_key?: string | null
          purpose_code?: string | null
          requires_destination_tag?: boolean | null
          review_frequency?: string | null
          risk_tier?: string | null
          role: string
          status?: string
          tags?: string[] | null
          vc_issuer_capable?: boolean | null
          verifiable_credentials?: string[] | null
          xrpl_address: string
        }
        Update: {
          asset_class?: string | null
          balance?: number | null
          business_unit?: string | null
          can_authorize_holders?: boolean | null
          can_clawback?: boolean | null
          can_create_channels?: boolean | null
          can_create_escrows?: boolean | null
          can_freeze?: boolean | null
          can_issue_tokens?: boolean | null
          can_manage_amm?: boolean | null
          can_mint_nfts?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          created_by_name?: string | null
          description?: string | null
          did_document?: string | null
          did_method?: string | null
          encrypted_seed?: string | null
          expiration_date?: string | null
          external_ref_id?: string | null
          funded_at?: string | null
          id?: string
          identity_verified?: boolean | null
          is_authorized?: boolean
          jurisdiction?: string | null
          kyc_binding_id?: string | null
          last_synced_at?: string | null
          multi_sign_config_id?: string | null
          multi_sign_enabled?: boolean
          multi_sign_quorum?: number | null
          multi_sign_signers?: number | null
          name?: string
          network?: string
          permission_dex_status?: string
          project_ids?: string[] | null
          public_key?: string | null
          purpose_code?: string | null
          requires_destination_tag?: boolean | null
          review_frequency?: string | null
          risk_tier?: string | null
          role?: string
          status?: string
          tags?: string[] | null
          vc_issuer_capable?: boolean | null
          verifiable_credentials?: string[] | null
          xrpl_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "SUPER_ADMIN"
        | "TOKENIZATION_MANAGER"
        | "COMPLIANCE_OFFICER"
        | "CUSTODY_OFFICER"
        | "VALUATION_OFFICER"
        | "FINANCE_OFFICER"
        | "AUDITOR"
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
      app_role: [
        "SUPER_ADMIN",
        "TOKENIZATION_MANAGER",
        "COMPLIANCE_OFFICER",
        "CUSTODY_OFFICER",
        "VALUATION_OFFICER",
        "FINANCE_OFFICER",
        "AUDITOR",
      ],
    },
  },
} as const
