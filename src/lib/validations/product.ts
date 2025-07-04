import * as z from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Name too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  category_id: z.string().uuid('Invalid category ID'),
  vendor_id: z.string().uuid('Invalid vendor ID'),
  base_price: z.coerce.number().min(0, 'Price must be positive').max(999999.99, 'Price too high'),
  minimum_quantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').max(10000, 'Quantity too high'),
  is_active: z.boolean()
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Name too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  parent_category_id: z.string().uuid().optional().nullable(),
  default_broker_discount: z.coerce.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%'),
  sort_order: z.coerce.number().int().min(0, 'Sort order must be positive'),
  is_active: z.boolean()
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(255, 'Name too long'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.any().optional().nullable(), // JSONB field
  incoming_email_addresses: z.array(z.string().email()).default([]),
  supported_shipping_carriers: z.array(z.string()).default([]),
  is_active: z.boolean()
});

export const paperStockSchema = z.object({
  name: z.string().min(1, 'Paper stock name is required').max(255, 'Name too long'),
  weight: z.coerce.number().min(1, 'Weight must be positive').max(1000, 'Weight too high'),
  price_per_sq_inch: z.coerce.number().min(0, 'Price must be positive').max(999.99, 'Price too high'),
  description: z.string().optional().nullable(),
  is_active: z.boolean()
});

export const coatingSchema = z.object({
  name: z.string().min(1, 'Coating name is required').max(255, 'Name too long'),
  price_modifier: z.coerce.number().min(0, 'Price modifier must be positive').max(999.99, 'Price modifier too high'),
  description: z.string().optional().nullable(),
  is_active: z.boolean()
});

export const printSizeSchema = z.object({
  name: z.string().min(1, 'Size name is required').max(255, 'Name too long'),
  width: z.coerce.number().min(0.1, 'Width must be positive').max(999.99, 'Width too large'),
  height: z.coerce.number().min(0.1, 'Height must be positive').max(999.99, 'Height too large'),
  is_active: z.boolean()
});

export const turnaroundTimeSchema = z.object({
  name: z.string().min(1, 'Turnaround time name is required').max(255, 'Name too long'),
  business_days: z.coerce.number().int().min(0, 'Business days must be positive').max(365, 'Too many days'),
  price_markup_percent: z.coerce.number().min(0, 'Markup must be positive').max(999.99, 'Markup too high'),
  is_active: z.boolean()
});

export const addOnSchema = z.object({
  name: z.string().min(1, 'Add-on name is required').max(255, 'Name too long'),
  pricing_model: z.enum(['flat', 'percentage', 'per_unit', 'per_sq_inch', 'custom']),
  configuration: z.any().default({}), // JSONB field
  description: z.string().optional().nullable(),
  is_active: z.boolean()
});

export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type VendorFormData = z.infer<typeof vendorSchema>;
export type PaperStockFormData = z.infer<typeof paperStockSchema>;
export type CoatingFormData = z.infer<typeof coatingSchema>;
export type PrintSizeFormData = z.infer<typeof printSizeSchema>;
export type TurnaroundTimeFormData = z.infer<typeof turnaroundTimeSchema>;
export type AddOnFormData = z.infer<typeof addOnSchema>;