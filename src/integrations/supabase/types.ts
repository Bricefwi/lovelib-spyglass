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
      admins: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          super_admin: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          super_admin?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          super_admin?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          agent_id: string | null
          agent_version: string | null
          confidence: number | null
          id: string
          input_hash: string | null
          output_hash: string | null
          sources: Json | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          agent_id?: string | null
          agent_version?: string | null
          confidence?: number | null
          id?: string
          input_hash?: string | null
          output_hash?: string | null
          sources?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          agent_id?: string | null
          agent_version?: string | null
          confidence?: number | null
          id?: string
          input_hash?: string | null
          output_hash?: string | null
          sources?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_results: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          kpis: Json | null
          pre_audit_id: string | null
          report_md: string | null
          report_pdf_url: string | null
          scenarios: Json | null
          scores: Json | null
          sources: Json | null
          summary: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          kpis?: Json | null
          pre_audit_id?: string | null
          report_md?: string | null
          report_pdf_url?: string | null
          scenarios?: Json | null
          scores?: Json | null
          sources?: Json | null
          summary?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          kpis?: Json | null
          pre_audit_id?: string | null
          report_md?: string | null
          report_pdf_url?: string | null
          scenarios?: Json | null
          scores?: Json | null
          sources?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_results_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_sources: {
        Row: {
          created_at: string | null
          id: string
          pre_audit_id: string | null
          provider: string
          query: string | null
          reliability: number | null
          snippet: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pre_audit_id?: string | null
          provider: string
          query?: string | null
          reliability?: number | null
          snippet?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pre_audit_id?: string | null
          provider?: string
          query?: string | null
          reliability?: number | null
          snippet?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_sources_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          commercial: Json | null
          completeness_score: number | null
          created_at: string
          id: string
          marketing: Json | null
          mission_id: string
        }
        Insert: {
          commercial?: Json | null
          completeness_score?: number | null
          created_at?: string
          id?: string
          marketing?: Json | null
          mission_id: string
        }
        Update: {
          commercial?: Json | null
          completeness_score?: number | null
          created_at?: string
          id?: string
          marketing?: Json | null
          mission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audits_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_article_tags: {
        Row: {
          article_id: string
          tag_id: number
        }
        Insert: {
          article_id: string
          tag_id: number
        }
        Update: {
          article_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_name: string | null
          author_role: string | null
          category: string | null
          chart_spec: Json | null
          content_md: string
          cover_credit: string | null
          cover_url: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          reliability_score: number | null
          slug: string
          sources: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          chart_spec?: Json | null
          content_md: string
          cover_credit?: string | null
          cover_url?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reliability_score?: number | null
          slug: string
          sources?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          chart_spec?: Json | null
          content_md?: string
          cover_credit?: string | null
          cover_url?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reliability_score?: number | null
          slug?: string
          sources?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_tags: {
        Row: {
          id: number
          tag: string
        }
        Insert: {
          id?: number
          tag: string
        }
        Update: {
          id?: number
          tag?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          allow_index: boolean | null
          company_id: string
          created_at: string
          crm_connected: boolean | null
          crm_type: Database["public"]["Enums"]["crm_type"] | null
          department: string | null
          id: string
          objectives: Json | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_index?: boolean | null
          company_id: string
          created_at?: string
          crm_connected?: boolean | null
          crm_type?: Database["public"]["Enums"]["crm_type"] | null
          department?: string | null
          id?: string
          objectives?: Json | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_index?: boolean | null
          company_id?: string
          created_at?: string
          crm_connected?: boolean | null
          crm_type?: Database["public"]["Enums"]["crm_type"] | null
          department?: string | null
          id?: string
          objectives?: Json | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string
          contact_main: string | null
          country: string
          created_at: string
          description: string | null
          email_contact: string | null
          employees: number | null
          id: string
          industry: string | null
          last_news: Json | null
          name: string
          phone_contact: string | null
          postal_code: string | null
          siren: string | null
          siret: string | null
          socials: Json | null
          tech_stack: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city: string
          contact_main?: string | null
          country?: string
          created_at?: string
          description?: string | null
          email_contact?: string | null
          employees?: number | null
          id?: string
          industry?: string | null
          last_news?: Json | null
          name: string
          phone_contact?: string | null
          postal_code?: string | null
          siren?: string | null
          siret?: string | null
          socials?: Json | null
          tech_stack?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          contact_main?: string | null
          country?: string
          created_at?: string
          description?: string | null
          email_contact?: string | null
          employees?: number | null
          id?: string
          industry?: string | null
          last_news?: Json | null
          name?: string
          phone_contact?: string | null
          postal_code?: string | null
          siren?: string | null
          siret?: string | null
          socials?: Json | null
          tech_stack?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      deltas: {
        Row: {
          client_id: string | null
          created_at: string
          delta_score: number | null
          id: string
          payload: Json
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          delta_score?: number | null
          id?: string
          payload: Json
        }
        Update: {
          client_id?: string | null
          created_at?: string
          delta_score?: number | null
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "deltas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      dept_synthesis: {
        Row: {
          created_at: string
          department: string
          id: string
          mission_id: string
          synthesis: Json | null
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          mission_id: string
          synthesis?: Json | null
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          mission_id?: string
          synthesis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dept_synthesis_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_entries: {
        Row: {
          answer_html: string
          id: string
          order_index: number | null
          question: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          answer_html: string
          id?: string
          order_index?: number | null
          question: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          answer_html?: string
          id?: string
          order_index?: number | null
          question?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          blueprint: Json
          client_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["mission_status"]
          updated_at: string
        }
        Insert: {
          blueprint?: Json
          client_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Update: {
          blueprint?: Json
          client_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_audits: {
        Row: {
          company_guess: string | null
          confidence: number | null
          consolidated: Json | null
          created_at: string | null
          domain: string | null
          id: string
          raw_sources: Json | null
          status: string
          updated_at: string | null
          url: string
        }
        Insert: {
          company_guess?: string | null
          confidence?: number | null
          consolidated?: Json | null
          created_at?: string | null
          domain?: string | null
          id?: string
          raw_sources?: Json | null
          status?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          company_guess?: string | null
          confidence?: number | null
          consolidated?: Json | null
          created_at?: string | null
          domain?: string | null
          id?: string
          raw_sources?: Json | null
          status?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          firstname: string
          gdpr_consent: boolean | null
          id: string
          last_login: string | null
          lastname: string
          oauth_provider: string | null
          oauth_uid: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          firstname: string
          gdpr_consent?: boolean | null
          id?: string
          last_login?: string | null
          lastname: string
          oauth_provider?: string | null
          oauth_uid?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          firstname?: string
          gdpr_consent?: boolean | null
          id?: string
          last_login?: string | null
          lastname?: string
          oauth_provider?: string | null
          oauth_uid?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          client_id: string
          created_at: string
          global_plan: Json | null
          html_url: string | null
          id: string
          intake: Json | null
          marketing: Json | null
          mission_id: string | null
          pdf_url: string | null
          phase: Database["public"]["Enums"]["report_phase"]
          project: Json | null
          sales: Json | null
          scenarios: Json | null
          scope: Json | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          global_plan?: Json | null
          html_url?: string | null
          id?: string
          intake?: Json | null
          marketing?: Json | null
          mission_id?: string | null
          pdf_url?: string | null
          phase: Database["public"]["Enums"]["report_phase"]
          project?: Json | null
          sales?: Json | null
          scenarios?: Json | null
          scope?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          global_plan?: Json | null
          html_url?: string | null
          id?: string
          intake?: Json | null
          marketing?: Json | null
          mission_id?: string | null
          pdf_url?: string | null
          phase?: Database["public"]["Enums"]["report_phase"]
          project?: Json | null
          sales?: Json | null
          scenarios?: Json | null
          scope?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_index: {
        Row: {
          id: string
          keywords: string[] | null
          language: string | null
          summary: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          id?: string
          keywords?: string[] | null
          language?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          id?: string
          keywords?: string[] | null
          language?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "consultant" | "client"
      crm_type: "hubspot" | "pipedrive" | "salesforce" | "other"
      mission_status:
        | "initiated"
        | "in_audit"
        | "planning"
        | "execution"
        | "closed"
      report_phase:
        | "pre_audit"
        | "strategy"
        | "marketing"
        | "sales"
        | "synthesis"
        | "project"
      report_status: "draft" | "in_progress" | "completed" | "archived"
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
      app_role: ["admin", "consultant", "client"],
      crm_type: ["hubspot", "pipedrive", "salesforce", "other"],
      mission_status: [
        "initiated",
        "in_audit",
        "planning",
        "execution",
        "closed",
      ],
      report_phase: [
        "pre_audit",
        "strategy",
        "marketing",
        "sales",
        "synthesis",
        "project",
      ],
      report_status: ["draft", "in_progress", "completed", "archived"],
    },
  },
} as const
