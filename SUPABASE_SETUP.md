# 🗄️ Supabase Database Integration Guide

Welcome to SacredVerse's Supabase integration! This guide will help you set up your database step by step.

## 📚 What is Supabase?

Supabase is like having your own powerful database in the cloud - but super easy to use! Think of it as:
- **A place to store data**: Instead of just saving to your browser (localStorage), your data is stored safely online
- **Works everywhere**: Access your progress from any device
- **Real-time updates**: Changes sync automatically across all your devices
- **Built-in authentication**: Secure user login and signup features

## 🎯 Why We're Using Supabase

Currently, SacredVerse saves your progress in your browser's localStorage. This works great, but has limitations:
- Data only exists on one device
- If you clear browser data, progress is lost
- No way to sync across devices
- Can't share progress with friends

Supabase solves all these problems!

---

## 🚀 Step 1: Create Your Supabase Account (5 minutes)

### 1.1 Sign Up
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (easiest) or email
4. Verify your email if needed

### 1.2 Create a New Project
1. Once logged in, click **"New Project"**
2. Choose an organization (or create one)
3. Fill in the details:
   - **Name**: "SacredVerse" (or whatever you like)
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose the closest region to you for best performance
   - **Plan**: Free tier (perfect for learning!)
4. Click **"Create new project"**
5. Wait 2-3 minutes while Supabase sets up your database ☕

---

## 🔑 Step 2: Get Your API Credentials (2 minutes)

Once your project is ready:

1. In the left sidebar, click **"Project Settings"** (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL**: Looks like \`https://xxxxx.supabase.co\`
   - **anon public key**: A long string starting with \`eyJ...\`

### 2.1 Add Credentials to Your Project
1. In your SacredVerse project folder, create a file named \`.env\`
2. Copy the contents from \`.env.example\` and fill in your credentials:

\`\`\`env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
\`\`\`

3. Save the file
4. **IMPORTANT**: Never commit this \`.env\` file to GitHub! It's already in \`.gitignore\`

---

## 🗃️ Step 3: Create Database Tables (5 minutes)

Now let's create the tables where we'll store user data!

### 3.1 Open SQL Editor
1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### 3.2 Run the Database Migration
1. Open the file \`supabase/migrations/001_initial_schema.sql\` in your project
2. Copy the entire SQL code
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

You should see: **"Success. No rows returned"** ✅

### What Did We Just Create?
- **user_progress**: Stores which deeds you complete each day
- **user_metadata**: Stores your streak, total points, and badges
- **Row Level Security (RLS)**: Ensures users can only see their own data

---

## ✅ Step 4: Test the Connection (2 minutes)

1. Restart your development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Open the browser console (F12)
3. Look for one of these messages:
   - ✅ \`"Supabase client initialized successfully"\` - You're all set!
   - ⚠️ \`"Supabase not configured"\` - Check your .env file

---

## 🎓 Understanding the Data Flow

### Before Supabase (Current):
\`\`\`
User completes deed → Saved to localStorage → Stays in browser
\`\`\`

### After Supabase (Next steps):
\`\`\`
User completes deed → Saved to localStorage (instant) → Synced to Supabase (background) → Available on all devices
\`\`\`

We'll keep localStorage as a backup so the app works offline!

---

## 🔮 Next Steps - What We'll Build Together

Now that Supabase is set up, here's what we'll add step by step:

### Phase 2: Basic Data Sync (Next up!)
- [ ] Save your progress to Supabase when you complete a deed
- [ ] Load your progress from Supabase when you open the app
- [ ] Keep localStorage working as before (backward compatible)

### Phase 3: User Authentication
- [ ] Simple email login
- [ ] Guest mode (use app without login)
- [ ] Migrate guest data when user signs up

### Phase 4: Multi-Device Sync
- [ ] Real-time sync across devices
- [ ] Conflict resolution if you use app offline

### Phase 5: Social Features
- [ ] Share your streak with friends
- [ ] Optional leaderboard
- [ ] Community challenges

---

## 🆘 Troubleshooting

### Issue: "Supabase not configured" message
**Solution**: 
- Check that your \`.env\` file exists in the project root
- Verify the environment variables start with \`VITE_\`
- Restart your dev server after creating \`.env\`

### Issue: SQL query fails
**Solution**:
- Make sure you're in the right project
- Check that you copied the entire SQL file
- Try running it again (it's safe to run multiple times)

### Issue: Can't find Project Settings
**Solution**:
- Look for the gear icon ⚙️ at the bottom of the left sidebar
- Make sure your project has finished initializing

---

## 📖 Learning Resources

Want to learn more about Supabase?
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Database Basics](https://supabase.com/docs/guides/database/overview)

---

## 💬 Questions?

This is a learning journey! If you get stuck:
1. Check the console for error messages (F12)
2. Review this guide step by step
3. The free tier is generous - you can experiment freely!

Ready to move to the next step? Let's start syncing data! 🚀
