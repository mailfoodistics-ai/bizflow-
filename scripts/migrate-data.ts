#!/usr/bin/env node

/**
 * Migration Helper Script
 * This script helps migrate from mockup data to Supabase database
 * 
 * Usage: npx ts-node scripts/migrate-data.ts
 */

import { supabase, Product, Customer, Invoice, InvoiceItem } from "../src/lib/supabase";
import { sampleProducts, sampleCustomers, sampleInvoices } from "../src/lib/store-data";

const DEMO_USER_ID = "your-demo-user-id"; // Set this to your demo user ID in Supabase

async function migrateData() {
  try {
    console.log("Starting data migration...\n");

    // Step 1: Create store settings (if not exists)
    console.log("1. Creating store settings...");
    const { data: existingStore, error: checkError } = await supabase
      .from("store_settings")
      .select("id")
      .eq("user_id", DEMO_USER_ID)
      .single();

    let storeId: string;

    if (existingStore) {
      storeId = existingStore.id;
      console.log("   ✓ Store already exists");
    } else {
      const { data: newStore, error: createError } = await supabase
        .from("store_settings")
        .insert({
          user_id: DEMO_USER_ID,
          store_name: "Demo Store",
          store_address: "123 Market Road, New Delhi",
          store_phone: "9876543200",
          gst_number: "07AAACR5055K1Z5",
          upi_id: "demostore@upi",
          invoice_prefix: "INV",
        })
        .select()
        .single();

      if (createError) {
        console.error("   ✗ Error creating store:", createError.message);
        return;
      }

      storeId = newStore.id;
      console.log("   ✓ Store created successfully\n");
    }

    // Step 2: Migrate products
    console.log("2. Migrating products...");
    const productsToInsert: Omit<Product, "id" | "created_at" | "updated_at">[] = sampleProducts.map((p) => ({
      store_id: storeId,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      barcode: p.barcode,
    }));

    const { data: insertedProducts, error: productsError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (productsError) {
      console.error("   ✗ Error inserting products:", productsError.message);
    } else {
      console.log(`   ✓ ${insertedProducts?.length || 0} products migrated\n`);
    }

    // Step 3: Migrate customers
    console.log("3. Migrating customers...");
    const customersToInsert: Omit<Customer, "id" | "created_at" | "updated_at">[] = sampleCustomers.map((c) => ({
      store_id: storeId,
      name: c.name,
      phone: c.phone,
      email: c.email,
      total_purchases: c.totalPurchases,
    }));

    const { data: insertedCustomers, error: customersError } = await supabase
      .from("customers")
      .insert(customersToInsert)
      .select();

    if (customersError) {
      console.error("   ✗ Error inserting customers:", customersError.message);
    } else {
      console.log(`   ✓ ${insertedCustomers?.length || 0} customers migrated\n`);
    }

    // Step 4: Migrate invoices
    console.log("4. Migrating invoices...");
    if (insertedProducts && insertedCustomers) {
      for (const invoice of sampleInvoices) {
        // Map sample products to inserted products
        const mappedItems = invoice.items.map((item) => {
          const insertedProduct = insertedProducts.find((p) => p.name === item.product.name);
          return {
            product_id: insertedProduct?.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            subtotal: item.product.price * item.quantity,
          };
        });

        const mappedCustomer = insertedCustomers.find((c) => c.name === invoice.customer?.name);

        // Create invoice
        const { data: createdInvoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            store_id: storeId,
            number: invoice.number,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            discount: invoice.discount,
            total: invoice.total,
            payment_method: invoice.paymentMethod,
            payment_status: "completed",
            customer_id: mappedCustomer?.id,
          })
          .select()
          .single();

        if (invoiceError) {
          console.error(`   ✗ Error creating invoice ${invoice.number}:`, invoiceError.message);
          continue;
        }

        // Create invoice items
        const itemsToInsert = mappedItems.map((item) => ({
          invoice_id: createdInvoice.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }));

        const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);

        if (itemsError) {
          console.error(`   ✗ Error creating items for ${invoice.number}:`, itemsError.message);
        }
      }
      console.log(`   ✓ ${sampleInvoices.length} invoices migrated\n`);
    }

    console.log("✓ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Remove sampleData imports from pages");
    console.log("2. Use database service functions instead");
    console.log("3. Test all features with real data");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run migration
migrateData();
