export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      add_ons: {
        Row: {
          configuration: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          updated_at?: string
        }
        Relationships: []
      }
      artwork_files: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number
          id: string
          mime_type: string
          original_filename: string
          preview_url: string | null
          stored_filename: string
          updated_at: string | null
          upload_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          original_filename: string
          preview_url?: string | null
          stored_filename: string
          updated_at?: string | null
          upload_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_filename?: string
          preview_url?: string | null
          stored_filename?: string
          updated_at?: string | null
          upload_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coatings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_modifier: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_modifier?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_modifier?: number
          updated_at?: string
        }
        Relationships: []
      }
      customer_feedback: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          order_id: string | null
          rating: number
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          order_id?: string | null
          rating: number
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          order_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          description: string | null
          follow_up_date: string | null
          id: string
          interaction_type: string
          outcome: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          description?: string | null
          follow_up_date?: string | null
          id?: string
          interaction_type: string
          outcome?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          description?: string | null
          follow_up_date?: string | null
          id?: string
          interaction_type?: string
          outcome?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          note_type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          note_type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          note_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          acquisition_date: string | null
          acquisition_source: string | null
          average_order_value: number | null
          communication_preferences: Json | null
          created_at: string | null
          customer_status: string | null
          customer_value: number | null
          id: string
          last_order_date: string | null
          lifecycle_stage: string | null
          lifetime_value: number | null
          preferred_contact_method: string | null
          total_orders: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_source?: string | null
          average_order_value?: number | null
          communication_preferences?: Json | null
          created_at?: string | null
          customer_status?: string | null
          customer_value?: number | null
          id?: string
          last_order_date?: string | null
          lifecycle_stage?: string | null
          lifetime_value?: number | null
          preferred_contact_method?: string | null
          total_orders?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acquisition_date?: string | null
          acquisition_source?: string | null
          average_order_value?: number | null
          communication_preferences?: Json | null
          created_at?: string | null
          customer_status?: string | null
          customer_value?: number | null
          id?: string
          last_order_date?: string | null
          lifecycle_stage?: string | null
          lifetime_value?: number | null
          preferred_contact_method?: string | null
          total_orders?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_segment_assignments: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          segment_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          segment_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_segment_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_segment_assignments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segments: {
        Row: {
          auto_update: boolean | null
          created_at: string | null
          criteria: Json
          customer_count: number | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          auto_update?: boolean | null
          created_at?: string | null
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          auto_update?: boolean | null
          created_at?: string | null
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_tag_assignments: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tag_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      email_interactions: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          content: string | null
          customer_id: string
          direction: string
          email_address: string
          id: string
          opened_at: string | null
          replied_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          content?: string | null
          customer_id: string
          direction: string
          email_address: string
          id?: string
          opened_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          content?: string | null
          customer_id?: string
          direction?: string
          email_address?: string
          id?: string
          opened_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      export_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          export_type: string
          file_url: string | null
          filters: Json | null
          format: string
          id: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          export_type: string
          file_url?: string | null
          filters?: Json | null
          format: string
          id?: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          export_type?: string
          file_url?: string | null
          filters?: Json | null
          format?: string
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      order_jobs: {
        Row: {
          actual_delivery: string | null
          artwork_files: Json | null
          configuration: Json
          created_at: string
          estimated_delivery: string | null
          id: string
          order_id: string
          price_summary: Json
          product_id: string
          quantity: number
          status: Database["public"]["Enums"]["job_status"]
          total_price: number
          tracking_number: string | null
          unit_price: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actual_delivery?: string | null
          artwork_files?: Json | null
          configuration?: Json
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          order_id: string
          price_summary?: Json
          product_id: string
          quantity?: number
          status?: Database["public"]["Enums"]["job_status"]
          total_price?: number
          tracking_number?: string | null
          unit_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actual_delivery?: string | null
          artwork_files?: Json | null
          configuration?: Json
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          order_id?: string
          price_summary?: Json
          product_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["job_status"]
          total_price?: number
          tracking_number?: string | null
          unit_price?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_jobs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_jobs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string
          id: string
          notes: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          reference_number: string
          shipping_address: Json
          shipping_cost: number
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address: Json
          created_at?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reference_number: string
          shipping_address: Json
          shipping_cost?: number
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json
          created_at?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          reference_number?: string
          shipping_address?: Json
          shipping_cost?: number
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paper_stock_coatings: {
        Row: {
          coating_id: string
          created_at: string
          id: string
          is_default: boolean
          paper_stock_id: string
        }
        Insert: {
          coating_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          paper_stock_id: string
        }
        Update: {
          coating_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          paper_stock_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_stock_coatings_coating_id_fkey"
            columns: ["coating_id"]
            isOneToOne: false
            referencedRelation: "coatings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paper_stock_coatings_paper_stock_id_fkey"
            columns: ["paper_stock_id"]
            isOneToOne: false
            referencedRelation: "paper_stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_stocks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_per_sq_inch: number
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_per_sq_inch?: number
          updated_at?: string
          weight: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_per_sq_inch?: number
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      print_sizes: {
        Row: {
          created_at: string
          height: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
          width: number
        }
        Insert: {
          created_at?: string
          height: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          width: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          width?: number
        }
        Relationships: []
      }
      product_add_ons: {
        Row: {
          add_on_id: string
          created_at: string
          id: string
          is_mandatory: boolean
          price_override: Json | null
          product_id: string
        }
        Insert: {
          add_on_id: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          price_override?: Json | null
          product_id: string
        }
        Update: {
          add_on_id?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          price_override?: Json | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_add_ons_add_on_id_fkey"
            columns: ["add_on_id"]
            isOneToOne: false
            referencedRelation: "add_ons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_add_ons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          default_broker_discount: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_category_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_broker_discount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_category_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_broker_discount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_category_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_paper_stocks: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          paper_stock_id: string
          price_override: number | null
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          paper_stock_id: string
          price_override?: number | null
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          paper_stock_id?: string
          price_override?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_paper_stocks_paper_stock_id_fkey"
            columns: ["paper_stock_id"]
            isOneToOne: false
            referencedRelation: "paper_stocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_paper_stocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_print_sizes: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          price_modifier: number | null
          print_size_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          price_modifier?: number | null
          print_size_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          price_modifier?: number | null
          print_size_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_print_sizes_print_size_id_fkey"
            columns: ["print_size_id"]
            isOneToOne: false
            referencedRelation: "print_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_print_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_turnaround_times: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          price_override: number | null
          product_id: string
          turnaround_time_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          price_override?: number | null
          product_id: string
          turnaround_time_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          price_override?: number | null
          product_id?: string
          turnaround_time_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_turnaround_times_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_turnaround_times_turnaround_time_id_fkey"
            columns: ["turnaround_time_id"]
            isOneToOne: false
            referencedRelation: "turnaround_times"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          minimum_quantity: number | null
          name: string
          slug: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          base_price?: number
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          minimum_quantity?: number | null
          name: string
          slug: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          base_price?: number
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          minimum_quantity?: number | null
          name?: string
          slug?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          customer_id: string
          description: string
          id: string
          order_id: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_id: string
          description: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string
          id?: string
          order_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      turnaround_times: {
        Row: {
          business_days: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_markup_percent: number
          updated_at: string
        }
        Insert: {
          business_days: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price_markup_percent?: number
          updated_at?: string
        }
        Update: {
          business_days?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_markup_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          broker_category_discounts: Json | null
          company_name: string | null
          created_at: string
          id: string
          is_broker: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_category_discounts?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          is_broker?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_category_discounts?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          is_broker?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: Json | null
          created_at: string
          email: string | null
          id: string
          incoming_email_addresses: Json | null
          is_active: boolean
          name: string
          phone: string | null
          supported_shipping_carriers: Json | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          incoming_email_addresses?: Json | null
          is_active?: boolean
          name: string
          phone?: string | null
          supported_shipping_carriers?: Json | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          incoming_email_addresses?: Json | null
          is_active?: boolean
          name?: string
          phone?: string | null
          supported_shipping_carriers?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_reference_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_user: {
        Args: { user_email: string }
        Returns: boolean
      }
      update_customer_metrics: {
        Args: { customer_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      job_status:
        | "pending"
        | "assigned"
        | "in_production"
        | "printing"
        | "finishing"
        | "quality_check"
        | "shipped"
        | "delivered"
        | "cancelled"
      order_status:
        | "draft"
        | "pending_payment"
        | "payment_confirmed"
        | "in_production"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      pricing_model:
        | "flat"
        | "percentage"
        | "per_unit"
        | "per_sq_inch"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      job_status: [
        "pending",
        "assigned",
        "in_production",
        "printing",
        "finishing",
        "quality_check",
        "shipped",
        "delivered",
        "cancelled",
      ],
      order_status: [
        "draft",
        "pending_payment",
        "payment_confirmed",
        "in_production",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      pricing_model: [
        "flat",
        "percentage",
        "per_unit",
        "per_sq_inch",
        "custom",
      ],
    },
  },
} as const
