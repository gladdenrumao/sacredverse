# 🌱 SacredVerse - One Simple Verse + One Good Deed, Daily

A React-based Progressive Web App (PWA) that helps build a habit of daily kindness through simple verses and actionable deeds.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## ✨ Features

- 📅 **Daily Verses & Deeds**: New content every day
- 🔥 **Streak Tracking**: Build consecutive day streaks
- 🏆 **Badge System**: Earn badges for 3, 7, and 30-day streaks
- 📱 **Progressive Web App**: Install on mobile/desktop
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 💾 **Offline Support**: Works without internet
- 🗄️ **Cloud Sync**: Optional Supabase integration for multi-device sync

## 🗄️ Supabase Integration (NEW!)

This project now includes **optional Supabase database integration** for cloud storage and multi-device sync!

### 📚 Documentation Guide

Choose your starting point:

#### **🌱 For Complete Beginners**
Start here to understand the integration:
1. **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Overview and learning path
2. **[SMALL_GOALS.md](SMALL_GOALS.md)** - Step-by-step checklist of tasks
3. **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Account and database setup

#### **🌿 For Developers**
Jump straight to implementation:
1. **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Setup Supabase account and database
2. **[supabase/DATABASE.md](supabase/DATABASE.md)** - Database schema and design
3. **[src/lib/README.md](src/lib/README.md)** - Function reference and examples

#### **🌳 For Advanced Users**
Dive into the code:
1. **[src/lib/supabaseClient.js](src/lib/supabaseClient.js)** - Client configuration
2. **[src/lib/supabaseDb.js](src/lib/supabaseDb.js)** - Database operations
3. **[supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)** - Database schema

### ⚡ Quick Supabase Setup (15 minutes)

1. **Create account** at [supabase.com](https://supabase.com)
2. **Create project** and get API credentials
3. **Create `.env` file**:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. **Run SQL migration** in Supabase SQL Editor (from `supabase/migrations/001_initial_schema.sql`)
5. **Restart dev server** and see ✅ in console!

**Full guide**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### 🎯 Current Status

- ✅ **Phase 1-3 Complete**: Foundation, schema, and database functions ready
- ⏭️ **Phase 4 Next**: React integration with UI components
- 🔮 **Future**: Authentication, real-time sync, social features

**Important**: The app works perfectly **without Supabase**! All features use localStorage by default. Supabase is an optional enhancement for cloud backup and multi-device sync.

## 🏗️ Project Structure

```
sacredverse/
├── src/
│   ├── components/          # Modular React components
│   ├── lib/                 # Supabase client and database functions (NEW!)
│   │   ├── supabaseClient.js
│   │   ├── supabaseDb.js
│   │   └── README.md
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Entry point
├── supabase/                # Database files (NEW!)
│   ├── migrations/          # SQL schema files
│   ├── DATABASE.md          # Database documentation
│   └── README.md            # Supabase overview
├── public/
│   ├── content.json         # Daily verses and deeds
│   └── icons/               # PWA icons
├── INTEGRATION_GUIDE.md     # Complete integration guide (NEW!)
├── SMALL_GOALS.md           # Step-by-step learning goals (NEW!)
├── SUPABASE_SETUP.md        # Setup instructions (NEW!)
└── package.json
```

## 🎨 Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: CSS with dark mode support
- **PWA**: VitePWA plugin with offline support
- **Database**: Supabase (PostgreSQL) - *optional*
- **Storage**: localStorage (primary) + Supabase (backup/sync)
- **Linting**: ESLint with React best practices

## 📖 Component Documentation

See [src/components/README.md](src/components/README.md) for detailed component documentation.

## 🤝 Contributing

This is a learning-oriented project! Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available for learning purposes.

## 🎓 Learning Resources

### For This Project:
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Comprehensive learning path
- [SMALL_GOALS.md](SMALL_GOALS.md) - Achievable tasks to build skills
- [Component docs](src/components/README.md) - UI component details

### External Resources:
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [PWA Basics](https://web.dev/progressive-web-apps/)

## 🙏 About SacredVerse

SacredVerse helps build a habit of daily kindness through:
- Simple, actionable verses
- One good deed per day
- Positive reinforcement through streaks and badges
- Community of kindness (coming soon!)

Small steps of kindness that grow into lasting change. 🌱

---

**Questions?** Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) or open an issue!

**Ready to set up Supabase?** Start with [SMALL_GOALS.md](SMALL_GOALS.md)!
