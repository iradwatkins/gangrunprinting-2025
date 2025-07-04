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
      user_profiles: {
        Row: {
          id: string
          user_id: string
          is_broker: boolean
          broker_category_discounts: Json
          company_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          is_broker?: boolean
          broker_category_discounts?: Json
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          is_broker?: boolean
          broker_category_discounts?: Json
          company_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_category_id: string | null
          default_broker_discount: number
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_category_id?: string | null
          default_broker_discount?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_category_id?: string | null
          default_broker_discount?: number
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: Json | null
          incoming_email_addresses: Json
          supported_shipping_carriers: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: Json | null
          incoming_email_addresses?: Json
          supported_shipping_carriers?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: Json | null
          incoming_email_addresses?: Json
          supported_shipping_carriers?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string
          vendor_id: string
          base_price: number
          is_active: boolean
          minimum_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id: string
          vendor_id: string
          base_price?: number
          is_active?: boolean
          minimum_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string
          vendor_id?: string
          base_price?: number
          is_active?: boolean
          minimum_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      paper_stocks: {
        Row: {
          id: string
          name: string
          weight: number
          price_per_sq_inch: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          weight: number
          price_per_sq_inch?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          weight?: number
          price_per_sq_inch?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coatings: {
        Row: {
          id: string
          name: string
          price_modifier: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price_modifier?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_modifier?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      print_sizes: {
        Row: {
          id: string
          name: string
          width: number
          height: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          width: number
          height: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          width?: number
          height?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      turnaround_times: {
        Row: {
          id: string
          name: string
          business_days: number
          price_markup_percent: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_days: number
          price_markup_percent?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_days?: number
          price_markup_percent?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      add_ons: {
        Row: {
          id: string
          name: string
          pricing_model: Database['public']['Enums']['pricing_model']
          configuration: Json
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          pricing_model?: Database['public']['Enums']['pricing_model']
          configuration?: Json
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          pricing_model?: Database['public']['Enums']['pricing_model']
          configuration?: Json
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          reference_number: string
          status: Database['public']['Enums']['order_status']
          subtotal: number
          tax_amount: number
          shipping_cost: number
          total_amount: number
          shipping_address: Json
          billing_address: Json
          payment_method: string | null
          payment_id: string | null
          payment_status: string | null
          notes: string | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reference_number?: string
          status?: Database['public']['Enums']['order_status']
          subtotal?: number
          tax_amount?: number
          shipping_cost?: number
          total_amount?: number
          shipping_address: Json
          billing_address: Json
          payment_method?: string | null
          payment_id?: string | null
          payment_status?: string | null
          notes?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reference_number?: string
          status?: Database['public']['Enums']['order_status']
          subtotal?: number
          tax_amount?: number
          shipping_cost?: number
          total_amount?: number
          shipping_address?: Json
          billing_address?: Json
          payment_method?: string | null
          payment_id?: string | null
          payment_status?: string | null
          notes?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_jobs: {
        Row: {
          id: string
          order_id: string
          product_id: string
          vendor_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          configuration: Json
          price_summary: Json
          status: Database['public']['Enums']['job_status']
          tracking_number: string | null
          estimated_delivery: string | null
          actual_delivery: string | null
          artwork_files: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          vendor_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          configuration?: Json
          price_summary?: Json
          status?: Database['public']['Enums']['job_status']
          tracking_number?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
          artwork_files?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          vendor_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          configuration?: Json
          price_summary?: Json
          status?: Database['public']['Enums']['job_status']
          tracking_number?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
          artwork_files?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      pricing_model: 'flat' | 'percentage' | 'per_unit' | 'per_sq_inch' | 'custom'
      order_status: 'draft' | 'pending_payment' | 'payment_confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      job_status: 'pending' | 'assigned' | 'in_production' | 'printing' | 'finishing' | 'quality_check' | 'shipped' | 'delivered' | 'cancelled'
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
    Enums: {},
  },
} as const
