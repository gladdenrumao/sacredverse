# 📊 Database Schema Documentation

This document explains the database structure for SacredVerse and how it works.

## 🎯 Overview

SacredVerse uses two main tables to store user data:
1. **user_metadata**: Stores streak, points, and badges (one row per user)
2. **user_progress**: Stores daily deed completions (many rows per user)

## 📋 Table Structures

### 1. user_metadata Table

This table stores overall user statistics and achievements.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Unique identifier | `123e4567-e89b-12d3-a456-426614174000` |
| `user_id` | UUID | Reference to auth.users | `abc12345-...` |
| `last_completed_date` | DATE | Last day user completed any deed | `2025-10-13` |
| `streak` | INTEGER | Current consecutive days streak | `7` |
| `total_points` | INTEGER | Total points earned (10 per deed) | `150` |
| `badges` | INTEGER[] | Array of unlocked badge numbers | `[3, 7, 30]` |
| `created_at` | TIMESTAMP | When record was created | `2025-10-01 10:30:00` |
| `updated_at` | TIMESTAMP | When record was last updated | `2025-10-13 15:45:00` |

**Example Row:**
```sql
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "abc12345-6789-...",
  "last_completed_date": "2025-10-13",
  "streak": 7,
  "total_points": 150,
  "badges": [3, 7],
  "created_at": "2025-10-01T10:30:00Z",
  "updated_at": "2025-10-13T15:45:00Z"
}
```

### 2. user_progress Table

This table stores individual deed completions for each day.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Unique identifier | `456e7890-e89b-12d3-a456-426614174001` |
| `user_id` | UUID | Reference to auth.users | `abc12345-...` |
| `day_index` | INTEGER | Day number in 30-day cycle (0-29) | `5` |
| `deed_index` | INTEGER | Deed number within the day (usually 0) | `0` |
| `completed` | BOOLEAN | Whether deed was completed | `true` |
| `completed_at` | TIMESTAMP | When deed was completed | `2025-10-13 15:45:00` |
| `created_at` | TIMESTAMP | When record was created | `2025-10-13 15:45:00` |

**Example Row:**
```sql
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "user_id": "abc12345-6789-...",
  "day_index": 5,
  "deed_index": 0,
  "completed": true,
  "completed_at": "2025-10-13T15:45:00Z",
  "created_at": "2025-10-13T15:45:00Z"
}
```

## 🔐 Security: Row Level Security (RLS)

Row Level Security ensures users can only access their own data. Here's how it works:

### What is RLS?
Think of RLS like having separate locked drawers for each user. Even though all data is in the same table, users can only open their own drawer.

### Policies Applied:
1. **SELECT**: Users can only read their own rows (WHERE user_id = auth.uid())
2. **INSERT**: Users can only create rows with their own user_id
3. **UPDATE**: Users can only update their own rows
4. **DELETE**: Users can only delete their own rows

### Example:
```sql
-- This query automatically filters to only your data
SELECT * FROM user_metadata;

-- Behind the scenes, Supabase adds: WHERE user_id = 'your-user-id'
```

## 🔍 Common Queries

Here are some useful queries you might use:

### Get User's Current Metadata
```sql
SELECT * FROM user_metadata 
WHERE user_id = auth.uid();
```

### Get All User's Progress
```sql
SELECT * FROM user_progress 
WHERE user_id = auth.uid()
ORDER BY day_index;
```

### Get Progress for Specific Day
```sql
SELECT * FROM user_progress 
WHERE user_id = auth.uid() 
  AND day_index = 5;
```

### Count Completed Deeds
```sql
SELECT COUNT(*) as total_completed
FROM user_progress 
WHERE user_id = auth.uid() 
  AND completed = true;
```

## 📈 Data Relationships

```
auth.users (Supabase Auth)
    │
    ├── user_metadata (1:1)
    │   └── One metadata record per user
    │
    └── user_progress (1:many)
        └── Multiple progress records per user (one per deed)
```

## 🔄 Data Sync Strategy

### How Data Flows:

1. **User Action**: User clicks deed checkbox
2. **Immediate Update**: Update React state + localStorage (instant feedback)
3. **Background Sync**: Send update to Supabase (async)
4. **On Load**: Check Supabase first, fallback to localStorage if offline

### Hybrid Approach Benefits:
- ✅ **Fast**: Instant UI updates (localStorage)
- ✅ **Reliable**: Data backed up to cloud (Supabase)
- ✅ **Offline-ready**: Works without internet (localStorage fallback)
- ✅ **Multi-device**: Sync across devices (Supabase)

## 🎯 Data Format Conversion

### localStorage Format (Current):
```javascript
{
  "0": { "0": true },      // Day 0, Deed 0 completed
  "1": { "0": false },     // Day 1, Deed 0 not completed
  "5": { "0": true }       // Day 5, Deed 0 completed
}
```

### Supabase Format (New):
```javascript
[
  { day_index: 0, deed_index: 0, completed: true },
  { day_index: 1, deed_index: 0, completed: false },
  { day_index: 5, deed_index: 0, completed: true }
]
```

We'll create helper functions to convert between these formats!

## 🧪 Testing Your Database

After running the migration, you can test in Supabase SQL Editor:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_metadata', 'user_progress');
```

### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_metadata', 'user_progress');
```

### 3. Insert Test Data (will fail if RLS works correctly without auth!)
```sql
-- This should fail with "new row violates row-level security policy"
-- That's good! It means RLS is working
INSERT INTO user_metadata (user_id, streak, total_points) 
VALUES ('00000000-0000-0000-0000-000000000000', 5, 50);
```

## 🚀 Next Steps

Now that you understand the database structure:

1. ✅ Tables are created
2. ✅ Security is configured
3. ⏭️ Next: Create JavaScript functions to read/write data
4. ⏭️ Then: Integrate with React components

## 📚 Learn More

- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
