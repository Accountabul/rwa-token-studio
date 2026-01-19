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
      access_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_value: string | null
          permission_code: string | null
          previous_value: string | null
          reason: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          permission_code?: string | null
          previous_value?: string | null
          reason?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          permission_code?: string | null
          previous_value?: string | null
          reason?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      access_requests: {
        Row: {
          expires_at: string | null
          id: string
          justification: string
          requested_at: string
          requested_permission_id: string | null
          requested_role: Database["public"]["Enums"]["app_role"] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          justification: string
          requested_at?: string
          requested_permission_id?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          justification?: string
          requested_at?: string
          requested_permission_id?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_requested_permission_id_fkey"
            columns: ["requested_permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_signatures: {
        Row: {
          approval_id: string
          approved: boolean
          approver_id: string
          approver_name: string
          approver_role: string
          id: string
          notes: string | null
          signed_at: string
        }
        Insert: {
          approval_id: string
          approved: boolean
          approver_id: string
          approver_name: string
          approver_role: string
          id?: string
          notes?: string | null
          signed_at?: string
        }
        Update: {
          approval_id?: string
          approved?: boolean
          approver_id?: string
          approver_name?: string
          approver_role?: string
          id?: string
          notes?: string | null
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_signatures_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_signatures_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_status"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_subscriptions: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          access_profile: string | null
          created_at: string | null
          department: string | null
          email: string
          employment_type: string | null
          end_date: string | null
          expires_at: string | null
          first_name: string
          id: string
          initial_roles: Database["public"]["Enums"]["app_role"][] | null
          invited_at: string | null
          invited_by: string
          job_title: string | null
          justification: string | null
          last_name: string
          manager_id: string | null
          phone: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          access_profile?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employment_type?: string | null
          end_date?: string | null
          expires_at?: string | null
          first_name: string
          id?: string
          initial_roles?: Database["public"]["Enums"]["app_role"][] | null
          invited_at?: string | null
          invited_by: string
          job_title?: string | null
          justification?: string | null
          last_name: string
          manager_id?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          access_profile?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employment_type?: string | null
          end_date?: string | null
          expires_at?: string | null
          first_name?: string
          id?: string
          initial_roles?: Database["public"]["Enums"]["app_role"][] | null
          invited_at?: string | null
          invited_by?: string
          job_title?: string | null
          justification?: string | null
          last_name?: string
          manager_id?: string | null
          phone?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          digest_frequency: string | null
          email_enabled: boolean
          event_type: string
          id: string
          in_app_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_frequency?: string | null
          email_enabled?: boolean
          event_type: string
          id?: string
          in_app_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_frequency?: string | null
          email_enabled?: boolean
          event_type?: string
          id?: string
          in_app_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_name: string
          actor_user_id: string
          archived_at: string | null
          channel: string
          created_at: string
          entity_id: string
          entity_name: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
          priority: string
          read_at: string | null
          recipient_role: Database["public"]["Enums"]["app_role"] | null
          recipient_user_id: string | null
          routing_reason: string
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          actor_name: string
          actor_user_id: string
          archived_at?: string | null
          channel?: string
          created_at?: string
          entity_id: string
          entity_name?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          recipient_user_id?: string | null
          routing_reason: string
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          actor_name?: string
          actor_user_id?: string
          archived_at?: string | null
          channel?: string
          created_at?: string
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient_role?: Database["public"]["Enums"]["app_role"] | null
          recipient_user_id?: string | null
          routing_reason?: string
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      pending_approvals: {
        Row: {
          action_type: string
          created_at: string
          current_approvals: number
          entity_id: string
          entity_name: string | null
          entity_type: string
          executed_at: string | null
          executed_by: string | null
          expires_at: string
          id: string
          payload: Json
          rejection_reason: string | null
          requested_at: string
          requested_by: string
          requested_by_name: string
          requested_by_role: string
          required_approvers: number
          status: string
        }
        Insert: {
          action_type: string
          created_at?: string
          current_approvals?: number
          entity_id: string
          entity_name?: string | null
          entity_type: string
          executed_at?: string | null
          executed_by?: string | null
          expires_at?: string
          id?: string
          payload?: Json
          rejection_reason?: string | null
          requested_at?: string
          requested_by: string
          requested_by_name: string
          requested_by_role: string
          required_approvers?: number
          status?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          current_approvals?: number
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          executed_at?: string | null
          executed_by?: string | null
          expires_at?: string
          id?: string
          payload?: Json
          rejection_reason?: string | null
          requested_at?: string
          requested_by?: string
          requested_by_name?: string
          requested_by_role?: string
          required_approvers?: number
          status?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          requires_approval: boolean
          requires_justification: boolean
          risk_level: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          requires_approval?: boolean
          requires_justification?: boolean
          risk_level?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          requires_approval?: boolean
          requires_justification?: boolean
          risk_level?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          employment_type: string | null
          end_date: string | null
          full_name: string
          id: string
          job_title: string | null
          last_login_at: string | null
          manager_id: string | null
          start_date: string | null
          status: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          employment_type?: string | null
          end_date?: string | null
          full_name: string
          id: string
          job_title?: string | null
          last_login_at?: string | null
          manager_id?: string | null
          start_date?: string | null
          status?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          employment_type?: string | null
          end_date?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          manager_id?: string | null
          start_date?: string | null
          status?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phase_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string
          approved_by_name: string
          approved_by_role: string
          from_status: string
          id: string
          notes: string | null
          project_id: string
          signature_hash: string | null
          to_status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by: string
          approved_by_name: string
          approved_by_role: string
          from_status: string
          id?: string
          notes?: string | null
          project_id: string
          signature_hash?: string | null
          to_status: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string
          approved_by_name?: string
          approved_by_role?: string
          from_status?: string
          id?: string
          notes?: string | null
          project_id?: string
          signature_hash?: string | null
          to_status?: string
        }
        Relationships: []
      }
      project_phase_transitions: {
        Row: {
          created_at: string | null
          description: string | null
          from_status: string
          id: string
          notify_all_users: boolean | null
          notify_assignee: boolean | null
          notify_roles: string[]
          required_approvals: number | null
          required_roles: string[]
          to_status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          from_status: string
          id?: string
          notify_all_users?: boolean | null
          notify_assignee?: boolean | null
          notify_roles: string[]
          required_approvals?: number | null
          required_roles: string[]
          to_status: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          from_status?: string
          id?: string
          notify_all_users?: boolean | null
          notify_assignee?: boolean | null
          notify_roles?: string[]
          required_approvals?: number | null
          required_roles?: string[]
          to_status?: string
        }
        Relationships: []
      }
      role_catalog: {
        Row: {
          backend_access: string[] | null
          category: string
          created_at: string | null
          default_expiration_days: number | null
          display_name: string
          id: string
          is_privileged: boolean | null
          purpose: string
          requires_approval: boolean | null
          restrictions: string[] | null
          role_code: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          backend_access?: string[] | null
          category: string
          created_at?: string | null
          default_expiration_days?: number | null
          display_name: string
          id?: string
          is_privileged?: boolean | null
          purpose: string
          requires_approval?: boolean | null
          restrictions?: string[] | null
          role_code: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          backend_access?: string[] | null
          category?: string
          created_at?: string | null
          default_expiration_days?: number | null
          display_name?: string
          id?: string
          is_privileged?: boolean | null
          purpose?: string
          requires_approval?: boolean | null
          restrictions?: string[] | null
          role_code?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          granted_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          granted_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          granted_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      role_requests: {
        Row: {
          backend_access: string[] | null
          category: string
          created_at: string | null
          created_role: Database["public"]["Enums"]["app_role"] | null
          id: string
          justification: string
          purpose: string
          requested_by: string
          restrictions: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_name: string
          status: string
        }
        Insert: {
          backend_access?: string[] | null
          category: string
          created_at?: string | null
          created_role?: Database["public"]["Enums"]["app_role"] | null
          id?: string
          justification: string
          purpose: string
          requested_by: string
          restrictions?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_name: string
          status?: string
        }
        Update: {
          backend_access?: string[] | null
          category?: string
          created_at?: string | null
          created_role?: Database["public"]["Enums"]["app_role"] | null
          id?: string
          justification?: string
          purpose?: string
          requested_by?: string
          restrictions?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signing_audit_log: {
        Row: {
          amount: number | null
          confirmed_at: string | null
          currency: string | null
          destination: string | null
          destination_name: string | null
          error_message: string | null
          id: string
          key_storage_type: string
          metadata: Json | null
          network: string
          policy_id: string | null
          policy_name: string | null
          rejection_reason: string | null
          requested_by: string
          requested_by_name: string | null
          requested_by_role: string | null
          signed_at: string | null
          status: string
          submitted_at: string | null
          tx_hash: string | null
          tx_type: string
          unsigned_tx_hash: string
          wallet_address: string
          wallet_id: string | null
        }
        Insert: {
          amount?: number | null
          confirmed_at?: string | null
          currency?: string | null
          destination?: string | null
          destination_name?: string | null
          error_message?: string | null
          id?: string
          key_storage_type: string
          metadata?: Json | null
          network: string
          policy_id?: string | null
          policy_name?: string | null
          rejection_reason?: string | null
          requested_by: string
          requested_by_name?: string | null
          requested_by_role?: string | null
          signed_at?: string | null
          status: string
          submitted_at?: string | null
          tx_hash?: string | null
          tx_type: string
          unsigned_tx_hash: string
          wallet_address: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number | null
          confirmed_at?: string | null
          currency?: string | null
          destination?: string | null
          destination_name?: string | null
          error_message?: string | null
          id?: string
          key_storage_type?: string
          metadata?: Json | null
          network?: string
          policy_id?: string | null
          policy_name?: string | null
          rejection_reason?: string | null
          requested_by?: string
          requested_by_name?: string | null
          requested_by_role?: string | null
          signed_at?: string | null
          status?: string
          submitted_at?: string | null
          tx_hash?: string | null
          tx_type?: string
          unsigned_tx_hash?: string
          wallet_address?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signing_audit_log_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "signing_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signing_audit_log_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signing_audit_log_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      signing_policies: {
        Row: {
          allowed_tx_types: string[]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_amount_xrp: number | null
          max_daily_txs: number | null
          min_signers: number | null
          network: string
          policy_name: string
          rate_limit_per_minute: number | null
          requires_multi_sign: boolean | null
          updated_at: string | null
          updated_by: string | null
          wallet_roles: string[]
        }
        Insert: {
          allowed_tx_types?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_amount_xrp?: number | null
          max_daily_txs?: number | null
          min_signers?: number | null
          network: string
          policy_name: string
          rate_limit_per_minute?: number | null
          requires_multi_sign?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          wallet_roles?: string[]
        }
        Update: {
          allowed_tx_types?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_amount_xrp?: number | null
          max_daily_txs?: number | null
          min_signers?: number | null
          network?: string
          policy_name?: string
          rate_limit_per_minute?: number | null
          requires_multi_sign?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          wallet_roles?: string[]
        }
        Relationships: []
      }
      tokenization_projects: {
        Row: {
          asset_class: string | null
          asset_id: string | null
          asset_subclass: string | null
          assigned_to: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          id: string
          jurisdiction: string | null
          mpt_config: Json | null
          name: string
          owner_name: string | null
          planned_token_supply: number | null
          property_address: string | null
          property_nickname: string | null
          status: string
          updated_at: string | null
          valuation_date: string | null
          valuation_usd: number | null
          xls89_metadata: Json | null
        }
        Insert: {
          asset_class?: string | null
          asset_id?: string | null
          asset_subclass?: string | null
          assigned_to?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id: string
          jurisdiction?: string | null
          mpt_config?: Json | null
          name: string
          owner_name?: string | null
          planned_token_supply?: number | null
          property_address?: string | null
          property_nickname?: string | null
          status?: string
          updated_at?: string | null
          valuation_date?: string | null
          valuation_usd?: number | null
          xls89_metadata?: Json | null
        }
        Update: {
          asset_class?: string | null
          asset_id?: string | null
          asset_subclass?: string | null
          assigned_to?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          jurisdiction?: string | null
          mpt_config?: Json | null
          name?: string
          owner_name?: string | null
          planned_token_supply?: number | null
          property_address?: string | null
          property_nickname?: string | null
          status?: string
          updated_at?: string | null
          valuation_date?: string | null
          valuation_usd?: number | null
          xls89_metadata?: Json | null
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
          key_storage_type: string | null
          kyc_binding_id: string | null
          last_synced_at: string | null
          legacy_seed_archived_at: string | null
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
          vault_key_ref: string | null
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
          key_storage_type?: string | null
          kyc_binding_id?: string | null
          last_synced_at?: string | null
          legacy_seed_archived_at?: string | null
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
          vault_key_ref?: string | null
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
          key_storage_type?: string | null
          kyc_binding_id?: string | null
          last_synced_at?: string | null
          legacy_seed_archived_at?: string | null
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
          vault_key_ref?: string | null
          vc_issuer_capable?: boolean | null
          verifiable_credentials?: string[] | null
          xrpl_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      pending_approvals_status: {
        Row: {
          action_type: string | null
          created_at: string | null
          current_approvals: number | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          executed_at: string | null
          executed_by: string | null
          expires_at: string | null
          id: string | null
          rejection_reason: string | null
          requested_at: string | null
          requested_by: string | null
          requested_by_name: string | null
          requested_by_role: string | null
          required_approvers: number | null
          status: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          current_approvals?: number | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          executed_at?: string | null
          executed_by?: string | null
          expires_at?: string | null
          id?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          requested_by_role?: string | null
          required_approvers?: number | null
          status?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          current_approvals?: number | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          executed_at?: string | null
          executed_by?: string | null
          expires_at?: string | null
          id?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          requested_by_role?: string | null
          required_approvers?: number | null
          status?: string | null
        }
        Relationships: []
      }
      wallets_safe: {
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
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          description: string | null
          did_document: string | null
          did_method: string | null
          expiration_date: string | null
          external_ref_id: string | null
          funded_at: string | null
          id: string | null
          identity_verified: boolean | null
          is_authorized: boolean | null
          jurisdiction: string | null
          key_storage_type: string | null
          kyc_binding_id: string | null
          last_synced_at: string | null
          legacy_seed_archived_at: string | null
          multi_sign_config_id: string | null
          multi_sign_enabled: boolean | null
          multi_sign_quorum: number | null
          multi_sign_signers: number | null
          name: string | null
          network: string | null
          permission_dex_status: string | null
          project_ids: string[] | null
          public_key: string | null
          purpose_code: string | null
          requires_destination_tag: boolean | null
          review_frequency: string | null
          risk_tier: string | null
          role: string | null
          status: string | null
          tags: string[] | null
          vault_key_ref: string | null
          vc_issuer_capable: boolean | null
          verifiable_credentials: string[] | null
          xrpl_address: string | null
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
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          did_document?: string | null
          did_method?: string | null
          expiration_date?: string | null
          external_ref_id?: string | null
          funded_at?: string | null
          id?: string | null
          identity_verified?: boolean | null
          is_authorized?: boolean | null
          jurisdiction?: string | null
          key_storage_type?: string | null
          kyc_binding_id?: string | null
          last_synced_at?: string | null
          legacy_seed_archived_at?: string | null
          multi_sign_config_id?: string | null
          multi_sign_enabled?: boolean | null
          multi_sign_quorum?: number | null
          multi_sign_signers?: number | null
          name?: string | null
          network?: string | null
          permission_dex_status?: string | null
          project_ids?: string[] | null
          public_key?: string | null
          purpose_code?: string | null
          requires_destination_tag?: boolean | null
          review_frequency?: string | null
          risk_tier?: string | null
          role?: string | null
          status?: string | null
          tags?: string[] | null
          vault_key_ref?: string | null
          vc_issuer_capable?: boolean | null
          verifiable_credentials?: string[] | null
          xrpl_address?: string | null
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
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          did_document?: string | null
          did_method?: string | null
          expiration_date?: string | null
          external_ref_id?: string | null
          funded_at?: string | null
          id?: string | null
          identity_verified?: boolean | null
          is_authorized?: boolean | null
          jurisdiction?: string | null
          key_storage_type?: string | null
          kyc_binding_id?: string | null
          last_synced_at?: string | null
          legacy_seed_archived_at?: string | null
          multi_sign_config_id?: string | null
          multi_sign_enabled?: boolean | null
          multi_sign_quorum?: number | null
          multi_sign_signers?: number | null
          name?: string | null
          network?: string | null
          permission_dex_status?: string | null
          project_ids?: string[] | null
          public_key?: string | null
          purpose_code?: string | null
          requires_destination_tag?: boolean | null
          review_frequency?: string | null
          risk_tier?: string | null
          role?: string | null
          status?: string | null
          tags?: string[] | null
          vault_key_ref?: string | null
          vc_issuer_capable?: boolean | null
          verifiable_credentials?: string[] | null
          xrpl_address?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_approve: { Args: { _user_id: string }; Returns: boolean }
      can_assign_role: {
        Args: {
          _assigner_id: string
          _target_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      can_manage_employees: { Args: { _user_id: string }; Returns: boolean }
      check_signing_rate_limit: {
        Args: { p_limit_per_minute: number; p_wallet_id: string }
        Returns: boolean
      }
      get_signing_policy: {
        Args: { p_network: string; p_tx_type: string; p_wallet_role: string }
        Returns: {
          max_amount_xrp: number
          min_signers: number
          policy_id: string
          policy_name: string
          rate_limit_per_minute: number
          requires_multi_sign: boolean
        }[]
      }
      get_unread_notification_count: {
        Args: { _user_id: string }
        Returns: number
      }
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
      has_wallet_role: { Args: { _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_system_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notifications_read: {
        Args: { _notification_ids: string[] }
        Returns: undefined
      }
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
        | "HIRING_MANAGER"
        | "SYSTEM_ADMIN"
        | "OPERATIONS_ADMIN"
        | "PROPERTY_OPERATIONS_MANAGER"
        | "INVESTOR_OPERATIONS"
        | "RISK_ANALYST"
        | "ACCOUNTING_MANAGER"
        | "BACKEND_ENGINEER"
        | "PLATFORM_ENGINEER"
        | "SECURITY_ENGINEER"
        | "QA_TEST_ENGINEER"
        | "TECHNICIAN"
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
        "HIRING_MANAGER",
        "SYSTEM_ADMIN",
        "OPERATIONS_ADMIN",
        "PROPERTY_OPERATIONS_MANAGER",
        "INVESTOR_OPERATIONS",
        "RISK_ANALYST",
        "ACCOUNTING_MANAGER",
        "BACKEND_ENGINEER",
        "PLATFORM_ENGINEER",
        "SECURITY_ENGINEER",
        "QA_TEST_ENGINEER",
        "TECHNICIAN",
      ],
    },
  },
} as const
