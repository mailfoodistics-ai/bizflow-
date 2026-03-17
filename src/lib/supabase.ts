import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface Product {
  id: string;
  store_id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  email: string;
  total_purchases: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Invoice {
  id: string;
  store_id: string;
  number: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: "pending" | "completed" | "failed";
  upi_reference?: string;
  customer_id?: string;
  customer?: Customer;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  user_id: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  gst_number: string;
  upi_id: string;
  invoice_prefix: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  store_id?: string;
}
