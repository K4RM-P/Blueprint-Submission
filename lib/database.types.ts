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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          criterion_type: string
          description: string
          icon: string
          id: string
          name: string
          slug: string
          threshold: number
        }
        Insert: {
          created_at?: string
          criterion_type: string
          description: string
          icon: string
          id?: string
          name: string
          slug: string
          threshold?: number
        }
        Update: {
          created_at?: string
          criterion_type?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          threshold?: number
        }
        Relationships: []
      }
      batch_line_items: {
        Row: {
          approx_year: number | null
          batch_id: string
          category: Database["public"]["Enums"]["device_category"]
          condition: Database["public"]["Enums"]["device_condition"]
          created_at: string
          id: string
          make: string
          model: string
          quantity: number
        }
        Insert: {
          approx_year?: number | null
          batch_id: string
          category: Database["public"]["Enums"]["device_category"]
          condition?: Database["public"]["Enums"]["device_condition"]
          created_at?: string
          id?: string
          make: string
          model: string
          quantity: number
        }
        Update: {
          approx_year?: number | null
          batch_id?: string
          category?: Database["public"]["Enums"]["device_category"]
          condition?: Database["public"]["Enums"]["device_condition"]
          created_at?: string
          id?: string
          make?: string
          model?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_line_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "donation_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          batch_id: string
          certificate_number: string
          created_at: string
          device_count: number
          id: string
          issued_at: string
          issued_by: string | null
          organization_id: string
          pdf_path: string | null
        }
        Insert: {
          batch_id: string
          certificate_number: string
          created_at?: string
          device_count: number
          id?: string
          issued_at?: string
          issued_by?: string | null
          organization_id: string
          pdf_path?: string | null
        }
        Update: {
          batch_id?: string
          certificate_number?: string
          created_at?: string
          device_count?: number
          id?: string
          issued_at?: string
          issued_by?: string | null
          organization_id?: string
          pdf_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: true
            referencedRelation: "donation_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checker_logs: {
        Row: {
          category: Database["public"]["Enums"]["device_category"]
          created_at: string
          id: string
          is_business: boolean
          outcome: Database["public"]["Enums"]["checker_outcome"]
        }
        Insert: {
          category: Database["public"]["Enums"]["device_category"]
          created_at?: string
          id?: string
          is_business?: boolean
          outcome: Database["public"]["Enums"]["checker_outcome"]
        }
        Update: {
          category?: Database["public"]["Enums"]["device_category"]
          created_at?: string
          id?: string
          is_business?: boolean
          outcome?: Database["public"]["Enums"]["checker_outcome"]
        }
        Relationships: []
      }
      device_events: {
        Row: {
          actor_id: string | null
          created_at: string
          device_id: string
          event_type: Database["public"]["Enums"]["event_type"]
          from_status: Database["public"]["Enums"]["device_status"] | null
          id: string
          metadata: Json
          note: string | null
          step: Database["public"]["Enums"]["checklist_step"] | null
          to_status: Database["public"]["Enums"]["device_status"] | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          device_id: string
          event_type: Database["public"]["Enums"]["event_type"]
          from_status?: Database["public"]["Enums"]["device_status"] | null
          id?: string
          metadata?: Json
          note?: string | null
          step?: Database["public"]["Enums"]["checklist_step"] | null
          to_status?: Database["public"]["Enums"]["device_status"] | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          device_id?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          from_status?: Database["public"]["Enums"]["device_status"] | null
          id?: string
          metadata?: Json
          note?: string | null
          step?: Database["public"]["Enums"]["checklist_step"] | null
          to_status?: Database["public"]["Enums"]["device_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "device_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          approx_year: number | null
          assigned_volunteer_id: string | null
          batch_id: string | null
          category: Database["public"]["Enums"]["device_category"]
          cpu: string | null
          created_at: string
          id: string
          is_open_source_os: boolean | null
          line_item_id: string | null
          make: string
          model: string
          os_installed: string | null
          passport_code: string
          passport_views: number
          pif_subsidy_cents: number
          price_cents: number | null
          ram_gb: number | null
          recipient_category:
            | Database["public"]["Enums"]["recipient_category"]
            | null
          recycled_reason: string | null
          refurbished_at: string | null
          refurbished_by: string | null
          sale_channel: Database["public"]["Enums"]["sale_channel"] | null
          serial_number: string | null
          sold_at: string | null
          source: Database["public"]["Enums"]["device_source"]
          status: Database["public"]["Enums"]["device_status"]
          storage_gb: number | null
          updated_at: string
          weight_kg: number | null
          wipe_method: string | null
          wipe_performed_at: string | null
          wipe_performed_by: string | null
          wipe_report_ref: string | null
          wipe_verified_at: string | null
          wipe_verified_by: string | null
        }
        Insert: {
          approx_year?: number | null
          assigned_volunteer_id?: string | null
          batch_id?: string | null
          category: Database["public"]["Enums"]["device_category"]
          cpu?: string | null
          created_at?: string
          id?: string
          is_open_source_os?: boolean | null
          line_item_id?: string | null
          make: string
          model: string
          os_installed?: string | null
          passport_code: string
          passport_views?: number
          pif_subsidy_cents?: number
          price_cents?: number | null
          ram_gb?: number | null
          recipient_category?:
            | Database["public"]["Enums"]["recipient_category"]
            | null
          recycled_reason?: string | null
          refurbished_at?: string | null
          refurbished_by?: string | null
          sale_channel?: Database["public"]["Enums"]["sale_channel"] | null
          serial_number?: string | null
          sold_at?: string | null
          source: Database["public"]["Enums"]["device_source"]
          status?: Database["public"]["Enums"]["device_status"]
          storage_gb?: number | null
          updated_at?: string
          weight_kg?: number | null
          wipe_method?: string | null
          wipe_performed_at?: string | null
          wipe_performed_by?: string | null
          wipe_report_ref?: string | null
          wipe_verified_at?: string | null
          wipe_verified_by?: string | null
        }
        Update: {
          approx_year?: number | null
          assigned_volunteer_id?: string | null
          batch_id?: string | null
          category?: Database["public"]["Enums"]["device_category"]
          cpu?: string | null
          created_at?: string
          id?: string
          is_open_source_os?: boolean | null
          line_item_id?: string | null
          make?: string
          model?: string
          os_installed?: string | null
          passport_code?: string
          passport_views?: number
          pif_subsidy_cents?: number
          price_cents?: number | null
          ram_gb?: number | null
          recipient_category?:
            | Database["public"]["Enums"]["recipient_category"]
            | null
          recycled_reason?: string | null
          refurbished_at?: string | null
          refurbished_by?: string | null
          sale_channel?: Database["public"]["Enums"]["sale_channel"] | null
          serial_number?: string | null
          sold_at?: string | null
          source?: Database["public"]["Enums"]["device_source"]
          status?: Database["public"]["Enums"]["device_status"]
          storage_gb?: number | null
          updated_at?: string
          weight_kg?: number | null
          wipe_method?: string | null
          wipe_performed_at?: string | null
          wipe_performed_by?: string | null
          wipe_report_ref?: string | null
          wipe_verified_at?: string | null
          wipe_verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_assigned_volunteer_id_fkey"
            columns: ["assigned_volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "donation_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "batch_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_refurbished_by_fkey"
            columns: ["refurbished_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_wipe_performed_by_fkey"
            columns: ["wipe_performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_wipe_verified_by_fkey"
            columns: ["wipe_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          data_handling_ack: boolean
          decline_reason: string | null
          id: string
          logistics: Database["public"]["Enums"]["logistics_type"]
          notes: string | null
          organization_id: string
          pickup_address: string | null
          preferred_week: string
          received_at: string | null
          schedule_override_note: string | null
          scheduled_week: string | null
          status: Database["public"]["Enums"]["batch_status"]
          submitted_by: string | null
          value_score: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_handling_ack?: boolean
          decline_reason?: string | null
          id?: string
          logistics?: Database["public"]["Enums"]["logistics_type"]
          notes?: string | null
          organization_id: string
          pickup_address?: string | null
          preferred_week: string
          received_at?: string | null
          schedule_override_note?: string | null
          scheduled_week?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          submitted_by?: string | null
          value_score?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_handling_ack?: boolean
          decline_reason?: string | null
          id?: string
          logistics?: Database["public"]["Enums"]["logistics_type"]
          notes?: string | null
          organization_id?: string
          pickup_address?: string | null
          preferred_week?: string
          received_at?: string | null
          schedule_override_note?: string | null
          scheduled_week?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          submitted_by?: string | null
          value_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "donation_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_batches_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          device_id: string | null
          id: string
          note: string | null
          organization_id: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref: string | null
          type: Database["public"]["Enums"]["fund_tx_type"]
        }
        Insert: {
          amount_cents: number
          created_at?: string
          device_id?: string | null
          id?: string
          note?: string | null
          organization_id?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          type: Database["public"]["Enums"]["fund_tx_type"]
        }
        Update: {
          amount_cents?: number
          created_at?: string
          device_id?: string | null
          id?: string
          note?: string | null
          organization_id?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          type?: Database["public"]["Enums"]["fund_tx_type"]
        }
        Relationships: [
          {
            foreignKeyName: "fund_transactions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_factors: {
        Row: {
          avg_weight_kg: number
          category: Database["public"]["Enums"]["device_category"]
          co2e_avoided_kg_per_reuse: number
          created_at: string
          id: string
          last_reviewed: string | null
          source_title: string
          source_url: string | null
        }
        Insert: {
          avg_weight_kg: number
          category: Database["public"]["Enums"]["device_category"]
          co2e_avoided_kg_per_reuse: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          source_title?: string
          source_url?: string | null
        }
        Update: {
          avg_weight_kg?: number
          category?: Database["public"]["Enums"]["device_category"]
          co2e_avoided_kg_per_reuse?: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          source_title?: string
          source_url?: string | null
        }
        Relationships: []
      }
      membership_payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          organization_id: string
          period_end: string
          period_start: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref: string | null
          tier: Database["public"]["Enums"]["partner_tier"]
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          organization_id: string
          period_end: string
          period_start: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          tier: Database["public"]["Enums"]["partner_tier"]
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_ref?: string | null
          tier?: Database["public"]["Enums"]["partner_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "membership_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          employee_range: string | null
          id: string
          industry: string | null
          logo_path: string | null
          membership_expires_at: string | null
          membership_started_at: string | null
          name: string
          owner_id: string | null
          passport_attribution_opt_in: boolean
          slug: string
          tier: Database["public"]["Enums"]["partner_tier"]
          wall_opt_in: boolean
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          employee_range?: string | null
          id?: string
          industry?: string | null
          logo_path?: string | null
          membership_expires_at?: string | null
          membership_started_at?: string | null
          name: string
          owner_id?: string | null
          passport_attribution_opt_in?: boolean
          slug: string
          tier?: Database["public"]["Enums"]["partner_tier"]
          wall_opt_in?: boolean
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          employee_range?: string | null
          id?: string
          industry?: string | null
          logo_path?: string | null
          membership_expires_at?: string | null
          membership_started_at?: string | null
          name?: string
          owner_id?: string | null
          passport_attribution_opt_in?: boolean
          slug?: string
          tier?: Database["public"]["Enums"]["partner_tier"]
          wall_opt_in?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_fk"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          attribution_opt_in: boolean
          created_at: string
          display_first_name: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          public_handle: string | null
          public_profile_opt_in: boolean
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          attribution_opt_in?: boolean
          created_at?: string
          display_first_name?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          public_handle?: string | null
          public_profile_opt_in?: boolean
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          attribution_opt_in?: boolean
          created_at?: string
          display_first_name?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          public_handle?: string | null
          public_profile_opt_in?: boolean
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          accepted_items: Json
          batch_score_weights: Json
          created_at: string
          id: number
          max_device_age_years: number
          price_breakdown: Json
          price_breakdown_confirmed: boolean
          refurb_minutes_mixed: number
          refurb_minutes_uniform: number
          weekly_capacity_devices: number
        }
        Insert: {
          accepted_items?: Json
          batch_score_weights?: Json
          created_at?: string
          id?: number
          max_device_age_years?: number
          price_breakdown?: Json
          price_breakdown_confirmed?: boolean
          refurb_minutes_mixed?: number
          refurb_minutes_uniform?: number
          weekly_capacity_devices?: number
        }
        Update: {
          accepted_items?: Json
          batch_score_weights?: Json
          created_at?: string
          id?: number
          max_device_age_years?: number
          price_breakdown?: Json
          price_breakdown_confirmed?: boolean
          refurb_minutes_mixed?: number
          refurb_minutes_uniform?: number
          weekly_capacity_devices?: number
        }
        Relationships: []
      }
      volunteer_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_id: string
          created_at: string
          id: string
          volunteer_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id: string
          created_at?: string
          id?: string
          volunteer_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id?: string
          created_at?: string
          id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_badges_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_badges_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_org_id: { Args: never; Returns: string }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      batch_transition_ok: {
        Args: {
          p_from: Database["public"]["Enums"]["batch_status"]
          p_to: Database["public"]["Enums"]["batch_status"]
        }
        Returns: boolean
      }
      bench_queue: {
        Args: { p_limit?: number }
        Returns: {
          approx_year: number
          category: Database["public"]["Enums"]["device_category"]
          created_at: string
          id: string
          make: string
          model: string
          passport_code: string
          source: Database["public"]["Enums"]["device_source"]
          value_score: number
        }[]
      }
      claim_next_device: { Args: never; Returns: string }
      complete_step: {
        Args: {
          p_device: string
          p_note?: string
          p_open_source?: boolean
          p_os?: string
          p_report_ref?: string
          p_step: Database["public"]["Enums"]["checklist_step"]
          p_wipe_method?: string
        }
        Returns: Json
      }
      device_transition_ok: {
        Args: {
          p_from: Database["public"]["Enums"]["device_status"]
          p_to: Database["public"]["Enums"]["device_status"]
        }
        Returns: boolean
      }
      get_passport: { Args: { p_code: string }; Returns: Json }
      is_staff: { Args: never; Returns: boolean }
      log_checker: {
        Args: {
          p_category: Database["public"]["Enums"]["device_category"]
          p_is_business: boolean
          p_outcome: Database["public"]["Enums"]["checker_outcome"]
        }
        Returns: undefined
      }
      maybe_complete_batch: { Args: { p_batch: string }; Returns: undefined }
      my_volunteer_stats: { Args: never; Returns: Json }
      partner_devices: {
        Args: { p_batch?: string }
        Returns: {
          approx_year: number
          batch_id: string
          category: Database["public"]["Enums"]["device_category"]
          created_at: string
          id: string
          line_item_id: string
          line_quantity: number
          make: string
          model: string
          passport_code: string
          received_at: string
          recipient_category: Database["public"]["Enums"]["recipient_category"]
          refurbished_at: string
          serial_number: string
          sold_at: string
          status: Database["public"]["Enums"]["device_status"]
          weight_kg: number
          wipe_method: string
          wipe_verified_at: string
        }[]
      }
      partner_wall: {
        Args: never
        Returns: {
          devices_received: number
          devices_reused: number
          logo_path: string
          name: string
          partner_since: string
          slug: string
          tier: Database["public"]["Enums"]["partner_tier"]
        }[]
      }
      public_fund_summary: { Args: never; Returns: Json }
      public_impact_totals: { Args: never; Returns: Json }
      public_settings: { Args: never; Returns: Json }
      public_volunteer_profile: { Args: { p_handle: string }; Returns: Json }
      slugify: { Args: { p: string }; Returns: string }
      verify_certificate: { Args: { p_number: string }; Returns: Json }
      volunteer_qualifies: { Args: { p_badge: string }; Returns: boolean }
      volunteer_stats: { Args: { p_volunteer: string }; Returns: Json }
      week_loads: {
        Args: { p_from: string; p_to: string }
        Returns: {
          devices: number
          week: string
        }[]
      }
    }
    Enums: {
      batch_status:
        | "submitted"
        | "approved"
        | "declined"
        | "scheduled"
        | "received"
        | "in_refurbishment"
        | "completed"
      checker_outcome:
        | "accepted"
        | "recycling_only"
        | "not_accepted"
        | "partner_redirect"
      checklist_step:
        | "hardware_test"
        | "wipe_performed"
        | "wipe_verified"
        | "os_installed"
        | "final_qa"
      device_category:
        | "laptop"
        | "desktop"
        | "monitor"
        | "tablet"
        | "accessory"
        | "other"
      device_condition:
        | "working"
        | "partially_working"
        | "not_working"
        | "unknown"
      device_source: "partner" | "household"
      device_status:
        | "received"
        | "testing"
        | "wipe_pending_verification"
        | "wipe_verified"
        | "refurbishing"
        | "ready"
        | "listed"
        | "sold"
        | "recycled"
      event_type:
        | "status_change"
        | "step_completed"
        | "assigned"
        | "note"
        | "sale"
        | "subsidy"
      fund_tx_type: "contribution" | "subsidy" | "sponsorship"
      logistics_type: "dropoff" | "pickup"
      partner_tier: "community" | "impact" | "champion"
      payment_provider: "stripe" | "mock" | "manual"
      recipient_category:
        | "student"
        | "newcomer"
        | "senior"
        | "low_income_household"
        | "nonprofit"
        | "small_business"
        | "general"
        | "undisclosed"
      sale_channel: "in_store" | "online" | "b2b"
      user_role: "partner" | "staff" | "volunteer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      batch_status: [
        "submitted",
        "approved",
        "declined",
        "scheduled",
        "received",
        "in_refurbishment",
        "completed",
      ],
      checker_outcome: [
        "accepted",
        "recycling_only",
        "not_accepted",
        "partner_redirect",
      ],
      checklist_step: [
        "hardware_test",
        "wipe_performed",
        "wipe_verified",
        "os_installed",
        "final_qa",
      ],
      device_category: [
        "laptop",
        "desktop",
        "monitor",
        "tablet",
        "accessory",
        "other",
      ],
      device_condition: [
        "working",
        "partially_working",
        "not_working",
        "unknown",
      ],
      device_source: ["partner", "household"],
      device_status: [
        "received",
        "testing",
        "wipe_pending_verification",
        "wipe_verified",
        "refurbishing",
        "ready",
        "listed",
        "sold",
        "recycled",
      ],
      event_type: [
        "status_change",
        "step_completed",
        "assigned",
        "note",
        "sale",
        "subsidy",
      ],
      fund_tx_type: ["contribution", "subsidy", "sponsorship"],
      logistics_type: ["dropoff", "pickup"],
      partner_tier: ["community", "impact", "champion"],
      payment_provider: ["stripe", "mock", "manual"],
      recipient_category: [
        "student",
        "newcomer",
        "senior",
        "low_income_household",
        "nonprofit",
        "small_business",
        "general",
        "undisclosed",
      ],
      sale_channel: ["in_store", "online", "b2b"],
      user_role: ["partner", "staff", "volunteer"],
    },
  },
} as const
