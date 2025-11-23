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
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
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
      agent_orchestrations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_phase: string | null
          error: string | null
          id: string
          manus_execution_id: string | null
          phases: Json | null
          pre_audit_id: string | null
          progress: number | null
          results: Json | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_phase?: string | null
          error?: string | null
          id?: string
          manus_execution_id?: string | null
          phases?: Json | null
          pre_audit_id?: string | null
          progress?: number | null
          results?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_phase?: string | null
          error?: string | null
          id?: string
          manus_execution_id?: string | null
          phases?: Json | null
          pre_audit_id?: string | null
          progress?: number | null
          results?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_orchestrations_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_orchestrations_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "v_admin_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_phases: {
        Row: {
          agents: Json | null
          completed_at: string | null
          created_at: string | null
          error: string | null
          id: string
          orchestration_id: string | null
          phase_name: string
          phase_order: number
          results: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          agents?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          orchestration_id?: string | null
          phase_name: string
          phase_order: number
          results?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          agents?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          orchestration_id?: string | null
          phase_name?: string
          phase_order?: number
          results?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_phases_orchestration_id_fkey"
            columns: ["orchestration_id"]
            isOneToOne: false
            referencedRelation: "agent_orchestrations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_results: {
        Row: {
          agent_name: string
          agent_type: string
          completed_at: string | null
          confidence: number | null
          created_at: string | null
          duration_ms: number | null
          error: string | null
          id: string
          input: Json | null
          output: Json | null
          phase_id: string | null
          sources: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          agent_name: string
          agent_type: string
          completed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          phase_id?: string | null
          sources?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          completed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          phase_id?: string | null
          sources?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_results_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "agent_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_news_reports: {
        Row: {
          created_at: string
          date: string
          html_content: string | null
          id: string
          recommendations: Json
          summary: string
          top_news: Json
          trends: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          html_content?: string | null
          id?: string
          recommendations?: Json
          summary: string
          top_news?: Json
          trends?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          html_content?: string | null
          id?: string
          recommendations?: Json
          summary?: string
          top_news?: Json
          trends?: Json
          updated_at?: string
        }
        Relationships: []
      }
      audit_access_control: {
        Row: {
          allowed: boolean
          created_at: string | null
          denial_reason: string | null
          free_audits_remaining: number | null
          id: string
          ip_address: string | null
          trust_score: number | null
          user_id: string | null
        }
        Insert: {
          allowed: boolean
          created_at?: string | null
          denial_reason?: string | null
          free_audits_remaining?: number | null
          id?: string
          ip_address?: string | null
          trust_score?: number | null
          user_id?: string | null
        }
        Update: {
          allowed?: boolean
          created_at?: string | null
          denial_reason?: string | null
          free_audits_remaining?: number | null
          id?: string
          ip_address?: string | null
          trust_score?: number | null
          user_id?: string | null
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
      audit_reports: {
        Row: {
          content: Json | null
          created_at: string | null
          created_by: string | null
          html: string | null
          id: string
          pre_audit_id: string | null
          report_type: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          html?: string | null
          id?: string
          pre_audit_id?: string | null
          report_type?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          html?: string | null
          id?: string
          pre_audit_id?: string | null
          report_type?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_reports_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_reports_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "v_admin_audits"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "audit_results_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "v_admin_audits"
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
          {
            foreignKeyName: "audit_sources_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "v_admin_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_steps: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          message: string | null
          pre_audit_id: string
          started_at: string | null
          status: string
          step: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          message?: string | null
          pre_audit_id: string
          started_at?: string | null
          status: string
          step: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          message?: string | null
          pre_audit_id?: string
          started_at?: string | null
          status?: string
          step?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_steps_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_steps_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: false
            referencedRelation: "v_admin_audits"
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
          employee_count: number | null
          employees: number | null
          financials: Json | null
          ia_usage: Json | null
          id: string
          industry: string | null
          last_news: Json | null
          marketing_channels: Json | null
          name: string
          phone_contact: string | null
          postal_code: string | null
          revenue_estimate: string | null
          siren: string | null
          siret: string | null
          size_estimate: string | null
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
          employee_count?: number | null
          employees?: number | null
          financials?: Json | null
          ia_usage?: Json | null
          id?: string
          industry?: string | null
          last_news?: Json | null
          marketing_channels?: Json | null
          name: string
          phone_contact?: string | null
          postal_code?: string | null
          revenue_estimate?: string | null
          siren?: string | null
          siret?: string | null
          size_estimate?: string | null
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
          employee_count?: number | null
          employees?: number | null
          financials?: Json | null
          ia_usage?: Json | null
          id?: string
          industry?: string | null
          last_news?: Json | null
          marketing_channels?: Json | null
          name?: string
          phone_contact?: string | null
          postal_code?: string | null
          revenue_estimate?: string | null
          siren?: string | null
          siret?: string | null
          size_estimate?: string | null
          socials?: Json | null
          tech_stack?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_audits: {
        Row: {
          audit_result_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          pre_audit_id: string | null
        }
        Insert: {
          audit_result_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          pre_audit_id?: string | null
        }
        Update: {
          audit_result_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          pre_audit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_audits_audit_result_id_fkey"
            columns: ["audit_result_id"]
            isOneToOne: false
            referencedRelation: "audit_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_audits_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: true
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_audits_pre_audit_id_fkey"
            columns: ["pre_audit_id"]
            isOneToOne: true
            referencedRelation: "v_admin_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      company_verification_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          legal_name: string | null
          siret: string
          user_agent: string | null
          user_id: string | null
          verification_method: string | null
          verification_result: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          legal_name?: string | null
          siret: string
          user_agent?: string | null
          user_id?: string | null
          verification_method?: string | null
          verification_result: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          legal_name?: string | null
          siret?: string
          user_agent?: string | null
          user_id?: string | null
          verification_method?: string | null
          verification_result?: string
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
      email_notifications: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notification_type: string
          resend_id: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notification_type: string
          resend_id?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notification_type?: string
          resend_id?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: []
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
      messages: {
        Row: {
          audit_id: string | null
          company_id: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          read_at: string | null
          recipient_id: string | null
          sender_email: string | null
          sender_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          audit_id?: string | null
          company_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_email?: string | null
          sender_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          audit_id?: string | null
          company_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_email?: string | null
          sender_id?: string | null
          status?: string | null
          subject?: string | null
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
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          ai_model_preference: string | null
          billing_email: string | null
          created_at: string | null
          id: string
          name: string
          slug: string | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
        }
        Insert: {
          ai_model_preference?: string | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Update: {
          ai_model_preference?: string | null
          billing_email?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      pre_audits: {
        Row: {
          ai_tier: string | null
          audit_logs: Json | null
          company_guess: string | null
          company_id: string | null
          company_siret: string | null
          confidence: number | null
          consolidated: Json | null
          created_at: string | null
          created_by: string | null
          current_phase: string | null
          domain: string | null
          id: string
          last_step: string | null
          organization_id: string | null
          raw_sources: Json | null
          report_html_url: string | null
          sources_raw: Json | null
          status: string
          timeline: Json | null
          updated_at: string | null
          url: string
        }
        Insert: {
          ai_tier?: string | null
          audit_logs?: Json | null
          company_guess?: string | null
          company_id?: string | null
          company_siret?: string | null
          confidence?: number | null
          consolidated?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_phase?: string | null
          domain?: string | null
          id?: string
          last_step?: string | null
          organization_id?: string | null
          raw_sources?: Json | null
          report_html_url?: string | null
          sources_raw?: Json | null
          status?: string
          timeline?: Json | null
          updated_at?: string | null
          url: string
        }
        Update: {
          ai_tier?: string | null
          audit_logs?: Json | null
          company_guess?: string | null
          company_id?: string | null
          company_siret?: string | null
          confidence?: number | null
          consolidated?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_phase?: string | null
          domain?: string | null
          id?: string
          last_step?: string | null
          organization_id?: string | null
          raw_sources?: Json | null
          report_html_url?: string | null
          sources_raw?: Json | null
          status?: string
          timeline?: Json | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_audits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_audits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          block_reason: string | null
          blocked_until: string | null
          company_address: string | null
          company_creation_date: string | null
          company_id: string | null
          company_legal_form: string | null
          company_legal_name: string | null
          company_siren: string | null
          company_siret: string | null
          company_website: string | null
          created_at: string
          email: string
          firstname: string
          free_audits_used: number | null
          gdpr_consent: boolean | null
          id: string
          job_title: string | null
          last_audit_at: string | null
          last_login: string | null
          lastname: string
          oauth_provider: string | null
          oauth_uid: string | null
          organization_id: string | null
          phone: string | null
          professional_email: string | null
          professional_phone: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["app_role"]
          trust_score: number | null
          updated_at: string
          user_id: string
          verification_document_url: string | null
          verification_method: string | null
        }
        Insert: {
          account_status?: string | null
          block_reason?: string | null
          blocked_until?: string | null
          company_address?: string | null
          company_creation_date?: string | null
          company_id?: string | null
          company_legal_form?: string | null
          company_legal_name?: string | null
          company_siren?: string | null
          company_siret?: string | null
          company_website?: string | null
          created_at?: string
          email: string
          firstname: string
          free_audits_used?: number | null
          gdpr_consent?: boolean | null
          id?: string
          job_title?: string | null
          last_audit_at?: string | null
          last_login?: string | null
          lastname: string
          oauth_provider?: string | null
          oauth_uid?: string | null
          organization_id?: string | null
          phone?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          trust_score?: number | null
          updated_at?: string
          user_id: string
          verification_document_url?: string | null
          verification_method?: string | null
        }
        Update: {
          account_status?: string | null
          block_reason?: string | null
          blocked_until?: string | null
          company_address?: string | null
          company_creation_date?: string | null
          company_id?: string | null
          company_legal_form?: string | null
          company_legal_name?: string | null
          company_siren?: string | null
          company_siret?: string | null
          company_website?: string | null
          created_at?: string
          email?: string
          firstname?: string
          free_audits_used?: number | null
          gdpr_consent?: boolean | null
          id?: string
          job_title?: string | null
          last_audit_at?: string | null
          last_login?: string | null
          lastname?: string
          oauth_provider?: string | null
          oauth_uid?: string | null
          organization_id?: string | null
          phone?: string | null
          professional_email?: string | null
          professional_phone?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          verification_document_url?: string | null
          verification_method?: string | null
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
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          identifier: string
          identifier_type: string
          request_count: number
          resource_type: string
          window_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number
          resource_type: string
          window_start?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number
          resource_type?: string
          window_start?: string
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
      strategic_choices: {
        Row: {
          audit_id: string | null
          context_summary: string | null
          created_at: string | null
          created_by: string | null
          id: string
          options: Json
          phase: string
          selected_at: string | null
          selected_option: string | null
        }
        Insert: {
          audit_id?: string | null
          context_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          options: Json
          phase: string
          selected_at?: string | null
          selected_option?: string | null
        }
        Update: {
          audit_id?: string | null
          context_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          options?: Json
          phase?: string
          selected_at?: string | null
          selected_option?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_choices_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "pre_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_choices_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "v_admin_audits"
            referencedColumns: ["id"]
          },
        ]
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
      v_admin_audits: {
        Row: {
          company_guess: string | null
          confidence: number | null
          created_at: string | null
          domain: string | null
          id: string | null
          last_step: string | null
          report_html_url: string | null
          status: string | null
          steps_done: number | null
          total_steps: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_adjust_trust_score: {
        Args: {
          p_admin_id: string
          p_new_score: number
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_approve_user: {
        Args: { p_admin_id: string; p_user_id: string }
        Returns: undefined
      }
      admin_block_user: {
        Args: {
          p_admin_id: string
          p_blocked_until: string
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_change_user_role: {
        Args: {
          p_admin_id: string
          p_new_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      admin_reject_user: {
        Args: { p_admin_id: string; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      admin_reset_free_audits: {
        Args: { p_admin_id: string; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      admin_unblock_user: {
        Args: { p_admin_id: string; p_user_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_identifier_type: string
          p_max_requests: number
          p_resource_type: string
          p_window_minutes: number
        }
        Returns: Json
      }
      get_user_organization_id: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_free_audits_used: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "consultant" | "client"
      audit_status:
        | "new"
        | "collecting"
        | "ai_running"
        | "consolidating"
        | "pre_report_ready"
        | "sent"
        | "needs_review"
        | "error"
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
      audit_status: [
        "new",
        "collecting",
        "ai_running",
        "consolidating",
        "pre_report_ready",
        "sent",
        "needs_review",
        "error",
      ],
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
