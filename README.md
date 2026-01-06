# NovaTok Social - Web Version

A social platform built with Next.js 14 (App Router), Tailwind CSS, and Supabase.

## Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. Run the development server:
```bash
yarn dev
```

## Supabase Setup

### 1. Create Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Get API Credentials

In your Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run Database Migrations

Open the **SQL Editor** in Supabase and run the following SQL:

```sql
-- =============================================
-- NOVATCK SOCIAL DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- THOUGHTS TABLE
-- Stores user thoughts/posts
-- =============================================

CREATE TABLE IF NOT EXISTS thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS thoughts_user_id_idx ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS thoughts_created_at_idx ON thoughts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own thoughts
CREATE POLICY "Users can view own thoughts" ON thoughts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own thoughts
CREATE POLICY "Users can insert own thoughts" ON thoughts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own thoughts
CREATE POLICY "Users can delete own thoughts" ON thoughts
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- PROFILES TABLE
-- Stores user profile information
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- OPTIONAL: Auto-create profile on signup
-- =============================================

-- This function creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'NovaTok User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Configure Authentication

In Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Configure email templates under **Authentication** → **Email Templates**

## Features

- **Think** - Share your thoughts with mood selection
- **Notifications** - Stay updated (coming soon)
- **Messages** - Chat with others (coming soon)
- **Profile** - Customize your profile with display name and bio
- **SoulMatch** - AI-powered matching (coming soon)
- **Discover** - Find creators to follow (coming soon)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Project Structure

```
app/
├── (app)/           # Protected app routes
│   ├── think/       # Think page
│   ├── notifications/
│   ├── messages/
│   ├── profile/     # Profile & Edit Profile
│   ├── discover/
│   └── soulmatch/
├── (auth)/          # Auth routes
│   └── login/       # Login page
└── page.js          # Landing page

lib/
├── supabase/
│   └── client.js    # Supabase client
├── think/
│   └── storage.js   # Think data layer
└── profile/
    └── storage.js   # Profile data layer

components/
└── ui/
    └── ToastProvider.jsx
```

## Development Mode

If Supabase is not configured, the app will:
1. Show a warning in the console
2. Fall back to localStorage for data persistence
3. Skip authentication checks

This allows local development without Supabase setup.
