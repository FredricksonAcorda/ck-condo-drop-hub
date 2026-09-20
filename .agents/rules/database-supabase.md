# Skill Rule: database-supabase

> **Description & Purpose**: Supabase PostgreSQL database architecture, Row-Level Security (RLS), and Supabase Auth. Use when designing relational schemas, writing SQL migrations, defining RLS access policies, or integrating Supabase client into Next.js.
> **Skill Reference**: [SKILL.md](../skills/database-supabase/SKILL.md)

When this rule or skill is mentioned via `@database-supabase`, the agent must activate the **database-supabase** skill procedures and adhere strictly to its workflows.

---

# Supabase PostgreSQL & RLS Skill

> Specialized for Supabase PostgreSQL, Row-Level Security, and Server-Side Auth.

## Core Rules

### 1. Relational Schema & Foreign Keys
- Model entities with strict foreign key constraints and appropriate indexes:
  - `profiles`: `id (uuid, references auth.users)`, `full_name`, `phone`, `unit`, `tower`, `role ('customer' | 'admin')`.
  - `parcels`: `id (uuid)`, `tracking_number (unique)`, `courier`, `resident_id (references profiles.id)`, `shelf_location`, `status`, `arrived_at`, `pickup_deadline`, `holding_fee`, `claim_code`.
  - Create B-tree indexes on foreign keys and frequently queried fields (`resident_id`, `status`, `tracking_number`).

### 2. Row-Level Security (RLS) is Mandatory
- Always enable RLS on every table:
  ```sql
  alter table parcels enable row level security;
  ```
- Write explicit policies for role-based access:
  ```sql
  -- Residents can only view their own parcels
  create policy "Residents can view own parcels"
    on parcels for select
    using (auth.uid() = resident_id);

  -- Admins can view and manage all parcels
  create policy "Admins full access to parcels"
    on parcels for all
    using (
      exists (
        select 1 from profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    );
  ```

### 3. SSR & Server Component Integration
- Use `@supabase/ssr` with Next.js App Router for cookie-based session management across Server Components, Server Actions, and Route Handlers.
- Refresh session tokens automatically inside Next.js `middleware.ts`.
- Never expose the `service_role` key on the client; use the public `anon` key with RLS enforcement.
