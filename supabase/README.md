# Supabase Database & Security Documentation

## 1. Overview
TaskFlow uses Supabase PostgreSQL for cloud persistence and user authentication.
- **Authentication**: Native Supabase Email & Password Auth.
- **Security**: Strict PostgreSQL **Row Level Security (RLS)** is enabled on all tables.
- **Principle of Least Privilege**: All queries execute exclusively in the context of the authenticated user (`auth.uid() = user_id`). No service role or admin secret keys are used or exposed.

---

## 2. Tables Schema

### `public.tasks`
| Column | Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique task identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Owner user ID |
| `title` | `VARCHAR(250)` | `NOT NULL` | Task title |
| `description` | `TEXT` | `DEFAULT '' NOT NULL` | Markdown / Plaintext details |
| `is_completed` | `BOOLEAN` | `DEFAULT FALSE NOT NULL` | Completion flag |
| `priority` | `VARCHAR(10)` | `DEFAULT 'P4' CHECK (priority IN ('P1','P2','P3','P4'))` | Priority badge |
| `category_id` | `VARCHAR(50)` | `DEFAULT 'work' NOT NULL` | Category key |
| `due_date` | `TIMESTAMPTZ` | `NULL` | Optional deadline timestamp |
| `subtasks` | `JSONB` | `DEFAULT '[]'::jsonb NOT NULL` | Checklist subtasks array |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT timezone('utc', now()) NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT timezone('utc', now()) NOT NULL` | Last update timestamp |

### `public.categories`
| Column | Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | `NOT NULL` | Category ID identifier |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | NULL for system defaults, UUID for custom |
| `name` | `VARCHAR(100)` | `NOT NULL` | Category display label |
| `color_hex` | `VARCHAR(20)` | `NOT NULL` | Accent color |
| `icon` | `VARCHAR(50)` | `NULL` | Icon name |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT timezone('utc', now()) NOT NULL` | Creation timestamp |

---

## 3. Row Level Security (RLS) Policies

All operations are restricted to the owner (`auth.uid() = user_id`):

1. **`tasks`**:
   - `SELECT`: `auth.uid() = user_id`
   - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
   - `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
   - `DELETE`: `USING (auth.uid() = user_id)`

2. **`categories`**:
   - `SELECT`: `user_id IS NULL OR auth.uid() = user_id`
   - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
   - `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
   - `DELETE`: `USING (auth.uid() = user_id)`

---

## 4. Applying Migrations
Migrations are managed in `supabase/migrations/`.
To apply migrations manually or in CI/CD:
```bash
# Using Supabase CLI:
supabase db push
```
Or execute SQL directly in Supabase Dashboard SQL Editor.
