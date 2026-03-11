-- Run this in your Supabase SQL Editor to create the necessary tables

-- Seeds Inventory
CREATE TABLE seeds_inventory (
  seed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_name TEXT NOT NULL,
  seed_variety TEXT,
  category TEXT,
  supplier TEXT,
  date_received DATE,
  expiration_date DATE,
  quantity_received NUMERIC NOT NULL DEFAULT 0,
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  storage_location TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fertilizers Inventory
CREATE TABLE fertilizers_inventory (
  fertilizer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fertilizer_name TEXT NOT NULL,
  type TEXT,
  brand TEXT,
  supplier TEXT,
  date_received DATE,
  quantity_received NUMERIC NOT NULL DEFAULT 0,
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  storage_location TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veterinary & Chemicals
CREATE TABLE vet_chemicals (
  vet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  supplier TEXT,
  date_received DATE,
  expiration_date DATE,
  quantity_received NUMERIC NOT NULL DEFAULT 0,
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  storage_location TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pesticides Inventory
CREATE TABLE pesticides_inventory (
  pesticide_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesticide_name TEXT NOT NULL,
  type TEXT,
  brand TEXT,
  supplier TEXT,
  date_received DATE,
  expiration_date DATE,
  quantity_received NUMERIC NOT NULL DEFAULT 0,
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  storage_location TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipients (Farmers / Beneficiaries)
CREATE TABLE recipients (
  recipient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  gender TEXT,
  barangay TEXT,
  municipality TEXT,
  contact_number TEXT,
  farm_size NUMERIC,
  farmer_group TEXT,
  date_registered DATE DEFAULT CURRENT_DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Distribution Records
CREATE TABLE distribution_records (
  distribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(recipient_id) ON DELETE CASCADE,
  distribution_date DATE DEFAULT CURRENT_DATE,
  distributed_by TEXT,
  program TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Distribution Log (Items Distributed)
CREATE TABLE distribution_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES distribution_records(distribution_id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'Seed', 'Fertilizer', 'Vet', 'Pesticide'
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity_given NUMERIC NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In a real app, this should be hashed. For simplicity here, we'll store plain or use Supabase Auth.
  role TEXT DEFAULT 'Staff',
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
