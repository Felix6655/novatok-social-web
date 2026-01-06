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

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- THOUGHTS TABLE
-- Stores user thoughts/posts
-- =============================================

CREATE TABLE IF NOT EXISTS public.thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS thoughts_user_id_idx ON public.thoughts(user_id);
CREATE INDEX IF NOT EXISTS thoughts_created_at_idx ON public.thoughts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view their own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can insert their own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can update their own thoughts" ON public.thoughts;
DROP POLICY IF EXISTS "Users can delete their own thoughts" ON public.thoughts;

-- Policy: Users can SELECT their own thoughts only
CREATE POLICY "Users can view their own thoughts"
  ON public.thoughts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own thoughts only
CREATE POLICY "Users can insert their own thoughts"
  ON public.thoughts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own thoughts only
CREATE POLICY "Users can update their own thoughts"
  ON public.thoughts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own thoughts only
CREATE POLICY "Users can delete their own thoughts"
  ON public.thoughts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- PROFILES TABLE
-- Stores user profile information
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Policy: Users can SELECT their own profile only
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own profile only
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own profile only
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- OPTIONAL: Auto-create profile on user signup
-- This trigger creates a default profile when
-- a new user signs up via Supabase Auth
-- =============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'NovaTok User'),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- REMINDERS TABLE
-- Stores user reminders/appointments
-- =============================================

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_remind_at_idx ON public.reminders(remind_at);
CREATE INDEX IF NOT EXISTS reminders_dismissed_idx ON public.reminders(dismissed);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.reminders;

-- Policy: Users can SELECT their own reminders only
CREATE POLICY "Users can view their own reminders"
  ON public.reminders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own reminders only
CREATE POLICY "Users can insert their own reminders"
  ON public.reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own reminders only
CREATE POLICY "Users can update their own reminders"
  ON public.reminders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own reminders only
CREATE POLICY "Users can delete their own reminders"
  ON public.reminders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- DNA_PROFILES TABLE (OPTIONAL)
-- Stores optional DNA compatibility data
-- =============================================

CREATE TABLE IF NOT EXISTS public.dna_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT,
  kit_id TEXT,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS dna_profiles_user_id_idx ON public.dna_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.dna_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view their own DNA profile" ON public.dna_profiles;
DROP POLICY IF EXISTS "Users can insert their own DNA profile" ON public.dna_profiles;
DROP POLICY IF EXISTS "Users can update their own DNA profile" ON public.dna_profiles;
DROP POLICY IF EXISTS "Users can delete their own DNA profile" ON public.dna_profiles;

-- Policy: Users can SELECT their own DNA profile only
CREATE POLICY "Users can view their own DNA profile"
  ON public.dna_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own DNA profile only
CREATE POLICY "Users can insert their own DNA profile"
  ON public.dna_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own DNA profile only
CREATE POLICY "Users can update their own DNA profile"
  ON public.dna_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own DNA profile only
CREATE POLICY "Users can delete their own DNA profile"
  ON public.dna_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- VERIFICATION: Check tables were created
-- =============================================

-- Run these to verify (optional)
-- SELECT * FROM public.thoughts LIMIT 1;
-- SELECT * FROM public.profiles LIMIT 1;
-- SELECT * FROM public.reminders LIMIT 1;
-- SELECT * FROM public.dna_profiles LIMIT 1;

-- =============================================
-- REELS_VIDEOS TABLE
-- Stores user video reel metadata
-- =============================================

CREATE TABLE IF NOT EXISTS public.reels_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  duration NUMERIC,
  width INT,
  height INT,
  source TEXT CHECK (source IN ('uploaded', 'recorded')) DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS reels_videos_user_id_idx ON public.reels_videos(user_id);
CREATE INDEX IF NOT EXISTS reels_videos_created_at_idx ON public.reels_videos(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reels_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Users can view their own reels" ON public.reels_videos;
DROP POLICY IF EXISTS "Users can insert their own reels" ON public.reels_videos;
DROP POLICY IF EXISTS "Users can update their own reels" ON public.reels_videos;
DROP POLICY IF EXISTS "Users can delete their own reels" ON public.reels_videos;

-- Policy: Users can SELECT their own reels only
CREATE POLICY "Users can view their own reels"
  ON public.reels_videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own reels only
CREATE POLICY "Users can insert their own reels"
  ON public.reels_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own reels only
CREATE POLICY "Users can update their own reels"
  ON public.reels_videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own reels only
CREATE POLICY "Users can delete their own reels"
  ON public.reels_videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 4. Create Storage Bucket for Reels

In Supabase dashboard:
1. Go to **Storage** → **New bucket**
2. Create a bucket named `reels`
3. Set it as **Private** (not public)
4. Configure storage policies in **Storage** → **Policies**:

```sql
-- Storage policies for reels bucket
-- Run this in SQL Editor after creating the bucket

-- Allow authenticated users to upload their own reels
CREATE POLICY "Users can upload reels"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reels' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own reels
CREATE POLICY "Users can read own reels"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reels' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own reels
CREATE POLICY "Users can delete own reels"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reels' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 5. Configure Authentication

In Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Disable "Confirm email" for development in **Authentication** → **Settings**
4. (Optional) Configure email templates under **Authentication** → **Email Templates**

## Environment Modes

### Development Mode (`NODE_ENV=development`)
- If Supabase is not configured, the app uses localStorage fallback
- Auth bypass is available on the login page
- Console warnings indicate fallback mode

### Production Mode (`NODE_ENV=production`)
- Supabase MUST be configured
- No localStorage fallback for user data
- Full-page error if env vars are missing
- Authentication is strictly enforced

## Features

- **Think** - Share your thoughts with mood selection
- **Reels** - TikTok-style vertical video feed with upload and recording
- **Rooms** - Group video chat rooms (Zoom/Meet style)
- **Notifications** - Stay updated (coming soon)
- **Messages** - Chat with others (coming soon)
- **Profile** - Customize your profile with display name and bio
- **SoulMatch** - AI-powered matching (coming soon)
- **Discover** - Find creators to follow (coming soon)

---

## LiveKit Setup (for Rooms Feature)

The Rooms feature supports real-time group video calls powered by [LiveKit](https://livekit.io). 

### Demo Mode vs Live Mode

| Mode | Behavior |
|------|----------|
| **Demo Mode** | Default when LiveKit is not configured. Shows placeholder video tiles and demo chat. Perfect for UI testing. |
| **Live Mode** | Enabled when LiveKit credentials are set. Real video/audio streaming between participants. |

### 1. Get LiveKit Credentials (Free Tier Available)

1. Go to [LiveKit Cloud](https://cloud.livekit.io) and sign up
2. Create a new project
3. In your project dashboard, find:
   - **WebSocket URL** (looks like `wss://your-project.livekit.cloud`)
   - **API Key** (starts with `API...`)
   - **API Secret** (a long secret string)

### 2. Set Environment Variables

Add these to your `.env.local` file:

```env
# LiveKit Configuration (for Rooms feature)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret-key-here
```

**⚠️ Security Note:** 
- `LIVEKIT_API_SECRET` is **server-side only** and never exposed to the browser
- The token endpoint (`/api/livekit/token`) generates short-lived JWT tokens for clients
- Never commit `.env.local` to version control

### 3. Restart the Server

After adding credentials:
```bash
# Stop the dev server (Ctrl+C) and restart
yarn dev
```

### 4. Test with Two Browsers

1. Open `/rooms` and create a new room
2. Copy the invite link
3. Open the link in a **different browser** or **incognito window**
4. Both participants should see each other's video and can chat

**Expected behavior:**
- Name modal appears asking for display name
- Video/audio permissions requested
- "Live" badge appears in the room header (green)
- Video grid shows participant tiles
- Chat messages sync in real-time

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Still seeing "Demo mode" banner | Check that all 3 env vars are set and server is restarted |
| "Connection Failed" error | Verify `LIVEKIT_URL` is correct (starts with `wss://`) |
| No video showing | Check browser permissions for camera/mic |
| Can't see other participants | Ensure both are in the same room (same room ID in URL) |

### Architecture

```
┌─────────────────┐    POST /api/livekit/token    ┌─────────────────┐
│   Browser       │ ──────────────────────────────▶│   Next.js API   │
│   (Client)      │                                │   (Server)      │
│                 │◀────────────── token ──────────│                 │
└────────┬────────┘                                └────────┬────────┘
         │                                                  │
         │ WebSocket (wss://)                               │ Uses API Key/Secret
         │                                                  │
         ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         LiveKit Cloud                                │
│                    (WebRTC SFU Server)                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

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
│   ├── client.js    # Supabase client
│   └── health.js    # Health check utilities
├── think/
│   └── storage.js   # Think data layer
└── profile/
    └── storage.js   # Profile data layer

components/
└── ui/
    └── ToastProvider.jsx
```

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Users can only access their own data** via RLS policies
3. **No localStorage in production** - all user data goes to Supabase
4. **Auth is required** for all `/app/*` routes in production
5. **Environment variables** must be set for production deployment
