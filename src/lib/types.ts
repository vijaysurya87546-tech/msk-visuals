// =============================================
// MSK VISUALS - TypeScript Type Definitions
// =============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  mrp: number;
  discount_percent: number;
  category_id: string | null;
  material: string | null;
  is_customizable: boolean;
  is_active: boolean;
  is_featured: boolean;
  stock: number;
  sku: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  sizes?: ProductSize[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size_label: string;
  price: number;
  mrp: number;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  notes: string | null;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  quantity: number;
  price: number;
  total: number;
  customization_name: string | null;
  customization_phone: string | null;
  customization_instructions: string | null;
  uploaded_image_url: string | null;
  created_at: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Designing'
  | 'Printing'
  | 'Processing'
  | 'Ready'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface CustomOrder {
  id: string;
  custom_order_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  product_type: string;
  frame_size: string | null;
  quantity: number;
  customization_details: string | null;
  delivery_address: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  files?: CustomOrderFile[];
}

export interface CustomOrderFile {
  id: string;
  custom_order_id: string;
  file_url: string;
  file_type: string | null;
  file_name: string | null;
  created_at: string;
}

export interface PriceListItem {
  id: string;
  size_label: string;
  width: number | null;
  height: number | null;
  price: number;
  mrp: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  notes: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string | null;
  product_id: string | null;
  name: string;
  rating: number;
  review: string | null;
  image_url: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: string;
  label: string | null;
  group_name: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Cart Types
export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  size: string;
  price: number;
  mrp: number;
  quantity: number;
  is_customizable: boolean;
  customization_name?: string;
  customization_phone?: string;
  customization_instructions?: string;
  uploaded_image?: string;
  uploaded_image_file?: File;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  totalCustomers: number;
  customOrders: number;
  revenue: number;
}
