/**
 * Database Abstraction Interfaces
 * Allows switching between Supabase and Prisma without changing business logic
 */

// Generic Repository Interface
export interface Repository<T> {
  findAll(options?: QueryOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
}

// Query Options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  include?: string[];
  where?: any;
}

// Product Repository
export interface ProductRepository extends Repository<Product> {
  findByCategory(categoryId: string): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findFeatured(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
}

// Category Repository
export interface CategoryRepository extends Repository<Category> {
  findBySlug(slug: string): Promise<Category | null>;
  findWithProducts(id: string): Promise<CategoryWithProducts | null>;
  findParentCategories(): Promise<Category[]>;
}

// Order Repository
export interface OrderRepository extends Repository<Order> {
  findByUser(userId: string): Promise<Order[]>;
  findByStatus(status: string): Promise<Order[]>;
  findWithJobs(id: string): Promise<OrderWithJobs | null>;
  updateStatus(id: string, status: string): Promise<Order>;
}

// User Profile Repository
export interface UserProfileRepository extends Repository<UserProfile> {
  findByUserId(userId: string): Promise<UserProfile | null>;
  findBrokers(): Promise<UserProfile[]>;
  updateBrokerStatus(id: string, status: BrokerStatus): Promise<UserProfile>;
}

// Paper Stock Repository
export interface PaperStockRepository extends Repository<PaperStock> {
  findActive(): Promise<PaperStock[]>;
  findByCategory(category: string): Promise<PaperStock[]>;
}

// Add-ons Repository
export interface AddOnsRepository extends Repository<AddOn> {
  findActive(): Promise<AddOn[]>;
  findByPricingModel(model: string): Promise<AddOn[]>;
}

// Entity Definitions (matching Supabase schema)
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id: string;
  vendor_id?: string;
  base_price: number;
  minimum_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_category_id?: string;
  default_broker_discount?: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export interface Order {
  id: string;
  user_id: string;
  reference_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithJobs extends Order {
  jobs: OrderJob[];
}

export interface OrderJob {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  width: number;
  height: number;
  paper_stock_id?: string;
  coating_id?: string;
  turnaround_time_id?: string;
  sides: 'single' | 'double';
  add_ons?: any;
  unit_price: number;
  total_price: number;
  job_notes?: string;
  artwork_file_id?: string;
  status: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  is_admin: boolean;
  is_broker: boolean;
  broker_status?: BrokerStatus;
  broker_tier?: string;
  broker_discount_percentage?: number;
  category_discounts?: any;
  annual_volume?: number;
  ytd_volume?: number;
  created_at: string;
  updated_at: string;
}

export interface PaperStock {
  id: string;
  name: string;
  category: string;
  weight?: string;
  price_per_sq_inch: number;
  second_side_markup_percent?: number;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  pricing_model: 'flat' | 'per_piece' | 'setup_plus_per_piece' | 'custom';
  configuration: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enums
export type BrokerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Export everything
export * from '../types/pricing';