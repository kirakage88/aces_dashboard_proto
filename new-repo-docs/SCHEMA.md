# ACES Dashboard — Database Schema

> **Platform:** Supabase (PostgreSQL 15+)
> **Migration tool:** Supabase SQL Editor (run migration.sql manually)
> **Auth:** Supabase Auth (Google OAuth)

---

## Entity Relationship

```
departments (lookup)
    │
    ├──< users         (FK: department_id)
    │
    └──< projects      (FK: department_id)
         │
         └──< transactions  (FK: project_id)
                             (FK: department_id)

templates (standalone, no FK to departments)
```

---

## Table: `departments`

Lookup table. Seeded once, rarely modified.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGINT` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `code` | `VARCHAR(10)` | `UNIQUE NOT NULL` | Short code: `OP`, `OVP`, `OES`, etc. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Full name: `Office of the President` |
| `has_custom_tabs` | `BOOLEAN` | `DEFAULT FALSE` | Whether this dept gets custom dashboard tabs |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

**Seed values:**

| code | name | has_custom_tabs |
|---|---|---|
| `OP` | Office of the President | `true` |
| `OVP` | Office of the Vice President | `true` |
| `OES` | Office of the Executive Secretary | `true` |
| `Finance` | Finance & Treasury | `true` |
| `Events` | Events Management | `true` |
| `DRCA` | Research & Constituent Affairs | `true` |
| `General` | Cross-Department / Shared | `false` |

---

## Table: `users`

Linked 1:1 with Supabase Auth (`auth.users`). Created on first Google OAuth login via a trigger or application logic.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK` `REFERENCES auth.users(id) ON DELETE CASCADE` | Matches Supabase Auth UID |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | From Google profile |
| `display_name` | `VARCHAR(100)` | | From Google profile |
| `department_id` | `BIGINT` | `REFERENCES departments(id)` | Which department this user belongs to |
| `role` | `VARCHAR(20)` | `NOT NULL DEFAULT 'standard'` `CHECK (role IN ('executive','finance','events','drca','standard'))` | Determines RLS scope |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

**Role hierarchy:**

| Role | RLS Behavior | Tab Access |
|---|---|---|
| `executive` | Sees ALL data across all departments | Full tab set (OP/OVP/OES) |
| `finance` | Sees only `Finance` department data | Ledger + custom finance tabs |
| `events` | Sees only `Events` department data | Projects + Calendar + events tab |
| `drca` | Sees only `DRCA` department data | Projects + Calendar |
| `standard` | Sees only their own department data | Projects + Calendar |

---

## Table: `projects`

One row per audit project. Maps from the Project Tracker Google Sheet.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGINT` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `department_id` | `BIGINT` | `REFERENCES departments(id)` | Which department owns this project |
| `project_code` | `VARCHAR(20)` | | e.g. `06-001` |
| `name` | `VARCHAR(255)` | `NOT NULL` | Project name |
| `head` | `VARCHAR(100)` | | Project head / point person |
| `area_focus` | `VARCHAR(100)` | | e.g. `Organizational Development` |
| `implementation_date` | `DATE` | | Used by Calendar tab |
| `status` | `VARCHAR(50)` | `DEFAULT 'Not Started'` | Kanban column status |
| `details` | `JSONB` | | BlockNote editor JSON |
| `budget` | `NUMERIC(12,2)` | `DEFAULT 0` | In PHP |
| `notes` | `TEXT` | | Free text |
| `sort_order` | `INTEGER` | `DEFAULT 0` | Kanban drag position |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

**Indexes:**

```sql
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_date ON projects(implementation_date);
CREATE INDEX idx_projects_code ON projects(project_code);
```

---

## Table: `transactions`

One row per financial transaction/ledger entry. Maps from the Ledger Google Sheet.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGINT` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `department_id` | `BIGINT` | `REFERENCES departments(id)` | Which department this belongs to |
| `project_id` | `BIGINT` | `REFERENCES projects(id) ON DELETE SET NULL` | Links to project (nullable if project deleted) |
| `date_recorded` | `DATE` | | When the entry was recorded |
| `entry_code` | `VARCHAR(100)` | | e.g. `6-CI1-[A89-37194]` |
| `type` | `VARCHAR(50)` | | `Income`, `Subsidy`, `Expenditure` |
| `date_issued` | `DATE` | | When the transaction was issued |
| `description` | `TEXT` | | Transaction description |
| `invoice_doc_no` | `VARCHAR(100)` | | Invoice or document number |
| `debit` | `NUMERIC(12,2)` | `DEFAULT 0` | Debit amount in PHP |
| `credit` | `NUMERIC(12,2)` | `DEFAULT 0` | Credit amount in PHP |
| `account` | `VARCHAR(100)` | | `SACEV`, `PTA`, `Other TBA`, etc. |
| `account_no` | `VARCHAR(100)` | | Account number |
| `filing_status` | `VARCHAR(50)` | | `Pending`, `Filed`, `Active` |
| `submission_status` | `VARCHAR(50)` | | `Pending`, `Submitted`, `Revised`, `Approved` |
| `document_link` | `TEXT` | | Google Drive link |
| `entry_by` | `VARCHAR(100)` | | Person who entered the record |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

**Indexes:**

```sql
CREATE INDEX idx_transactions_department ON transactions(department_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_date ON transactions(date_recorded);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_account ON transactions(account);
```

---

## Table: `templates`

BlockNote project templates. Migrated from `localStorage` in the original app.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `BIGINT` | `PK GENERATED ALWAYS AS IDENTITY` | |
| `name` | `VARCHAR(100)` | `NOT NULL` | Template name |
| `content` | `JSONB` | | BlockNote JSON blocks |
| `is_default` | `BOOLEAN` | `DEFAULT FALSE` | One row may be the default |
| `user_id` | `UUID` | `REFERENCES users(id) ON DELETE SET NULL` | Creator (nullable for system templates) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## Future Tables (Phase 2)

Created when department reference sheets are provided:

```sql
-- Finance: budget planning and appropriations
CREATE TABLE finance_budget_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id),
  department_id BIGINT REFERENCES departments(id),
  -- columns from Finance's reference sheet (TBD)
);

-- Events: event planning and tracking
CREATE TABLE events_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id),
  department_id BIGINT REFERENCES departments(id),
  -- columns from Events' reference sheet (TBD)
);
```

---

## Row-Level Security (RLS)

### Helper Functions

```sql
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR(20)
LANGUAGE SQL STABLE
AS $$ SELECT role FROM public.users WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.current_user_dept_id()
RETURNS BIGINT
LANGUAGE SQL STABLE
AS $$ SELECT department_id FROM public.users WHERE id = auth.uid() $$;
```

### Policies

```sql
-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- departments: everyone can read
CREATE POLICY dept_select_all ON departments
  FOR SELECT USING (true);

-- users: only own row
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());

-- projects: exec sees all, others see own dept or NULL dept (cross-dept)
CREATE POLICY projects_select ON projects
  FOR SELECT USING (
    current_user_role() = 'executive'
    OR department_id = current_user_dept_id()
    OR department_id IS NULL
  );

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (
    department_id = current_user_dept_id()
    OR current_user_role() = 'executive'
  );

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (
    department_id = current_user_dept_id()
    OR current_user_role() = 'executive'
  );

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (
    department_id = current_user_dept_id()
    OR current_user_role() = 'executive'
  );

-- transactions: same pattern
CREATE POLICY transactions_select ON transactions
  FOR SELECT USING (
    current_user_role() = 'executive'
    OR department_id = current_user_dept_id()
    OR department_id IS NULL
  );

CREATE POLICY transactions_insert ON transactions
  FOR INSERT WITH CHECK (
    department_id = current_user_dept_id()
    OR current_user_role() = 'executive'
  );

CREATE POLICY transactions_update ON transactions
  FOR UPDATE USING (
    department_id = current_user_dept_id()
    OR current_user_role() = 'executive'
  );

CREATE POLICY transactions_delete ON transactions
  FOR DELETE USING (
    department_id = current_user_dept_id()
    OR current_user_role() = 'executive'
  );

-- templates: everyone can read, only own insert/update
CREATE POLICY templates_select_all ON templates
  FOR SELECT USING (true);

CREATE POLICY templates_insert ON templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY templates_update ON templates
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
```

---

## Seed Data Migration

### Departments

```sql
INSERT INTO departments (code, name, has_custom_tabs) VALUES
  ('OP', 'Office of the President', true),
  ('OVP', 'Office of the Vice President', true),
  ('OES', 'Office of the Executive Secretary', true),
  ('Finance', 'Finance & Treasury', true),
  ('Events', 'Events Management', true),
  ('DRCA', 'Research & Constituent Affairs', true),
  ('General', 'Cross-Department / Shared', false);
```

### Projects (from project_reference.csv)

```sql
INSERT INTO projects (department_id, project_code, name, head, area_focus,
                      implementation_date, status, budget) VALUES
  (1, '06-001', 'Project Test 1', 'Clars', 'Organizational Development',
   '2026-06-29', 'Not Started', 1000.00),
  (1, '07-002', 'Project Test 2', 'Hans Mabulay', 'Student Services and Formation',
   '2026-06-30', 'In Progress', 2000.00),
  (1, '07-003', 'Project Test 3', 'Ben Ten', 'Community Involvement',
   '2026-07-01', 'Post-Docs', 5000.00);
```

### Transactions (from ledger_reference.csv)

```sql
INSERT INTO transactions (department_id, project_id, date_recorded, entry_code,
                          type, date_issued, description, invoice_doc_no,
                          debit, account, account_no, filing_status,
                          submission_status, entry_by) VALUES
  (1, 1, '2026-06-24', '6-CI1-[A89-37194]', 'Expenditure', '2026-06-24',
   'Mabulay Appliances - Air Conditioning', '6767-6677',
   50000.00, 'Other TBA', '84918241', 'FILED', 'SUBMITTED', 'Mabulay');
```

### Default Template

```sql
INSERT INTO templates (name, content, is_default) VALUES
  ('Default Project Plan', '[
    {"type":"heading","content":"Project Overview"},
    {"type":"paragraph","content":"Describe the project..."},
    {"type":"heading","content":"Objectives"},
    {"type":"bulletListItem","content":"Objective 1"},
    {"type":"bulletListItem","content":"Objective 2"},
    {"type":"heading","content":"Timeline"},
    {"type":"paragraph","content":"Key milestones..."}
  ]'::jsonb, true);
```

---

## Data Type Mapping: CSV → PostgreSQL

| CSV Type | PostgreSQL Type | Rationale |
|---|---|---|
| `₱1,000.00` (string currency) | `NUMERIC(12,2)` | Precise decimal, no float rounding errors |
| `6/29/2026` (string date) | `DATE` | Native date, queryable by month/year |
| `{ "type": "heading", ... }` (JSON string) | `JSONB` | Native JSON, queryable with `->>` operator |
| `row[0]`, `row[1]`, ... (string array) | Named columns | Eliminates column-index coupling |
| `index_: number` (artificial) | `id BIGINT PK` | Natural primary key via identity |

---

## Migration Notes

1. Run migration SQL in Supabase SQL Editor **in order**: tables → helpers → RLS → seed data
2. After migration, verify RLS by querying as different users in Supabase dashboard
3. The `users` table will be empty until the first Google OAuth login
4. Create a seed user manually for testing:
   ```sql
   INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com');
   INSERT INTO public.users (id, email, display_name, department_id, role)
   VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 1, 'executive');
   ```
5. To reset: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` then re-run migration
