-- ============================================================
-- NSMS Studio Management System — PostgreSQL Schema (Supabase)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Platform Tables ──────────────────────────────────────────────────────────

CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  tagline         TEXT,
  logo            TEXT,
  address         TEXT,
  city            TEXT,
  pin             TEXT,
  phone           TEXT,
  email           TEXT,
  whatsapp        TEXT,
  gst_number      TEXT,
  invoice_prefix  TEXT DEFAULT 'INV',
  order_prefix    TEXT DEFAULT 'ORD',
  status          TEXT NOT NULL DEFAULT 'TRIAL' CHECK (status IN ('ACTIVE','SUSPENDED','TRIAL','EXPIRED')),
  trial_ends_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Users are linked to Supabase auth.users via id
-- The users table stores tenant context and profile data
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'studio' CHECK (role IN ('admin','studio')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL DEFAULT 'basic',
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  amount      NUMERIC(10,2) DEFAULT 0,
  payment_ref TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Customers ─────────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_name  TEXT NOT NULL,
  studio_name    TEXT,
  mobile         TEXT,
  whatsapp       TEXT,
  address        TEXT,
  city           TEXT,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Product / Catalog Legacy (kept for compatibility) ─────────────────────────

CREATE TABLE product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  pricing_type TEXT NOT NULL DEFAULT 'flat' CHECK (pricing_type IN ('flat','per_qty')),
  amount       NUMERIC(10,2) DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Domain Catalog (Photo / Cover / Accessories) ──────────────────────────────

CREATE TABLE sizes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE paper_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  supports_velvet BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cover_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE accessories (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  default_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  allow_price_override BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order           INT DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'active',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE photo_pricing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  size_id       UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  paper_type_id UUID NOT NULL REFERENCES paper_types(id) ON DELETE CASCADE,
  service_mode  TEXT NOT NULL CHECK (service_mode IN ('DESIGN_ONLY','PRINT_ONLY','DESIGN_PRINT')),
  base_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, size_id, paper_type_id, service_mode)
);

CREATE TABLE cover_pricing (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  size_id       UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  cover_type_id UUID NOT NULL REFERENCES cover_types(id) ON DELETE CASCADE,
  service_mode  TEXT NOT NULL CHECK (service_mode IN ('DESIGN_ONLY','PRINT_ONLY','DESIGN_PRINT')),
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, size_id, cover_type_id, service_mode)
);

CREATE TABLE velvet_rates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rate        NUMERIC(10,2) NOT NULL DEFAULT 10,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id)
);

-- ── Orders ────────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_no       TEXT NOT NULL,
  order_type     TEXT,
  customer_id    UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date  DATE,
  delivery_mode  TEXT DEFAULT 'PICKUP' CHECK (delivery_mode IN ('PICKUP','COURIER','HOME_DELIVERY')),
  subtotal       NUMERIC(10,2) DEFAULT 0,
  discount       NUMERIC(10,2) DEFAULT 0,
  tax_percent    NUMERIC(5,2) DEFAULT 0,
  grand_total    NUMERIC(10,2) DEFAULT 0,
  order_status   TEXT NOT NULL DEFAULT 'PENDING' CHECK (order_status IN ('PENDING','PROCESSING','READY','DELIVERED','CANCELLED')),
  payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID','PARTIAL','PAID')),
  notes          TEXT,
  remarks        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type     TEXT NOT NULL DEFAULT 'PHOTO' CHECK (item_type IN ('PHOTO','COVER','ACCESSORY')),
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  size_id       UUID REFERENCES sizes(id) ON DELETE SET NULL,
  paper_type_id UUID REFERENCES paper_types(id) ON DELETE SET NULL,
  cover_type_id UUID REFERENCES cover_types(id) ON DELETE SET NULL,
  accessory_id  UUID REFERENCES accessories(id) ON DELETE SET NULL,
  service_mode  TEXT,
  needs_velvet  BOOLEAN DEFAULT FALSE,
  velvet_rate   NUMERIC(10,2) DEFAULT 0,
  qty           INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  line_total    NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  amount          NUMERIC(10,2) NOT NULL,
  payment_method  TEXT DEFAULT 'CASH' CHECK (payment_method IN ('CASH','UPI','BANK_TRANSFER','CARD','CHEQUE','OTHER')),
  remarks         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Employees & Salaries ──────────────────────────────────────────────────────

CREATE TABLE employees (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_name    TEXT NOT NULL,
  mobile           TEXT,
  joining_date     DATE,
  salary           NUMERIC(10,2) NOT NULL DEFAULT 0,
  salary_due_day   INT DEFAULT 1,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salary_cycles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month_year     TEXT NOT NULL,
  salary_amount  NUMERIC(10,2) NOT NULL,
  due_date       DATE,
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PARTIAL','PAID')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, month_year)
);

CREATE TABLE salary_adjustments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_cycle_id  UUID NOT NULL REFERENCES salary_cycles(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('addition','deduction')),
  reason           TEXT NOT NULL,
  amount           NUMERIC(10,2) NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salary_payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_cycle_id  UUID NOT NULL REFERENCES salary_cycles(id) ON DELETE CASCADE,
  payment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  amount           NUMERIC(10,2) NOT NULL,
  remarks          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Recurring Bills ───────────────────────────────────────────────────────────

CREATE TABLE recurring_bills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  due_day     INT NOT NULL DEFAULT 1,
  frequency   TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly','quarterly','yearly')),
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bill_instances (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_bill_id UUID NOT NULL REFERENCES recurring_bills(id) ON DELETE CASCADE,
  month_year        TEXT NOT NULL,
  amount            NUMERIC(10,2) NOT NULL,
  due_date          DATE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PARTIAL','PAID')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (recurring_bill_id, month_year)
);

CREATE TABLE bill_payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_instance_id UUID NOT NULL REFERENCES bill_instances(id) ON DELETE CASCADE,
  payment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  amount           NUMERIC(10,2) NOT NULL,
  remarks          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Expenses ─────────────────────────────────────────────────────────────────

CREATE TABLE expense_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id  UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount       NUMERIC(10,2) NOT NULL,
  is_paid      BOOLEAN DEFAULT TRUE,
  remarks      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX idx_salary_cycles_employee_id ON salary_cycles(employee_id);
CREATE INDEX idx_salary_cycles_month_year ON salary_cycles(month_year);
CREATE INDEX idx_recurring_bills_tenant_id ON recurring_bills(tenant_id);
CREATE INDEX idx_bill_instances_recurring_bill_id ON bill_instances(recurring_bill_id);
CREATE INDEX idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_sizes_tenant_id ON sizes(tenant_id);
CREATE INDEX idx_paper_types_tenant_id ON paper_types(tenant_id);
CREATE INDEX idx_cover_types_tenant_id ON cover_types(tenant_id);
CREATE INDEX idx_accessories_tenant_id ON accessories(tenant_id);
CREATE INDEX idx_photo_pricing_tenant_id ON photo_pricing(tenant_id);
CREATE INDEX idx_cover_pricing_tenant_id ON cover_pricing(tenant_id);
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
