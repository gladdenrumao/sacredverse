# 🔧 Supabase Database Operations Guide

This guide explains the helper functions we created to interact with Supabase and how to use them.

## 📁 File: `src/lib/supabaseDb.js`

This file contains all the functions you need to save and load data from Supabase. Think of it as your "toolbox" for database operations!

---

## 🎯 Core Concepts

### Async/Await
These functions are **asynchronous** - they take time to complete because they talk to a database over the internet.

```javascript
// ❌ Wrong - doesn't wait for result
const result = loadProgress();
console.log(result); // Promise (not the actual data!)

// ✅ Correct - waits for result
const result = await loadProgress();
console.log(result); // { data: {...}, error: null }
```

### Error Handling
Every function returns an object with `data` and `error`:

```javascript
const { data, error } = await loadProgress();

if (error) {
  console.error('Something went wrong:', error);
  // Handle error - maybe use localStorage fallback
} else {
  console.log('Success!', data);
  // Use the data
}
```

### Graceful Degradation
If Supabase isn't configured, functions return early without errors. Your app still works!

```javascript
// No .env file? No problem!
const { data, error } = await saveProgress(progress);
// Returns { data: null, error: null } and logs a helpful message
// App continues using localStorage
```

---

## 🛠️ Available Functions

### 1. `isSupabaseConfigured()`

**What it does**: Checks if Supabase is set up and ready to use.

**When to use**: Before showing sync status or trying to connect.

**Example**:
```javascript
import { isSupabaseConfigured } from './lib/supabaseDb';

if (isSupabaseConfigured()) {
  console.log('✅ Syncing to cloud');
} else {
  console.log('📝 Using offline mode');
}
```

**Returns**: `boolean` - true if configured, false otherwise

---

### 2. `saveMetadata(metadata)`

**What it does**: Saves user streak, points, and badges to Supabase.

**When to use**: After user completes a deed and meta state updates.

**Parameters**:
```javascript
{
  lastCompletedDate: "2025-10-13",  // Date string (YYYY-MM-DD)
  streak: 7,                         // Number of consecutive days
  totalPoints: 150,                  // Total points earned
  badges: [3, 7]                     // Array of unlocked badge numbers
}
```

**Example**:
```javascript
import { saveMetadata } from './lib/supabaseDb';

// In your React component after state update:
const { data, error } = await saveMetadata({
  lastCompletedDate: '2025-10-13',
  streak: 7,
  totalPoints: 150,
  badges: [3, 7],
});

if (!error) {
  console.log('✅ Metadata synced to cloud');
}
```

**Returns**: `Promise<{data: Object|null, error: Error|null}>`

---

### 3. `loadMetadata()`

**What it does**: Loads user metadata from Supabase.

**When to use**: On app startup to get latest data from cloud.

**Example**:
```javascript
import { loadMetadata } from './lib/supabaseDb';

// On app load:
const { data, error } = await loadMetadata();

if (data) {
  // Use cloud data
  setMeta({
    lastCompletedDate: data.last_completed_date,
    streak: data.streak,
    totalPoints: data.total_points,
    badges: data.badges,
  });
} else {
  // Use localStorage fallback
  const localMeta = readMeta();
  setMeta(localMeta);
}
```

**Returns**: `Promise<{data: Object|null, error: Error|null}>`

**Data format** (if exists):
```javascript
{
  id: "uuid...",
  user_id: "uuid...",
  last_completed_date: "2025-10-13",
  streak: 7,
  total_points: 150,
  badges: [3, 7],
  created_at: "2025-10-01T10:30:00Z",
  updated_at: "2025-10-13T15:45:00Z"
}
```

---

### 4. `saveProgress(progress)`

**What it does**: Saves deed completion status to Supabase.

**When to use**: After user toggles a deed checkbox.

**Parameters**: Progress object in localStorage format
```javascript
{
  "0": { "0": true },   // Day 0, Deed 0 completed
  "1": { "0": false },  // Day 1, Deed 0 not completed
  "5": { "0": true }    // Day 5, Deed 0 completed
}
```

**Example**:
```javascript
import { saveProgress } from './lib/supabaseDb';

// After updating progress state:
const { data, error } = await saveProgress(progress);

if (!error) {
  console.log('✅ Progress synced to cloud');
}
```

**Returns**: `Promise<{data: Object|null, error: Error|null}>`

**What happens internally**:
The function converts your progress object to database records:
```javascript
// From:
{ "0": { "0": true }, "5": { "0": true } }

// To database records:
[
  { user_id: "...", day_index: 0, deed_index: 0, completed: true },
  { user_id: "...", day_index: 5, deed_index: 0, completed: true }
]
```

---

### 5. `loadProgress()`

**What it does**: Loads deed completion history from Supabase.

**When to use**: On app startup to sync latest progress.

**Example**:
```javascript
import { loadProgress } from './lib/supabaseDb';

// On app load:
const { data, error } = await loadProgress();

if (data) {
  // Merge with localStorage or replace
  setProgress(data);
} else {
  // Use localStorage fallback
  const localProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  setProgress(localProgress);
}
```

**Returns**: `Promise<{data: Object|null, error: Error|null}>`

**Data format**: Same as localStorage format
```javascript
{
  "0": { "0": true },
  "5": { "0": false },
  // ... more days
}
```

---

### 6. `syncToSupabase(progress, metadata)`

**What it does**: Syncs both progress and metadata in one call.

**When to use**: Periodically or after important user actions.

**Parameters**:
- `progress`: Progress object
- `metadata`: Metadata object

**Example**:
```javascript
import { syncToSupabase } from './lib/supabaseDb';

// After completing a deed:
const { success, errors } = await syncToSupabase(progress, meta);

if (success) {
  console.log('✅ All data synced');
} else {
  console.error('⚠️ Some sync errors:', errors);
  // App still works with localStorage
}
```

**Returns**: `Promise<{success: boolean, errors: Array}>`

---

### 7. `loadAllFromSupabase()`

**What it does**: Loads both progress and metadata in one call.

**When to use**: On app startup for initial data load.

**Example**:
```javascript
import { loadAllFromSupabase } from './lib/supabaseDb';

// In useEffect on app mount:
useEffect(() => {
  async function loadData() {
    const { progress, metadata, error } = await loadAllFromSupabase();
    
    if (progress) {
      setProgress(progress);
    } else {
      // Fallback to localStorage
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      setProgress(local);
    }
    
    if (metadata) {
      setMeta({
        lastCompletedDate: metadata.last_completed_date,
        streak: metadata.streak,
        totalPoints: metadata.total_points,
        badges: metadata.badges,
      });
    } else {
      // Fallback to localStorage
      setMeta(readMeta());
    }
  }
  
  loadData();
}, []);
```

**Returns**: `Promise<{progress: Object|null, metadata: Object|null, error: Error|null}>`

---

## 🎯 Integration Strategy

### Phase 1: Test Basic Connectivity
First, let's just verify Supabase works:

```javascript
import { isSupabaseConfigured, loadMetadata } from './lib/supabaseDb';

// In your component:
useEffect(() => {
  console.log('Supabase configured?', isSupabaseConfigured());
  
  if (isSupabaseConfigured()) {
    loadMetadata().then(({ data, error }) => {
      console.log('Test load:', data, error);
    });
  }
}, []);
```

### Phase 2: Add Background Sync
Sync data after user actions:

```javascript
import { syncToSupabase } from './lib/supabaseDb';

function toggleDeed(dayIdx, deedIdx) {
  // Update state (existing code)
  setProgress(/* ... */);
  setMeta(/* ... */);
  
  // NEW: Background sync to Supabase
  syncToSupabase(progress, meta).then(({ success }) => {
    if (success) {
      console.log('✅ Synced to cloud');
    }
  });
}
```

### Phase 3: Load on Startup
Prefer Supabase data over localStorage:

```javascript
import { loadAllFromSupabase } from './lib/supabaseDb';

useEffect(() => {
  async function initData() {
    // Try loading from Supabase first
    const { progress, metadata } = await loadAllFromSupabase();
    
    if (progress && Object.keys(progress).length > 0) {
      // Use Supabase data
      setProgress(progress);
      console.log('📥 Loaded from Supabase');
    } else {
      // Fallback to localStorage
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      setProgress(local);
      console.log('📝 Using localStorage');
    }
    
    // Same for metadata...
  }
  
  initData();
}, []);
```

---

## ⚠️ Important Notes

### Authentication Requirement
All functions require a logged-in user. Without authentication:
- Functions return early with `{ data: null, error: null }`
- App continues working with localStorage
- No errors are thrown

### Error Handling Philosophy
Functions are designed to **never break your app**:
- No Supabase config? Returns null, logs message
- No auth? Returns null, logs message  
- Network error? Returns error object, logs it
- Your app always has localStorage fallback

### Performance
- Functions are optimized for speed
- Use `upsert` to avoid duplicate records
- Database indexes speed up queries
- Batch operations when possible

### Security
- Row Level Security ensures users see only their data
- All queries automatically filter by `user_id`
- No need to check permissions in your code

---

## 🐛 Debugging

### Enable Verbose Logging
All functions log to console. Check browser console (F12) for:
- ✅ Success messages (green)
- ⚠️ Warning messages (yellow)
- ❌ Error messages (red)

### Common Issues

**Issue**: "Supabase not configured"
```
Solution: Create .env file with credentials, restart dev server
```

**Issue**: "No authenticated user"
```
Solution: This is normal if auth isn't implemented yet. 
          App works fine with localStorage.
```

**Issue**: "Error saving to Supabase"
```
Solution: Check console for specific error.
          Verify:
          1. Tables are created (run SQL migration)
          2. RLS policies exist
          3. User is authenticated
```

---

## 🎓 Learning Resources

### Understanding Promises
```javascript
// Promise basics
const promise = loadProgress();        // Returns immediately
const result = await loadProgress();   // Waits for completion

// Error handling
try {
  const { data, error } = await loadProgress();
  if (error) throw error;
  // Use data
} catch (err) {
  console.error(err);
}
```

### Understanding Async/Await
```javascript
// ❌ Wrong - not awaiting
function MyComponent() {
  const data = loadProgress();  // Returns Promise, not data!
}

// ✅ Correct - awaiting in async function
function MyComponent() {
  useEffect(() => {
    async function load() {
      const { data } = await loadProgress();
      // Use data
    }
    load();
  }, []);
}
```

---

## 🚀 Next Steps

Now that you have these functions:

1. **Test them**: Try calling in browser console
2. **Integrate gradually**: Start with one function at a time
3. **Monitor logs**: Watch console for success/error messages
4. **Keep localStorage**: Don't remove it, use as fallback

**Ready for Phase 4?** Let's add user authentication so these functions can actually save to Supabase!

---

*Questions? Check the console logs - they're designed to help you learn and debug!*
