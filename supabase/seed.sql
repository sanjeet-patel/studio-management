-- ============================================================
-- NSMS Seed Data — Demo Admin + Demo Studio Tenant
-- Run AFTER schema + RLS setup
-- Note: Auth users must be created via Supabase Dashboard or Auth API first
-- Then run this to populate profile rows
-- ============================================================

-- Demo Tenant
INSERT INTO tenants (id, name, slug, tagline, address, city, pin, phone, email, whatsapp, gst_number, invoice_prefix, order_prefix, status, trial_ends_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Demo Photo Studio',
  'demo-studio',
  'Capturing Memories Since 2010',
  '123 Main Street',
  'Mumbai',
  '400001',
  '9876543210',
  'demo@photostudio.com',
  '9876543210',
  'GST123456789',
  'DMS-INV',
  'DMS-ORD',
  'ACTIVE',
  NOW() + INTERVAL '365 days'
);

-- Catalog seed for demo tenant

-- Sizes
INSERT INTO sizes (tenant_id, name, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12x30', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12x36', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '14x40', 3);

-- Paper Types
INSERT INTO paper_types (tenant_id, name, supports_velvet, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'High Glossy',       TRUE,  1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thermal Matte',     FALSE, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NTR Slim Glossy',   TRUE,  3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NTR Heavy Glossy',  TRUE,  4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NTR Heavy Matte',   FALSE, 5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Transparent',       FALSE, 6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Embossed',          FALSE, 7);

-- Cover Types
INSERT INTO cover_types (tenant_id, name, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Normal Cover',    1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '3D Cover',        2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sparkle Cover',   3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Half Acrylic',    4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Full Acrylic',    5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Briefcase Combo', 6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Engraving Combo', 7),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Double Decker',   8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Piano Combo',     9);

-- Accessories
INSERT INTO accessories (tenant_id, name, default_price, allow_price_override, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Photo Bag',      150, TRUE, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Full Photo Bag', 250, TRUE, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Leather Bag',    350, TRUE, 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mini Book',      300, TRUE, 4),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Table Calendar', 200, TRUE, 5),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Digital Book',   500, TRUE, 6),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Frame',          450, TRUE, 7);

-- Velvet rate
INSERT INTO velvet_rates (tenant_id, rate) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10);

-- Expense Categories
INSERT INTO expense_categories (tenant_id, name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rent'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electricity'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Supplies'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Marketing'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Miscellaneous');

-- Recurring Bills
INSERT INTO recurring_bills (tenant_id, name, amount, due_day, start_date) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Studio Rent',        8000, 1, CURRENT_DATE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electricity',        1500, 5, CURRENT_DATE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Internet',            999, 10, CURRENT_DATE);

-- Demo Customers
INSERT INTO customers (tenant_id, customer_name, studio_name, mobile, city) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Raj Sharma',   'Raj Creations',   '9876500001', 'Mumbai'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Priya Singh',  'Singh Snaps',     '9876500002', 'Pune'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Amit Verma',   'Verma Studio',    '9876500003', 'Delhi'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Deepa Patel',  NULL,              '9876500004', 'Ahmedabad');

-- Demo Employee
INSERT INTO employees (tenant_id, employee_name, mobile, joining_date, salary, salary_due_day) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ravi Kumar',    '9876500010', '2024-01-01', 15000, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sunita Joshi',  '9876500011', '2024-03-01', 12000, 1);
