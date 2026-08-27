-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    priority VARCHAR(10) DEFAULT 'P4' NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    category_id VARCHAR(50) DEFAULT 'work' NOT NULL,
    due_date TIMESTAMPTZ NULL,
    subtasks JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast queries by user, status, priority, and date
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON public.tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON public.tasks(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(user_id, due_date);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id, user_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Owner-Only RLS Policies for Tasks
CREATE POLICY "Users can select own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Owner-Only RLS Policies for Categories
CREATE POLICY "Users can select own categories or default system categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
