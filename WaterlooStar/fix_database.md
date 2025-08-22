# 🔧 Database Migration Fix Guide

## Problem
The migration is failing because existing posts in your database don't have valid `author_id` values that reference existing users in the `users` table.

## Solution Options

### Option 1: Run Manual Migration Script (Recommended)
```bash
cd WaterlooStar/backend
go run cmd/migrate/main.go
```

This script will:
1. Create the users table
2. Create a "System" user for existing posts
3. Update all existing posts to use the System user
4. Complete the migration safely

### Option 2: Reset Database (If you don't mind losing existing data)
If you don't have important data and want a fresh start:

```sql
-- Connect to your PostgreSQL database and run:
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
```

Then run your main application normally:
```bash
cd WaterlooStar/backend
go run main.go
```

### Option 3: Manual Database Fix
If you want to fix it manually in PostgreSQL:

```sql
-- 1. Create users table first (if it doesn't exist)
-- This will be done by running: go run main.go (it will fail but create users table)

-- 2. Create a system user
INSERT INTO users (username, email, password_hash, is_email_verified, created_at, updated_at) 
VALUES ('System', 'system@studentforum.local', '$2a$10$dummy.hash.for.system.user', true, NOW(), NOW());

-- 3. Get the system user ID
-- SELECT id FROM users WHERE username = 'System';

-- 4. Update existing posts (replace 1 with the actual system user ID)
UPDATE posts SET author_id = 1 WHERE author_id = 0 OR author_id IS NULL;

-- 5. Update existing comments (replace 1 with the actual system user ID)  
UPDATE comments SET author_id = 1 WHERE author_id = 0 OR author_id IS NULL;
```

## What the Fix Does

The migration creates a "System" user account that will be used as the author for all existing posts that were created before the user system was implemented. This ensures:

- ✅ All posts have valid author references
- ✅ Foreign key constraints are satisfied
- ✅ Existing data is preserved
- ✅ New user system works properly

## After the Fix

Once the migration is complete, you can:
1. Run your main application normally
2. Register new user accounts
3. Create posts with proper user attribution
4. Use the like system with authenticated users

The "System" user will appear as the author of old posts, but new posts will show the actual usernames of registered users.

## Verification

After running the fix, you can verify it worked by:
```bash
cd WaterlooStar/backend
go run main.go
```

You should see:
```
Database migrated (tables 'users', 'posts', 'comments', and 'post_likes' ready)
Backend running on :8080
```
