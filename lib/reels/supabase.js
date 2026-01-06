// Supabase storage helpers for video reels
// Handles upload, signed URLs, and database operations

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

const BUCKET_NAME = 'reels'
const SIGNED_URL_EXPIRY = 3600 // 1 hour in seconds

/**
 * Check if Supabase reels storage is available
 * @returns {Promise<boolean>}
 */
export async function isReelsStorageAvailable() {
  if (!isSupabaseConfigured()) return false
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch {
    return false
  }
}

/**
 * Get current user ID
 * @returns {Promise<string|null>}
 */
export async function getCurrentUserId() {
  if (!isSupabaseConfigured()) return null
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch {
    return null
  }
}

/**
 * Generate storage path for a video
 * @param {string} userId - User ID
 * @param {string} fileName - File name
 * @returns {string} Storage path
 */
function generateStoragePath(userId, fileName) {
  const timestamp = Date.now()
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${userId}/${timestamp}_${safeName}`
}

/**
 * Upload a video file to Supabase Storage
 * @param {File|Blob} fileOrBlob - Video file or blob
 * @param {string} userId - User ID
 * @param {string} fileName - File name
 * @returns {Promise<{ storage_path: string, error?: string }>}
 */
export async function uploadReelVideo(fileOrBlob, userId, fileName) {
  if (!isSupabaseConfigured()) {
    return { storage_path: null, error: 'Supabase not configured' }
  }

  try {
    const storagePath = generateStoragePath(userId, fileName)
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { storage_path: null, error: error.message }
    }

    return { storage_path: data.path, error: null }
  } catch (err) {
    console.error('Upload exception:', err)
    return { storage_path: null, error: 'Upload failed' }
  }
}

/**
 * Get a signed URL for video playback
 * @param {string} storagePath - Storage path from upload
 * @returns {Promise<string|null>} Signed URL or null
 */
export async function getSignedReelUrl(storagePath) {
  if (!isSupabaseConfigured() || !storagePath) return null

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('Signed URL exception:', err)
    return null
  }
}

/**
 * Create a database row for the video reel
 * @param {Object} metadata - Video metadata
 * @returns {Promise<{ data: Object, error?: string }>}
 */
export async function createReelVideoRow(metadata) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('reels_videos')
      .insert({
        user_id: metadata.user_id,
        storage_path: metadata.storage_path,
        file_name: metadata.file_name,
        file_type: metadata.file_type,
        file_size: metadata.file_size,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        source: metadata.source || 'uploaded'
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Insert exception:', err)
    return { data: null, error: 'Failed to save video metadata' }
  }
}

/**
 * List all video reels for the current user
 * @returns {Promise<Array>} List of video reels with signed URLs
 */
export async function listUserReelVideos() {
  if (!isSupabaseConfigured()) return []

  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('reels_videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('List error:', error)
      return []
    }

    // Attach signed URLs for each video
    const videosWithUrls = await Promise.all(
      data.map(async (video) => {
        const signedUrl = await getSignedReelUrl(video.storage_path)
        return {
          ...video,
          signedUrl
        }
      })
    )

    return videosWithUrls
  } catch (err) {
    console.error('List exception:', err)
    return []
  }
}

/**
 * Delete a video reel (both storage and database)
 * @param {string} id - Database row ID
 * @param {string} storagePath - Storage path to delete
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteReelVideo(id, storagePath) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  try {
    // Delete from storage first
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue to delete DB row even if storage fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('reels_videos')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('DB delete error:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Delete exception:', err)
    return { success: false, error: 'Delete failed' }
  }
}

/**
 * Upload and save a complete video reel (upload + DB row)
 * @param {File|Blob} fileOrBlob - Video file or blob
 * @param {Object} metadata - Video metadata (duration, width, height, source)
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<{ data: Object, error?: string }>}
 */
export async function uploadAndSaveReelVideo(fileOrBlob, metadata, onProgress) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { data: null, error: 'Not authenticated' }
    }

    onProgress?.('uploading')

    // Upload to storage
    const fileName = metadata.fileName || `reel_${Date.now()}.webm`
    const { storage_path, error: uploadError } = await uploadReelVideo(
      fileOrBlob,
      userId,
      fileName
    )

    if (uploadError || !storage_path) {
      return { data: null, error: uploadError || 'Upload failed' }
    }

    onProgress?.('saving')

    // Create database row
    const { data, error: dbError } = await createReelVideoRow({
      user_id: userId,
      storage_path,
      file_name: fileName,
      file_type: fileOrBlob.type || metadata.fileType || 'video/webm',
      file_size: fileOrBlob.size,
      duration: metadata.duration || 0,
      width: metadata.width || 0,
      height: metadata.height || 0,
      source: metadata.source || 'uploaded'
    })

    if (dbError) {
      // Try to clean up the uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([storage_path])
      return { data: null, error: dbError }
    }

    // Get signed URL for immediate playback
    const signedUrl = await getSignedReelUrl(storage_path)

    onProgress?.('complete')

    return {
      data: {
        ...data,
        signedUrl
      },
      error: null
    }
  } catch (err) {
    console.error('Upload and save exception:', err)
    return { data: null, error: 'Failed to upload video' }
  }
}
