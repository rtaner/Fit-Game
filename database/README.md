# Database Setup

## Supabase Setup

### Option 1: Supabase Cloud (Recommended)

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to Project Settings > API
4. Copy your project URL and anon key
5. Add them to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

6. Run the migrations:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `001_initial_schema.sql`
   - Click "Run"
   - Copy and paste the contents of `002_rls_policies.sql`
   - Click "Run"

### Option 2: Supabase Local (Alternative)

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Initialize Supabase:

```bash
supabase init
```

3. Start local Supabase:

```bash
supabase start
```

4. This will give you local URLs and keys. Add them to `.env.local`

5. Apply migrations:

```bash
supabase db push
```

## Migrations

Migrations are located in `database/migrations/`:

- `001_initial_schema.sql` - Creates all tables and indexes
- `002_rls_policies.sql` - Sets up Row Level Security policies

## Database Schema

### Tables

1. **users** - User accounts
2. **stores** - Store locations
3. **quiz_categories** - Quiz categories (Denim Fit, Prosedür, etc.)
4. **question_items** - Question items within categories
5. **game_sessions** - Game session records
6. **answer_analytics** - Detailed answer analytics
7. **user_badges** - User achievements
8. **error_reports** - User-reported errors

### Indexes

All foreign keys are indexed for performance. Additional indexes are created for:
- Frequently queried columns (username, store_code, etc.)
- Sorting columns (score, created_at, etc.)
- JSONB columns (tags)

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to view/edit their own data
- Allow admins to view/edit all data
- Prevent unauthorized access

## Seed Data

To populate the database with test data, see the seed scripts in the main project (Task 31).
