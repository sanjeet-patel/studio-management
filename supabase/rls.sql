-- ============================================================
-- NSMS — Row Level Security Policies
-- All tenant-scoped tables are isolated by tenant_id via auth.uid()
-- Admin users (role='admin') bypass RLS via service_role key
-- ============================================================

-- Helper function to get the current user's tenant_id
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ── Users ──────────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_row" ON users
  FOR ALL USING (id = auth.uid());

-- ── Tenants ────────────────────────────────────────────────────────────────
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_read_own" ON tenants
  FOR SELECT USING (id = get_tenant_id() OR is_admin());
CREATE POLICY "tenant_update_own" ON tenants
  FOR UPDATE USING (id = get_tenant_id());

-- ── Subscriptions ──────────────────────────────────────────────────────────
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_tenant" ON subscriptions
  FOR SELECT USING (tenant_id = get_tenant_id() OR is_admin());

-- ── Customers ──────────────────────────────────────────────────────────────
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_tenant" ON customers
  FOR ALL USING (tenant_id = get_tenant_id());

-- ── Orders ─────────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_tenant" ON orders
  FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_tenant" ON order_items
  FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE tenant_id = get_tenant_id())
  );

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_tenant" ON payments
  FOR ALL USING (tenant_id = get_tenant_id());

-- ── Catalog ────────────────────────────────────────────────────────────────
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sizes_tenant" ON sizes FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE paper_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paper_types_tenant" ON paper_types FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE cover_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cover_types_tenant" ON cover_types FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accessories_tenant" ON accessories FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE photo_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photo_pricing_tenant" ON photo_pricing FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE cover_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cover_pricing_tenant" ON cover_pricing FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE velvet_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "velvet_rates_tenant" ON velvet_rates FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_categories_tenant" ON product_categories FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_tenant" ON products FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addons_tenant" ON addons FOR ALL USING (tenant_id = get_tenant_id());

-- ── Employees & Salaries ───────────────────────────────────────────────────
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_tenant" ON employees FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE salary_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salary_cycles_tenant" ON salary_cycles
  FOR ALL USING (
    employee_id IN (SELECT id FROM employees WHERE tenant_id = get_tenant_id())
  );

ALTER TABLE salary_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salary_adjustments_tenant" ON salary_adjustments
  FOR ALL USING (
    salary_cycle_id IN (
      SELECT sc.id FROM salary_cycles sc
      JOIN employees e ON e.id = sc.employee_id
      WHERE e.tenant_id = get_tenant_id()
    )
  );

ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salary_payments_tenant" ON salary_payments
  FOR ALL USING (
    salary_cycle_id IN (
      SELECT sc.id FROM salary_cycles sc
      JOIN employees e ON e.id = sc.employee_id
      WHERE e.tenant_id = get_tenant_id()
    )
  );

-- ── Bills ──────────────────────────────────────────────────────────────────
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recurring_bills_tenant" ON recurring_bills FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE bill_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bill_instances_tenant" ON bill_instances
  FOR ALL USING (
    recurring_bill_id IN (SELECT id FROM recurring_bills WHERE tenant_id = get_tenant_id())
  );

ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bill_payments_tenant" ON bill_payments
  FOR ALL USING (
    bill_instance_id IN (
      SELECT bi.id FROM bill_instances bi
      JOIN recurring_bills rb ON rb.id = bi.recurring_bill_id
      WHERE rb.tenant_id = get_tenant_id()
    )
  );

-- ── Expenses ───────────────────────────────────────────────────────────────
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expense_categories_tenant" ON expense_categories FOR ALL USING (tenant_id = get_tenant_id());

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_tenant" ON expenses FOR ALL USING (tenant_id = get_tenant_id());
