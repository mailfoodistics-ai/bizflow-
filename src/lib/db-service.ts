import { supabase, Product, Customer, Invoice, InvoiceItem, StoreSettings } from "./supabase";

// Products
export async function getProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addProduct(storeId: string, product: Omit<Product, "id" | "created_at" | "updated_at" | "store_id">) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      ...product,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw error;
}

// Customers
export async function getCustomers(storeId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addCustomer(storeId: string, customer: Omit<Customer, "id" | "created_at" | "updated_at" | "store_id">) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      store_id: storeId,
      ...customer,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(customerId: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Invoices
export async function getInvoices(storeId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      items:invoice_items(
        id,
        invoice_id,
        product_id,
        quantity,
        unit_price,
        subtotal,
        product:products(*)
      ),
      customer:customers(*)
    `
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createInvoice(
  storeId: string,
  invoice: Omit<Invoice, "id" | "created_at" | "updated_at" | "store_id">,
  items: Omit<InvoiceItem, "id" | "invoice_id">[]
) {
  // Create invoice
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      store_id: storeId,
      ...invoice,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Create invoice items
  const itemsToInsert = items.map((item) => ({
    ...item,
    invoice_id: invoiceData.id,
  }));

  const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);

  if (itemsError) throw itemsError;

  return invoiceData;
}

export async function updateInvoicePaymentStatus(invoiceId: string, status: "pending" | "completed" | "failed", upiReference?: string) {
  const { data, error } = await supabase
    .from("invoices")
    .update({
      payment_status: status,
      upi_reference: upiReference,
    })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Store Settings
export async function getStoreSettings(userId: string): Promise<StoreSettings | null> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching store settings:", error);
      throw error;
    }
    
    // If no settings exist, create default ones
    if (!data) {
      const { data: newSettings, error: createError } = await supabase
        .from("store_settings")
        .insert({
          user_id: userId,
          store_name: "My Store",
          store_address: "",
          store_phone: "",
          gst_number: "5", // Default 5% GST
          upi_id: "",
          invoice_prefix: "INV",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating store settings:", createError);
        return null;
      }
      return newSettings;
    }
    
    return data;
  } catch (error) {
    console.error("Store settings error:", error);
    return null;
  }
}

export async function updateStoreSettings(userId: string, updates: Partial<StoreSettings>) {
  const { data, error } = await supabase
    .from("store_settings")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Search products
export async function searchProducts(storeId: string, query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .or(`name.ilike.%${query}%,barcode.eq.${query}`)
    .order("name");

  if (error) throw error;
  return data || [];
}
