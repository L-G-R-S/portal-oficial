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
      analysis_activity_log: {
        Row: {
          batch_log_id: string | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          entity_domain: string | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          error_message: string | null
          id: string
          started_at: string | null
          status: string
          trigger_type: string
          update_type: string
          user_id: string
        }
        Insert: {
          batch_log_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          entity_domain?: string | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_type?: string
          update_type?: string
          user_id: string
        }
        Update: {
          batch_log_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          entity_domain?: string | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_type?: string
          update_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_activity_log_batch_log_id_fkey"
            columns: ["batch_log_id"]
            isOneToOne: false
            referencedRelation: "update_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          domain: string
          error_message: string | null
          id: string
          progress: number | null
          raw_payload: Json | null
          result_company_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          domain: string
          error_message?: string | null
          id?: string
          progress?: number | null
          raw_payload?: Json | null
          result_company_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          domain?: string
          error_message?: string | null
          id?: string
          progress?: number | null
          raw_payload?: Json | null
          result_company_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_jobs_result_company_id_fkey"
            columns: ["result_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      case_categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      client_glassdoor_summary: {
        Row: {
          advice_example: string | null
          benefits: Json | null
          career_opportunities_rating: number | null
          ceo_rating: number | null
          client_id: string | null
          compensation_benefits_rating: number | null
          cons_example: string | null
          created_at: string | null
          culture_values_rating: number | null
          diversity_inclusion_rating: number | null
          id: string
          interviews: Json | null
          overall_rating: number | null
          pros_example: string | null
          recommend_to_friend: number | null
          reviews: Json | null
          salaries: Json | null
          work_life_balance_rating: number | null
        }
        Insert: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          client_id?: string | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          pros_example?: string | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Update: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          client_id?: string | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          pros_example?: string | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_glassdoor_summary_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_instagram_posts: {
        Row: {
          cached_thumbnail_url: string | null
          caption: string | null
          client_id: string | null
          comments_count: number | null
          created_at: string | null
          external_id: string | null
          hashtags: string | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          mentions: string | null
          shares_count: number | null
          thumbnail_url: string | null
          timestamp: string | null
          url: string | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          client_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          client_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_instagram_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_leadership: {
        Row: {
          client_id: string | null
          created_at: string | null
          decision_level: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          position: string | null
          relevance_score: number | null
          source: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_leadership_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_linkedin_posts: {
        Row: {
          cached_thumbnail_url: string | null
          celebrates: number | null
          client_id: string | null
          comments: number | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          loves: number | null
          media_duration_ms: number | null
          media_thumbnail: string | null
          media_type: string | null
          media_url: string | null
          post_type: string | null
          posted_at: string | null
          reposts: number | null
          text: string | null
          total_reactions: number | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          client_id?: string | null
          comments?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          client_id?: string | null
          comments?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_linkedin_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_market_news: {
        Row: {
          classification: string | null
          client_id: string | null
          created_at: string | null
          date: string | null
          id: string
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          classification?: string | null
          client_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          classification?: string | null
          client_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_market_news_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_market_research: {
        Row: {
          blog_url: string | null
          central_message: string | null
          client_id: string | null
          created_at: string | null
          curiosities: string | null
          digital_presence: Json | null
          events: Json | null
          id: string
          institutional_curiosities: Json | null
          institutional_discourse: string | null
          institutional_materials: Json | null
          overall_analysis: string | null
          positioning_discourse: string | null
          public_actions: Json | null
          recurring_topics: Json | null
          source_references: string | null
          strategic_analysis: Json | null
          swot_analysis: Json | null
          topics_discussed: string | null
          website_url: string | null
        }
        Insert: {
          blog_url?: string | null
          central_message?: string | null
          client_id?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Update: {
          blog_url?: string | null
          central_message?: string | null
          client_id?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_market_research_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_similar_companies: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          source: string | null
          url: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          source?: string | null
          url?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          source?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_similar_companies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_youtube_videos: {
        Row: {
          client_id: string | null
          comments_count: number | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          published_at: string | null
          thumbnail_url: string | null
          title: string | null
          url: string | null
          view_count: number | null
        }
        Insert: {
          client_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Update: {
          client_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_youtube_videos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          all_locations: Json | null
          business_model: string | null
          clients: Json | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          differentiators: Json | null
          domain: string
          employee_count: number | null
          headquarters: string | null
          id: string
          industry: string | null
          instagram_bio: string | null
          instagram_followers: number | null
          instagram_follows: number | null
          instagram_posts_count: number | null
          instagram_profile_picture: string | null
          instagram_url: string | null
          instagram_username: string | null
          linkedin_followers: number | null
          linkedin_industry: string | null
          linkedin_specialties: string[] | null
          linkedin_tagline: string | null
          linkedin_url: string | null
          logo_url: string | null
          market: string | null
          name: string | null
          partners: Json | null
          phone: string | null
          products_services: Json | null
          sector: string | null
          size: string | null
          tagline: string | null
          tiktok_url: string | null
          type: string | null
          updated_at: string | null
          website: string | null
          year_founded: number | null
          youtube_channel_name: string | null
          youtube_subscribers: number | null
          youtube_total_videos: number | null
          youtube_total_views: number | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          all_locations?: Json | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          all_locations?: Json | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain?: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          all_locations: Json | null
          business_model: string | null
          clients: Json | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          differentiators: Json | null
          domain: string
          employee_count: number | null
          headquarters: string | null
          id: string
          industry: string | null
          instagram_bio: string | null
          instagram_followers: number | null
          instagram_follows: number | null
          instagram_posts_count: number | null
          instagram_profile_picture: string | null
          instagram_url: string | null
          instagram_username: string | null
          linkedin_followers: number | null
          linkedin_industry: string | null
          linkedin_specialties: string[] | null
          linkedin_tagline: string | null
          linkedin_url: string | null
          logo_url: string | null
          market: string | null
          name: string | null
          partners: Json | null
          phone: string | null
          products_services: Json | null
          sector: string | null
          size: string | null
          tagline: string | null
          tiktok_url: string | null
          type: string | null
          updated_at: string | null
          website: string | null
          year_founded: number | null
          youtube_channel_name: string | null
          youtube_subscribers: number | null
          youtube_total_videos: number | null
          youtube_total_views: number | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          all_locations?: Json | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          all_locations?: Json | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain?: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      company_competitors: {
        Row: {
          company_id: string | null
          created_at: string | null
          evidence: string | null
          id: string
          industry: string | null
          location: string | null
          name: string | null
          source: string | null
          website: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          evidence?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string | null
          source?: string | null
          website?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          evidence?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string | null
          source?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_competitors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_leadership: {
        Row: {
          company_id: string | null
          created_at: string | null
          decision_level: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          position: string | null
          relevance_score: number | null
          source: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_leadership_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          all_locations: Json | null
          annual_revenue: string | null
          changelog: Json | null
          channels_json: Json | null
          clients: string | null
          collected_at: string | null
          company_type: string | null
          competitors_json: Json | null
          cover_url: string | null
          customer_cases: Json | null
          differentiators: Json | null
          documentation: Json | null
          domain: string
          employee_count: number | null
          employees: number | null
          founded_year: number | null
          general_summary: string | null
          glassdoor_ceo_approval: number | null
          glassdoor_rating: number | null
          glassdoor_recommend_percent: number | null
          glassdoor_reviews: number | null
          glassdoor_url: string | null
          hq_location: string | null
          id: string
          industry: string | null
          instagram_bio: string | null
          instagram_followers: number | null
          instagram_posts_count: number | null
          instagram_username: string | null
          job_listings: Json | null
          linkedin_followers: number | null
          linkedin_specialties: string[] | null
          linkedin_tagline: string | null
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          observations: Json | null
          paa: Json | null
          partners: Json | null
          payload_json: Json | null
          pricing_info: Json | null
          products_services: Json | null
          queried_at: string | null
          raw_data: Json | null
          recent_content: Json | null
          recent_mentions: Json | null
          related_searches: Json | null
          sector: string | null
          short_description: string | null
          site: string | null
          social_channels: Json | null
          status_info: Json | null
          tagline: string | null
          third_party_reviews: Json | null
          updated_at: string | null
          useful_links: Json | null
          website: string | null
          youtube_channel_name: string | null
          youtube_subscribers: number | null
          youtube_total_videos: number | null
          youtube_total_views: number | null
        }
        Insert: {
          all_locations?: Json | null
          annual_revenue?: string | null
          changelog?: Json | null
          channels_json?: Json | null
          clients?: string | null
          collected_at?: string | null
          company_type?: string | null
          competitors_json?: Json | null
          cover_url?: string | null
          customer_cases?: Json | null
          differentiators?: Json | null
          documentation?: Json | null
          domain: string
          employee_count?: number | null
          employees?: number | null
          founded_year?: number | null
          general_summary?: string | null
          glassdoor_ceo_approval?: number | null
          glassdoor_rating?: number | null
          glassdoor_recommend_percent?: number | null
          glassdoor_reviews?: number | null
          glassdoor_url?: string | null
          hq_location?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_posts_count?: number | null
          instagram_username?: string | null
          job_listings?: Json | null
          linkedin_followers?: number | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          observations?: Json | null
          paa?: Json | null
          partners?: Json | null
          payload_json?: Json | null
          pricing_info?: Json | null
          products_services?: Json | null
          queried_at?: string | null
          raw_data?: Json | null
          recent_content?: Json | null
          recent_mentions?: Json | null
          related_searches?: Json | null
          sector?: string | null
          short_description?: string | null
          site?: string | null
          social_channels?: Json | null
          status_info?: Json | null
          tagline?: string | null
          third_party_reviews?: Json | null
          updated_at?: string | null
          useful_links?: Json | null
          website?: string | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
        }
        Update: {
          all_locations?: Json | null
          annual_revenue?: string | null
          changelog?: Json | null
          channels_json?: Json | null
          clients?: string | null
          collected_at?: string | null
          company_type?: string | null
          competitors_json?: Json | null
          cover_url?: string | null
          customer_cases?: Json | null
          differentiators?: Json | null
          documentation?: Json | null
          domain?: string
          employee_count?: number | null
          employees?: number | null
          founded_year?: number | null
          general_summary?: string | null
          glassdoor_ceo_approval?: number | null
          glassdoor_rating?: number | null
          glassdoor_recommend_percent?: number | null
          glassdoor_reviews?: number | null
          glassdoor_url?: string | null
          hq_location?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_posts_count?: number | null
          instagram_username?: string | null
          job_listings?: Json | null
          linkedin_followers?: number | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          observations?: Json | null
          paa?: Json | null
          partners?: Json | null
          payload_json?: Json | null
          pricing_info?: Json | null
          products_services?: Json | null
          queried_at?: string | null
          raw_data?: Json | null
          recent_content?: Json | null
          recent_mentions?: Json | null
          related_searches?: Json | null
          sector?: string | null
          short_description?: string | null
          site?: string | null
          social_channels?: Json | null
          status_info?: Json | null
          tagline?: string | null
          third_party_reviews?: Json | null
          updated_at?: string | null
          useful_links?: Json | null
          website?: string | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
        }
        Relationships: []
      }
      email_alert_settings: {
        Row: {
          created_at: string | null
          frequency_day: number | null
          frequency_hour: number | null
          frequency_type: string | null
          id: string
          is_enabled: boolean | null
          last_digest_at: string | null
          next_digest_at: string | null
          only_high_impact: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency_day?: number | null
          frequency_hour?: number | null
          frequency_type?: string | null
          id?: string
          is_enabled?: boolean | null
          last_digest_at?: string | null
          next_digest_at?: string | null
          only_high_impact?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency_day?: number | null
          frequency_hour?: number | null
          frequency_type?: string | null
          id?: string
          is_enabled?: boolean | null
          last_digest_at?: string | null
          next_digest_at?: string | null
          only_high_impact?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_to: string
          entity_name: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          sent_at: string | null
          status: string | null
          subject: string
          subscriber_id: string | null
          template_type: string
        }
        Insert: {
          email_to: string
          entity_name?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject: string
          subscriber_id?: string | null
          template_type: string
        }
        Update: {
          email_to?: string
          entity_name?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          subscriber_id?: string | null
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_subscribers: {
        Row: {
          created_at: string | null
          email: string
          entities_filter: Json | null
          id: string
          is_active: boolean | null
          name: string | null
          receive_instant_alerts: boolean | null
          receive_weekly_digest: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          entities_filter?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          receive_instant_alerts?: boolean | null
          receive_weekly_digest?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          entities_filter?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          receive_instant_alerts?: boolean | null
          receive_weekly_digest?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      excluded_news: {
        Row: {
          excluded_at: string | null
          excluded_by: string | null
          id: string
          news_id: string
          news_table: string
          reason: string | null
        }
        Insert: {
          excluded_at?: string | null
          excluded_by?: string | null
          id?: string
          news_id: string
          news_table: string
          reason?: string | null
        }
        Update: {
          excluded_at?: string | null
          excluded_by?: string | null
          id?: string
          news_id?: string
          news_table?: string
          reason?: string | null
        }
        Relationships: []
      }
      glassdoor_summary: {
        Row: {
          advice_example: string | null
          benefits: Json | null
          career_opportunities_rating: number | null
          ceo_rating: number | null
          company_id: string | null
          compensation_benefits_rating: number | null
          cons_example: string | null
          created_at: string | null
          culture_values_rating: number | null
          diversity_inclusion_rating: number | null
          id: string
          interviews: Json | null
          overall_rating: number | null
          pros_example: string | null
          ratings_five_stars: number | null
          ratings_four_stars: number | null
          ratings_one_star: number | null
          ratings_three_stars: number | null
          ratings_two_stars: number | null
          recommend_to_friend: number | null
          reviews: Json | null
          salaries: Json | null
          work_life_balance_rating: number | null
        }
        Insert: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          company_id?: string | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          pros_example?: string | null
          ratings_five_stars?: number | null
          ratings_four_stars?: number | null
          ratings_one_star?: number | null
          ratings_three_stars?: number | null
          ratings_two_stars?: number | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Update: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          company_id?: string | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          pros_example?: string | null
          ratings_five_stars?: number | null
          ratings_four_stars?: number | null
          ratings_one_star?: number | null
          ratings_three_stars?: number | null
          ratings_two_stars?: number | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "glassdoor_summary_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          cached_thumbnail_url: string | null
          caption: string | null
          comments_count: number | null
          company_id: string | null
          created_at: string | null
          external_id: string | null
          hashtags: string | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          mentions: string | null
          shares_count: number | null
          thumbnail_url: string | null
          timestamp: string | null
          url: string | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          comments_count?: number | null
          company_id?: string | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          comments_count?: number | null
          company_id?: string | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          content_summary: string | null
          created_at: string | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          content_summary?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          content_summary?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_posts: {
        Row: {
          cached_thumbnail_url: string | null
          celebrates: number | null
          comments: number | null
          company_id: string | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          loves: number | null
          media_duration_ms: number | null
          media_thumbnail: string | null
          media_type: string | null
          media_url: string | null
          post_type: string | null
          posted_at: string | null
          reposts: number | null
          text: string | null
          total_reactions: number | null
          url: string | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          comments?: number | null
          company_id?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
          url?: string | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          comments?: number | null
          company_id?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      market_news: {
        Row: {
          classification: string | null
          company_id: string | null
          created_at: string | null
          date: string | null
          id: string
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          classification?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          classification?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_news_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      market_research: {
        Row: {
          blog_url: string | null
          central_message: string | null
          company_id: string | null
          created_at: string | null
          curiosities: string | null
          digital_presence: Json | null
          events: Json | null
          id: string
          institutional_curiosities: Json | null
          institutional_discourse: string | null
          institutional_materials: Json | null
          overall_analysis: string | null
          positioning_discourse: string | null
          public_actions: Json | null
          recurring_topics: Json | null
          source_references: string | null
          strategic_analysis: Json | null
          swot_analysis: Json | null
          topics_discussed: string | null
          website_url: string | null
        }
        Insert: {
          blog_url?: string | null
          central_message?: string | null
          company_id?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Update: {
          blog_url?: string | null
          central_message?: string | null
          company_id?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_research_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pending_analyses: {
        Row: {
          domain: string
          entity_type: string
          id: string
          message: string | null
          progress: number | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          domain: string
          entity_type: string
          id?: string
          message?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          domain?: string
          entity_type?: string
          id?: string
          message?: string | null
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      primary_company: {
        Row: {
          address: string | null
          all_locations: Json | null
          analyzed_at: string | null
          business_model: string | null
          clients: Json | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          differentiators: Json | null
          domain: string
          employee_count: number | null
          headquarters: string | null
          id: string
          industry: string | null
          instagram_bio: string | null
          instagram_followers: number | null
          instagram_follows: number | null
          instagram_posts_count: number | null
          instagram_profile_picture: string | null
          instagram_url: string | null
          instagram_username: string | null
          linkedin_followers: number | null
          linkedin_industry: string | null
          linkedin_specialties: string[] | null
          linkedin_tagline: string | null
          linkedin_url: string | null
          logo_url: string | null
          market: string | null
          name: string | null
          partners: Json | null
          phone: string | null
          products_services: Json | null
          sector: string | null
          size: string | null
          tagline: string | null
          tiktok_url: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          year_founded: number | null
          youtube_channel_name: string | null
          youtube_subscribers: number | null
          youtube_total_videos: number | null
          youtube_total_views: number | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          all_locations?: Json | null
          analyzed_at?: string | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          all_locations?: Json | null
          analyzed_at?: string | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain?: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      primary_company_glassdoor: {
        Row: {
          advice_example: string | null
          benefits: Json | null
          career_opportunities_rating: number | null
          ceo_rating: number | null
          compensation_benefits_rating: number | null
          cons_example: string | null
          created_at: string | null
          culture_values_rating: number | null
          diversity_inclusion_rating: number | null
          id: string
          interviews: Json | null
          overall_rating: number | null
          primary_company_id: string | null
          pros_example: string | null
          recommend_to_friend: number | null
          reviews: Json | null
          salaries: Json | null
          work_life_balance_rating: number | null
        }
        Insert: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          primary_company_id?: string | null
          pros_example?: string | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Update: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          primary_company_id?: string | null
          pros_example?: string | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_glassdoor_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_instagram_posts: {
        Row: {
          cached_thumbnail_url: string | null
          caption: string | null
          comments_count: number | null
          created_at: string | null
          external_id: string | null
          hashtags: string | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          mentions: string | null
          primary_company_id: string | null
          shares_count: number | null
          thumbnail_url: string | null
          timestamp: string | null
          url: string | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          primary_company_id?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          primary_company_id?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_instagram_posts_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_leadership: {
        Row: {
          created_at: string | null
          decision_level: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          position: string | null
          primary_company_id: string | null
          relevance_score: number | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          primary_company_id?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          primary_company_id?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_leadership_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_linkedin_posts: {
        Row: {
          cached_thumbnail_url: string | null
          celebrates: number | null
          comments: number | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          loves: number | null
          media_duration_ms: number | null
          media_thumbnail: string | null
          media_type: string | null
          media_url: string | null
          post_type: string | null
          posted_at: string | null
          primary_company_id: string | null
          reposts: number | null
          text: string | null
          total_reactions: number | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          comments?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          primary_company_id?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          comments?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          primary_company_id?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_linkedin_posts_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_market_news: {
        Row: {
          classification: string | null
          created_at: string | null
          date: string | null
          id: string
          primary_company_id: string | null
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          classification?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          primary_company_id?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          classification?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          primary_company_id?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_market_news_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_market_research: {
        Row: {
          blog_url: string | null
          central_message: string | null
          created_at: string | null
          curiosities: string | null
          digital_presence: Json | null
          events: Json | null
          id: string
          institutional_curiosities: Json | null
          institutional_discourse: string | null
          institutional_materials: Json | null
          overall_analysis: string | null
          positioning_discourse: string | null
          primary_company_id: string | null
          public_actions: Json | null
          recurring_topics: Json | null
          source_references: string | null
          strategic_analysis: Json | null
          swot_analysis: Json | null
          topics_discussed: string | null
          website_url: string | null
        }
        Insert: {
          blog_url?: string | null
          central_message?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          primary_company_id?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Update: {
          blog_url?: string | null
          central_message?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          primary_company_id?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_market_research_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_similar_companies: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          primary_company_id: string | null
          source: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          primary_company_id?: string | null
          source?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          primary_company_id?: string | null
          source?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_similar_companies_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_company_youtube_videos: {
        Row: {
          comments_count: number | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          primary_company_id: string | null
          published_at: string | null
          thumbnail_url: string | null
          title: string | null
          url: string | null
          view_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          primary_company_id?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          primary_company_id?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_company_youtube_videos_primary_company_id_fkey"
            columns: ["primary_company_id"]
            isOneToOne: false
            referencedRelation: "primary_company"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          receive_email_updates: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          receive_email_updates?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          receive_email_updates?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospect_glassdoor_summary: {
        Row: {
          advice_example: string | null
          benefits: Json | null
          career_opportunities_rating: number | null
          ceo_rating: number | null
          compensation_benefits_rating: number | null
          cons_example: string | null
          created_at: string | null
          culture_values_rating: number | null
          diversity_inclusion_rating: number | null
          id: string
          interviews: Json | null
          overall_rating: number | null
          pros_example: string | null
          prospect_id: string | null
          recommend_to_friend: number | null
          reviews: Json | null
          salaries: Json | null
          work_life_balance_rating: number | null
        }
        Insert: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          pros_example?: string | null
          prospect_id?: string | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Update: {
          advice_example?: string | null
          benefits?: Json | null
          career_opportunities_rating?: number | null
          ceo_rating?: number | null
          compensation_benefits_rating?: number | null
          cons_example?: string | null
          created_at?: string | null
          culture_values_rating?: number | null
          diversity_inclusion_rating?: number | null
          id?: string
          interviews?: Json | null
          overall_rating?: number | null
          pros_example?: string | null
          prospect_id?: string | null
          recommend_to_friend?: number | null
          reviews?: Json | null
          salaries?: Json | null
          work_life_balance_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_glassdoor_summary_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_instagram_posts: {
        Row: {
          cached_thumbnail_url: string | null
          caption: string | null
          comments_count: number | null
          created_at: string | null
          external_id: string | null
          hashtags: string | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          mentions: string | null
          prospect_id: string | null
          shares_count: number | null
          thumbnail_url: string | null
          timestamp: string | null
          url: string | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          prospect_id?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          hashtags?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string | null
          prospect_id?: string | null
          shares_count?: number | null
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_instagram_posts_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_leadership: {
        Row: {
          created_at: string | null
          decision_level: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          position: string | null
          prospect_id: string | null
          relevance_score: number | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          prospect_id?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          decision_level?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          position?: string | null
          prospect_id?: string | null
          relevance_score?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_leadership_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_linkedin_posts: {
        Row: {
          cached_thumbnail_url: string | null
          celebrates: number | null
          comments: number | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          loves: number | null
          media_duration_ms: number | null
          media_thumbnail: string | null
          media_type: string | null
          media_url: string | null
          post_type: string | null
          posted_at: string | null
          prospect_id: string | null
          reposts: number | null
          text: string | null
          total_reactions: number | null
        }
        Insert: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          comments?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          prospect_id?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
        }
        Update: {
          cached_thumbnail_url?: string | null
          celebrates?: number | null
          comments?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          loves?: number | null
          media_duration_ms?: number | null
          media_thumbnail?: string | null
          media_type?: string | null
          media_url?: string | null
          post_type?: string | null
          posted_at?: string | null
          prospect_id?: string | null
          reposts?: number | null
          text?: string | null
          total_reactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_linkedin_posts_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_market_news: {
        Row: {
          classification: string | null
          created_at: string | null
          date: string | null
          id: string
          prospect_id: string | null
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          classification?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          prospect_id?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          classification?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          prospect_id?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_market_news_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_market_research: {
        Row: {
          blog_url: string | null
          central_message: string | null
          created_at: string | null
          curiosities: string | null
          digital_presence: Json | null
          events: Json | null
          id: string
          institutional_curiosities: Json | null
          institutional_discourse: string | null
          institutional_materials: Json | null
          overall_analysis: string | null
          positioning_discourse: string | null
          prospect_id: string | null
          public_actions: Json | null
          recurring_topics: Json | null
          source_references: string | null
          strategic_analysis: Json | null
          swot_analysis: Json | null
          topics_discussed: string | null
          website_url: string | null
        }
        Insert: {
          blog_url?: string | null
          central_message?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          prospect_id?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Update: {
          blog_url?: string | null
          central_message?: string | null
          created_at?: string | null
          curiosities?: string | null
          digital_presence?: Json | null
          events?: Json | null
          id?: string
          institutional_curiosities?: Json | null
          institutional_discourse?: string | null
          institutional_materials?: Json | null
          overall_analysis?: string | null
          positioning_discourse?: string | null
          prospect_id?: string | null
          public_actions?: Json | null
          recurring_topics?: Json | null
          source_references?: string | null
          strategic_analysis?: Json | null
          swot_analysis?: Json | null
          topics_discussed?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_market_research_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_similar_companies: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          prospect_id: string | null
          source: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          prospect_id?: string | null
          source?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          prospect_id?: string | null
          source?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_similar_companies_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_youtube_videos: {
        Row: {
          comments_count: number | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          prospect_id: string | null
          published_at: string | null
          thumbnail_url: string | null
          title: string | null
          url: string | null
          view_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          prospect_id?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          prospect_id?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_youtube_videos_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          address: string | null
          all_locations: Json | null
          business_model: string | null
          clients: Json | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          differentiators: Json | null
          domain: string
          employee_count: number | null
          headquarters: string | null
          id: string
          industry: string | null
          instagram_bio: string | null
          instagram_followers: number | null
          instagram_follows: number | null
          instagram_posts_count: number | null
          instagram_profile_picture: string | null
          instagram_url: string | null
          instagram_username: string | null
          linkedin_followers: number | null
          linkedin_industry: string | null
          linkedin_specialties: string[] | null
          linkedin_tagline: string | null
          linkedin_url: string | null
          logo_url: string | null
          market: string | null
          name: string | null
          partners: Json | null
          phone: string | null
          products_services: Json | null
          sector: string | null
          size: string | null
          tagline: string | null
          tiktok_url: string | null
          type: string | null
          updated_at: string | null
          website: string | null
          year_founded: number | null
          youtube_channel_name: string | null
          youtube_subscribers: number | null
          youtube_total_videos: number | null
          youtube_total_views: number | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          all_locations?: Json | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          all_locations?: Json | null
          business_model?: string | null
          clients?: Json | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          differentiators?: Json | null
          domain?: string
          employee_count?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          instagram_bio?: string | null
          instagram_followers?: number | null
          instagram_follows?: number | null
          instagram_posts_count?: number | null
          instagram_profile_picture?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          linkedin_followers?: number | null
          linkedin_industry?: string | null
          linkedin_specialties?: string[] | null
          linkedin_tagline?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          market?: string | null
          name?: string | null
          partners?: Json | null
          phone?: string | null
          products_services?: Json | null
          sector?: string | null
          size?: string | null
          tagline?: string | null
          tiktok_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
          year_founded?: number | null
          youtube_channel_name?: string | null
          youtube_subscribers?: number | null
          youtube_total_videos?: number | null
          youtube_total_views?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      similar_companies: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string | null
          source: string | null
          url: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          source?: string | null
          url?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          source?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "similar_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      success_cases: {
        Row: {
          case_title: string
          categories: string[]
          challenges: Json
          client_id: string | null
          client_logo_url: string | null
          client_name: string
          created_at: string
          id: string
          is_sap_published: boolean | null
          is_video_case: boolean | null
          pdf_url: string | null
          published_by: string | null
          results: Json
          solutions: Json
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          case_title: string
          categories?: string[]
          challenges?: Json
          client_id?: string | null
          client_logo_url?: string | null
          client_name: string
          created_at?: string
          id?: string
          is_sap_published?: boolean | null
          is_video_case?: boolean | null
          pdf_url?: string | null
          published_by?: string | null
          results?: Json
          solutions?: Json
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          case_title?: string
          categories?: string[]
          challenges?: Json
          client_id?: string | null
          client_logo_url?: string | null
          client_name?: string
          created_at?: string
          id?: string
          is_sap_published?: boolean | null
          is_video_case?: boolean | null
          pdf_url?: string | null
          published_by?: string | null
          results?: Json
          solutions?: Json
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "success_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      update_logs: {
        Row: {
          completed_at: string | null
          current_entity_domain: string | null
          current_entity_name: string | null
          entities_updated: number | null
          entity_types: string[] | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          total_entities: number | null
          trigger_type: string | null
          update_type: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_entity_domain?: string | null
          current_entity_name?: string | null
          entities_updated?: number | null
          entity_types?: string[] | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          total_entities?: number | null
          trigger_type?: string | null
          update_type?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_entity_domain?: string | null
          current_entity_name?: string | null
          entities_updated?: number | null
          entity_types?: string[] | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          total_entities?: number | null
          trigger_type?: string | null
          update_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      update_settings: {
        Row: {
          created_at: string | null
          frequency_minutes: number | null
          id: string
          is_enabled: boolean | null
          last_update_at: string | null
          next_update_at: string | null
          update_clients: boolean | null
          update_competitors: boolean | null
          update_prospects: boolean | null
          update_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          last_update_at?: string | null
          next_update_at?: string | null
          update_clients?: boolean | null
          update_competitors?: boolean | null
          update_prospects?: boolean | null
          update_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          last_update_at?: string | null
          next_update_at?: string | null
          update_clients?: boolean | null
          update_competitors?: boolean | null
          update_prospects?: boolean | null
          update_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          comments_count: number | null
          company_id: string | null
          created_at: string | null
          external_id: string | null
          id: string
          likes: number | null
          published_at: string | null
          thumbnail_url: string | null
          title: string | null
          url: string | null
          view_count: number | null
        }
        Insert: {
          comments_count?: number | null
          company_id?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Update: {
          comments_count?: number | null
          company_id?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          likes?: number | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean }
      owns_primary_company: { Args: { pc_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "user"
      user_role: "marketing" | "comercial" | "executivo"
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
      app_role: ["super_admin", "user"],
      user_role: ["marketing", "comercial", "executivo"],
    },
  },
} as const
