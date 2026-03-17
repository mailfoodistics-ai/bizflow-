-- BizFlow POS - Supabase Schema

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Users (extends auth.users)
-- No need to create, Supabase handles this

-- Store Settings
create table if not exists public.store_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  store_name text not null,
  store_address text default '',
  store_phone text default '',
  gst_number text default '',
  upi_id text default '',
  invoice_prefix text default 'INV',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Products
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid not null references public.store_settings(id) on delete cascade,
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  barcode text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, barcode)
);

-- Customers
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid not null references public.store_settings(id) on delete cascade,
  name text not null,
  phone text not null,
  email text not null,
  total_purchases numeric(12,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid not null references public.store_settings(id) on delete cascade,
  number text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null,
  tax numeric(12,2) not null,
  discount numeric(12,2) default 0,
  total numeric(12,2) not null,
  payment_method text not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  upi_reference text,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id, number)
);

-- Invoice Items (denormalized for easy retrieval)
create table if not exists public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  subtotal numeric(12,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_store_settings_user_id on public.store_settings(user_id);
create index idx_products_store_id on public.products(store_id);
create index idx_products_barcode on public.products(barcode);
create index idx_customers_store_id on public.customers(store_id);
create index idx_customers_phone on public.customers(phone);
create index idx_invoices_store_id on public.invoices(store_id);
create index idx_invoices_created_at on public.invoices(created_at);
create index idx_invoices_payment_status on public.invoices(payment_status);
create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
create index idx_invoice_items_product_id on public.invoice_items(product_id);

-- Row Level Security (RLS)
alter table public.store_settings enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- RLS Policies for store_settings
create policy "Users can view their own store settings"
  on public.store_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own store settings"
  on public.store_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own store settings"
  on public.store_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for products (through store_settings)
create policy "Users can view their store products"
  on public.products for select
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can insert products to their store"
  on public.products for insert
  with check (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can update their store products"
  on public.products for update
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can delete their store products"
  on public.products for delete
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

-- RLS Policies for customers
create policy "Users can view their store customers"
  on public.customers for select
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can insert customers to their store"
  on public.customers for insert
  with check (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can update their store customers"
  on public.customers for update
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

-- RLS Policies for invoices
create policy "Users can view their store invoices"
  on public.invoices for select
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can insert invoices to their store"
  on public.invoices for insert
  with check (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

create policy "Users can update their store invoices"
  on public.invoices for update
  using (
    store_id in (
      select id from public.store_settings
      where user_id = auth.uid()
    )
  );

-- RLS Policies for invoice_items
create policy "Users can view invoice items from their store"
  on public.invoice_items for select
  using (
    invoice_id in (
      select id from public.invoices
      where store_id in (
        select id from public.store_settings
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can insert invoice items to their store"
  on public.invoice_items for insert
  with check (
    invoice_id in (
      select id from public.invoices
      where store_id in (
        select id from public.store_settings
        where user_id = auth.uid()
      )
    )
  );

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_store_settings_updated_at before update on public.store_settings
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at before update on public.products
  for each row execute function update_updated_at_column();

create trigger update_customers_updated_at before update on public.customers
  for each row execute function update_updated_at_column();

create trigger update_invoices_updated_at before update on public.invoices
  for each row execute function update_updated_at_column();

-- Insert sample data (optional - remove in production)
-- This will only work after a user is created
-- insert into public.store_settings (user_id, store_name, store_address, store_phone, gst_number, upi_id, invoice_prefix)
-- values ('user-uuid', 'Demo Store', '123 Market Road', '9876543200', '07AAACR5055K1Z5', 'demostore@upi', 'INV');
