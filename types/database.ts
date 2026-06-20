export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string | null;
          logo: string | null;
          address: string | null;
          city: string | null;
          pin: string | null;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          gst_number: string | null;
          invoice_prefix: string;
          order_prefix: string;
          status: "ACTIVE" | "SUSPENDED" | "TRIAL" | "EXPIRED";
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tenants"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Row"]>;
      };
      users: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          email: string;
          role: "admin" | "studio";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & { id: string; name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          plan: string;
          starts_at: string | null;
          ends_at: string | null;
          status: "active" | "expired" | "cancelled";
          amount: number;
          payment_ref: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { tenant_id: string; plan: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      customers: {
        Row: {
          id: string;
          tenant_id: string;
          customer_name: string;
          studio_name: string | null;
          mobile: string | null;
          whatsapp: string | null;
          address: string | null;
          city: string | null;
          notes: string | null;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]> & { tenant_id: string; customer_name: string };
        Update: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          order_no: string;
          order_type: string | null;
          customer_id: string | null;
          order_date: string;
          delivery_date: string | null;
          delivery_mode: "PICKUP" | "COURIER" | "HOME_DELIVERY";
          subtotal: number;
          discount: number;
          tax_percent: number;
          grand_total: number;
          order_status: "PENDING" | "PROCESSING" | "READY" | "DELIVERED" | "CANCELLED";
          payment_status: "UNPAID" | "PARTIAL" | "PAID";
          notes: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & { tenant_id: string; order_no: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_type: "PHOTO" | "COVER" | "ACCESSORY";
          product_id: string | null;
          size_id: string | null;
          paper_type_id: string | null;
          cover_type_id: string | null;
          accessory_id: string | null;
          service_mode: string | null;
          needs_velvet: boolean;
          velvet_rate: number;
          qty: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & { order_id: string; qty: number; unit_price: number; line_total: number };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string;
          payment_date: string;
          amount: number;
          payment_method: "CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "CHEQUE" | "OTHER";
          remarks: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & { tenant_id: string; order_id: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      employees: {
        Row: {
          id: string;
          tenant_id: string;
          employee_name: string;
          mobile: string | null;
          joining_date: string | null;
          salary: number;
          salary_due_day: number;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["employees"]["Row"]> & { tenant_id: string; employee_name: string; salary: number };
        Update: Partial<Database["public"]["Tables"]["employees"]["Row"]>;
      };
      salary_cycles: {
        Row: {
          id: string;
          employee_id: string;
          month_year: string;
          salary_amount: number;
          due_date: string | null;
          status: "PENDING" | "PARTIAL" | "PAID";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["salary_cycles"]["Row"]> & { employee_id: string; month_year: string; salary_amount: number };
        Update: Partial<Database["public"]["Tables"]["salary_cycles"]["Row"]>;
      };
      salary_adjustments: {
        Row: {
          id: string;
          salary_cycle_id: string;
          type: "addition" | "deduction";
          reason: string;
          amount: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["salary_adjustments"]["Row"]> & { salary_cycle_id: string; type: "addition" | "deduction"; reason: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["salary_adjustments"]["Row"]>;
      };
      salary_payments: {
        Row: {
          id: string;
          salary_cycle_id: string;
          payment_date: string;
          amount: number;
          remarks: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["salary_payments"]["Row"]> & { salary_cycle_id: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["salary_payments"]["Row"]>;
      };
      recurring_bills: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          amount: number;
          due_day: number;
          frequency: "monthly" | "quarterly" | "yearly";
          start_date: string;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["recurring_bills"]["Row"]> & { tenant_id: string; name: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["recurring_bills"]["Row"]>;
      };
      bill_instances: {
        Row: {
          id: string;
          recurring_bill_id: string;
          month_year: string;
          amount: number;
          due_date: string;
          status: "PENDING" | "PARTIAL" | "PAID";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bill_instances"]["Row"]> & { recurring_bill_id: string; month_year: string; amount: number; due_date: string };
        Update: Partial<Database["public"]["Tables"]["bill_instances"]["Row"]>;
      };
      bill_payments: {
        Row: {
          id: string;
          bill_instance_id: string;
          payment_date: string;
          amount: number;
          remarks: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bill_payments"]["Row"]> & { bill_instance_id: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["bill_payments"]["Row"]>;
      };
      expense_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expense_categories"]["Row"]> & { tenant_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["expense_categories"]["Row"]>;
      };
      expenses: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          expense_date: string;
          amount: number;
          is_paid: boolean;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]> & { tenant_id: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
      };
      sizes: {
        Row: { id: string; tenant_id: string; name: string; sort_order: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["sizes"]["Row"]> & { tenant_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["sizes"]["Row"]>;
      };
      paper_types: {
        Row: { id: string; tenant_id: string; name: string; supports_velvet: boolean; sort_order: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["paper_types"]["Row"]> & { tenant_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["paper_types"]["Row"]>;
      };
      cover_types: {
        Row: { id: string; tenant_id: string; name: string; sort_order: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["cover_types"]["Row"]> & { tenant_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["cover_types"]["Row"]>;
      };
      accessories: {
        Row: { id: string; tenant_id: string; name: string; default_price: number; allow_price_override: boolean; sort_order: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["accessories"]["Row"]> & { tenant_id: string; name: string; default_price: number };
        Update: Partial<Database["public"]["Tables"]["accessories"]["Row"]>;
      };
      photo_pricing: {
        Row: { id: string; tenant_id: string; size_id: string; paper_type_id: string; service_mode: string; base_price: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["photo_pricing"]["Row"]> & { tenant_id: string; size_id: string; paper_type_id: string; service_mode: string; base_price: number };
        Update: Partial<Database["public"]["Tables"]["photo_pricing"]["Row"]>;
      };
      cover_pricing: {
        Row: { id: string; tenant_id: string; size_id: string; cover_type_id: string; service_mode: string; price: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["cover_pricing"]["Row"]> & { tenant_id: string; size_id: string; cover_type_id: string; service_mode: string; price: number };
        Update: Partial<Database["public"]["Tables"]["cover_pricing"]["Row"]>;
      };
      velvet_rates: {
        Row: { id: string; tenant_id: string; rate: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["velvet_rates"]["Row"]> & { tenant_id: string; rate: number };
        Update: Partial<Database["public"]["Tables"]["velvet_rates"]["Row"]>;
      };
      product_categories: {
        Row: { id: string; tenant_id: string; name: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["product_categories"]["Row"]> & { tenant_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
      };
      products: {
        Row: { id: string; tenant_id: string; category_id: string | null; name: string; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & { tenant_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      addons: {
        Row: { id: string; tenant_id: string; name: string; pricing_type: string; amount: number; status: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["addons"]["Row"]> & { tenant_id: string; name: string; amount: number };
        Update: Partial<Database["public"]["Tables"]["addons"]["Row"]>;
      };
    };
    Views: {};
    Functions: {
      get_tenant_id: { Args: {}; Returns: string };
      is_admin: { Args: {}; Returns: boolean };
    };
    Enums: {};
  };
}

// Convenience row types
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type SalaryCycle = Database["public"]["Tables"]["salary_cycles"]["Row"];
export type SalaryAdjustment = Database["public"]["Tables"]["salary_adjustments"]["Row"];
export type SalaryPayment = Database["public"]["Tables"]["salary_payments"]["Row"];
export type RecurringBill = Database["public"]["Tables"]["recurring_bills"]["Row"];
export type BillInstance = Database["public"]["Tables"]["bill_instances"]["Row"];
export type BillPayment = Database["public"]["Tables"]["bill_payments"]["Row"];
export type ExpenseCategory = Database["public"]["Tables"]["expense_categories"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Size = Database["public"]["Tables"]["sizes"]["Row"];
export type PaperType = Database["public"]["Tables"]["paper_types"]["Row"];
export type CoverType = Database["public"]["Tables"]["cover_types"]["Row"];
export type Accessory = Database["public"]["Tables"]["accessories"]["Row"];
export type PhotoPricing = Database["public"]["Tables"]["photo_pricing"]["Row"];
export type CoverPricing = Database["public"]["Tables"]["cover_pricing"]["Row"];
export type VelvetRate = Database["public"]["Tables"]["velvet_rates"]["Row"];
