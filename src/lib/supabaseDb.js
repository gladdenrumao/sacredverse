/**
 * Supabase Database Operations
 * 
 * This file contains helper functions to interact with Supabase database.
 * These functions handle reading and writing user progress and metadata.
 * 
 * HOW IT WORKS:
 * - Each function is async (returns a Promise)
 * - Functions return { data, error } - check which one has a value
 * - If error exists, operation failed - log it and handle gracefully
 * - If data exists, operation succeeded - use the data
 * 
 * LEARNING NOTES:
 * - async/await: Makes asynchronous code look synchronous
 * - Try/catch: Handles errors gracefully
 * - Null checks: Always verify Supabase is configured before using
 */

import supabase from './supabaseClient';

/**
 * Check if Supabase is configured and ready to use
 * @returns {boolean} True if Supabase client is available
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}

/**
 * Save user metadata (streak, points, badges) to Supabase
 * 
 * @param {Object} metadata - User metadata object
 * @param {string} metadata.lastCompletedDate - Last completion date (YYYY-MM-DD)
 * @param {number} metadata.streak - Current streak count
 * @param {number} metadata.totalPoints - Total points earned
 * @param {number[]} metadata.badges - Array of unlocked badge numbers
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 * 
 * Example:
 *   const { data, error } = await saveMetadata({
 *     lastCompletedDate: '2025-10-13',
 *     streak: 7,
 *     totalPoints: 150,
 *     badges: [3, 7]
 *   });
 */
export async function saveMetadata(metadata) {
  // If Supabase not configured, return early with no error
  // This allows the app to work without Supabase
  if (!supabase) {
    console.log('📝 Supabase not configured - metadata saved to localStorage only');
    return { data: null, error: null };
  }

  try {
    // Get the current user ID from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ No authenticated user - skipping Supabase sync');
      return { data: null, error: authError };
    }

    // Use upsert to either insert new row or update existing one
    // This is smart: creates if doesn't exist, updates if it does
    const { data, error } = await supabase
      .from('user_metadata')
      .upsert({
        user_id: user.id,
        last_completed_date: metadata.lastCompletedDate,
        streak: metadata.streak,
        total_points: metadata.totalPoints,
        badges: metadata.badges || [],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id', // Update based on user_id if row exists
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving metadata to Supabase:', error);
      return { data: null, error };
    }

    console.log('✅ Metadata saved to Supabase successfully');
    return { data, error: null };
  } catch (err) {
    console.error('❌ Unexpected error saving metadata:', err);
    return { data: null, error: err };
  }
}

/**
 * Load user metadata from Supabase
 * 
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 * 
 * Example:
 *   const { data, error } = await loadMetadata();
 *   if (data) {
 *     console.log('Streak:', data.streak);
 *   }
 */
export async function loadMetadata() {
  if (!supabase) {
    console.log('📝 Supabase not configured - using localStorage only');
    return { data: null, error: null };
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ No authenticated user - using localStorage');
      return { data: null, error: authError };
    }

    const { data, error } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error loading metadata from Supabase:', error);
      return { data: null, error };
    }

    if (!data) {
      console.log('ℹ️ No metadata found in Supabase - new user');
      return { data: null, error: null };
    }

    console.log('✅ Metadata loaded from Supabase');
    return { data, error: null };
  } catch (err) {
    console.error('❌ Unexpected error loading metadata:', err);
    return { data: null, error: err };
  }
}

/**
 * Save user progress (deed completions) to Supabase
 * Converts localStorage format to database format
 * 
 * @param {Object} progress - Progress object from localStorage
 *   Format: { "0": { "0": true }, "5": { "0": false } }
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 * 
 * Example:
 *   const progress = { 0: { 0: true }, 1: { 0: false } };
 *   const { data, error } = await saveProgress(progress);
 */
export async function saveProgress(progress) {
  if (!supabase) {
    console.log('📝 Supabase not configured - progress saved to localStorage only');
    return { data: null, error: null };
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ No authenticated user - skipping Supabase sync');
      return { data: null, error: authError };
    }

    // Convert localStorage format to array of records
    // From: { "0": { "0": true } }
    // To: [{ day_index: 0, deed_index: 0, completed: true }]
    const records = [];
    for (const [dayIdx, deeds] of Object.entries(progress || {})) {
      if (!deeds) continue;
      for (const [deedIdx, completed] of Object.entries(deeds)) {
        records.push({
          user_id: user.id,
          day_index: parseInt(dayIdx),
          deed_index: parseInt(deedIdx),
          completed: Boolean(completed),
          completed_at: completed ? new Date().toISOString() : null,
        });
      }
    }

    if (records.length === 0) {
      console.log('ℹ️ No progress to sync');
      return { data: null, error: null };
    }

    // Upsert all records at once
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(records, {
        onConflict: 'user_id,day_index,deed_index',
      })
      .select();

    if (error) {
      console.error('❌ Error saving progress to Supabase:', error);
      return { data: null, error };
    }

    console.log(`✅ Synced ${records.length} progress records to Supabase`);
    return { data, error: null };
  } catch (err) {
    console.error('❌ Unexpected error saving progress:', err);
    return { data: null, error: err };
  }
}

/**
 * Load user progress from Supabase
 * Converts database format back to localStorage format
 * 
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 *   Returns progress in localStorage format: { "0": { "0": true } }
 * 
 * Example:
 *   const { data, error } = await loadProgress();
 *   if (data) {
 *     // data format: { "0": { "0": true }, "5": { "0": false } }
 *   }
 */
export async function loadProgress() {
  if (!supabase) {
    console.log('📝 Supabase not configured - using localStorage only');
    return { data: null, error: null };
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('ℹ️ No authenticated user - using localStorage');
      return { data: null, error: authError };
    }

    const { data: records, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error loading progress from Supabase:', error);
      return { data: null, error };
    }

    if (!records || records.length === 0) {
      console.log('ℹ️ No progress found in Supabase - new user');
      return { data: {}, error: null };
    }

    // Convert database format back to localStorage format
    // From: [{ day_index: 0, deed_index: 0, completed: true }]
    // To: { "0": { "0": true } }
    const progress = {};
    for (const record of records) {
      const dayIdx = record.day_index.toString();
      const deedIdx = record.deed_index.toString();
      
      if (!progress[dayIdx]) {
        progress[dayIdx] = {};
      }
      
      progress[dayIdx][deedIdx] = record.completed;
    }

    console.log(`✅ Loaded ${records.length} progress records from Supabase`);
    return { data: progress, error: null };
  } catch (err) {
    console.error('❌ Unexpected error loading progress:', err);
    return { data: null, error: err };
  }
}

/**
 * Sync local data to Supabase (background sync)
 * This function should be called periodically or after user actions
 * 
 * @param {Object} progress - Current progress object
 * @param {Object} metadata - Current metadata object
 * @returns {Promise<{success: boolean, errors: Array}>}
 * 
 * Example:
 *   // After user completes a deed:
 *   await syncToSupabase(progress, metadata);
 */
export async function syncToSupabase(progress, metadata) {
  if (!supabase) {
    return { success: false, errors: ['Supabase not configured'] };
  }

  const errors = [];

  // Save metadata
  const { error: metaError } = await saveMetadata(metadata);
  if (metaError) errors.push(metaError);

  // Save progress
  const { error: progressError } = await saveProgress(progress);
  if (progressError) errors.push(progressError);

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Load all data from Supabase (on app startup)
 * Returns both progress and metadata
 * 
 * @returns {Promise<{progress: Object|null, metadata: Object|null, error: Error|null}>}
 * 
 * Example:
 *   const { progress, metadata, error } = await loadAllFromSupabase();
 *   if (progress) {
 *     setProgress(progress);
 *   }
 */
export async function loadAllFromSupabase() {
  if (!supabase) {
    return { progress: null, metadata: null, error: null };
  }

  const { data: progress, error: progressError } = await loadProgress();
  const { data: metadata, error: metadataError } = await loadMetadata();

  const error = progressError || metadataError;

  return {
    progress: progress || {},
    metadata: metadata || null,
    error,
  };
}
