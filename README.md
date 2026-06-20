# NSMS Next — Studio Management System

A full-featured **multi-tenant Studio Management SaaS** built with **Next.js 15** + **Supabase**, deployable to **Vercel** in minutes.

This is a complete TypeScript rewrite of the Laravel NSMS application with identical functionality.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Multi-tenancy | Supabase Row Level Security (RLS) |
| UI | Tailwind CSS + shadcn/ui |
| PDF | Invoice page (print-to-PDF) |
| Export | jszip + papaparse |
| Deployment | Vercel |

---

## Features

### Super Admin Panel (`/admin`)
- Platform dashboard with stats
- Studio (tenant) CRUD — create, view, suspend/activate
- Per-tenant data export (ZIP with 19 CSV files)
- Subscription management

### Studio Panel (`/studio`)
- **Dashboard** — KPI cards (today's orders, collections, outstanding, etc.)
- **Customers** — Full CRUD with studio_name, mobile, WhatsApp
- **Orders** — Create with Photo/Cover/Accessory items, live pricing, status management, payments, printable invoice
- **Catalog** — Sizes, Paper Types (with Velvet flag), Cover Types, Accessories, Photo Pricing Matrix, Cover Pricing Matrix + Velvet Rate
- **Employees** — CRUD with salary config
- **Salaries** — Generate monthly cycles, adjustments (additions/deductions), payment tracking
- **Bills** — Recurring bill definitions, monthly instance generation, payment tracking
- **Expenses** — Categorized expense tracking
- **Reports** — Profit & Loss, Tally-style Ledger, Expense Breakdown, Customer Dues
- **Settings** — Studio profile, GST, invoice/order prefixes

---

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in order:
   ```bash
   # Run these files in the Supabase SQL Editor:
   supabase/migrations/001_schema.sql
   supabase/rls.sql
   supabase/seed.sql   # Optional: demo data
   ```
3. Copy your project credentials from **Settings → API**

### 2. Create Admin User

In Supabase Dashboard → Authentication → Users → Add User:
- Email: `admin@nsms.com`
- Password: your choice

Then in **SQL Editor**:
```sql
INSERT INTO users (id, name, email, role)
VALUES (
  '<auth-user-id-from-supabase>',
  'Super Admin',
  'admin@nsms.com',
  'admin'
);
```

### 3. Local Development

```bash
# Clone / navigate to project
cd /Users/apple/Public/Projects/nsms-next

# Install dependencies
npm install

# Copy env template and fill in values
cp .env.local .env.local
# Edit .env.local with your Supabase URL and keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Admin login: `/admin/login`
- Studio login: `/login`

### 4. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/youruser/nsms-next.git
git push -u origin main

# Then connect at vercel.com/new
```

**Environment Variables** (add in Vercel dashboard):
```
NEXT_PUBLIC_SUPABASE_URL     = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY    = eyJ...
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service key (admin bypass RLS) — **never expose client-side** |

---

## Project Structure

```
nsms-next/
├── app/
│   ├── login/                   # Studio login
│   ├── admin/                   # Super-admin panel
│   │   ├── dashboard/
│   │   ├── tenants/
│   │   └── subscriptions/
│   ├── studio/                  # Studio tenant panel
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── catalog/
│   │   ├── employees/
│   │   ├── salaries/
│   │   ├── bills/
│   │   ├── expenses/
│   │   ├── reports/
│   │   └── settings/
│   └── api/
│       └── export/[tenantId]/   # Tenant ZIP export
├── components/
│   ├── layout/                  # Sidebar components
│   └── studio/                  # Shared catalog components
├── lib/
│   ├── supabase/                # Client, server, admin, middleware helpers
│   └── actions/                 # Server Actions per module
├── types/
│   └── database.ts              # Full TypeScript types
├── supabase/
│   ├── migrations/001_schema.sql
│   ├── rls.sql
│   └── seed.sql
├── middleware.ts                 # Auth + route protection
└── vercel.json
```

---

## Multi-Tenancy Architecture

- All tenant-scoped tables have a `tenant_id UUID` column
- Supabase RLS policies ensure tenants can only see their own data
- A helper function `get_tenant_id()` resolves `auth.uid()` → `users.tenant_id`
- The admin panel uses a `service_role` client that bypasses RLS

---

## Creating a New Studio

1. Login as Super Admin → `/admin/login`
2. Go to Studios → New Studio
3. Fill in: studio name, slug, owner name, email, password
4. The system creates the tenant record + auth user automatically
5. The studio owner can now login at `/login`

---

## License

MIT — use freely for commercial or personal projects.
