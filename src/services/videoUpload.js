/**
 * Video Upload Service
 * 
 * Handles uploading video blobs to storage.
 */

const UPLOAD_API = '/api/upload/video'

/**
 * Check if upload service is configured
 * @returns {Promise<{ ok: boolean, configured: boolean }>}
 */
export async function checkUploadStatus() {
  try {
    const response = await fetch(UPLOAD_API)
    return response.json()
  } catch (error) {
    console.error('[videoUpload] Status check failed:', error)
    return { ok: false, configured: false }
  }
}

/**
 * Upload a video blob to storage
 * @param {Blob} blob - Video blob to upload
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{ ok: boolean, url?: string, error?: { code: string, message: string } }>}
 */
export async function uploadVideoBlob(blob, onProgress) {
  try {
    const formData = new FormData()
    formData.append('video', blob, 'recording.webm')

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      })

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch (e) {
          resolve({
            ok: false,
            error: { code: 'PARSE_ERROR', message: 'Failed to parse response' },
          })
        }
      })

      xhr.addEventListener('error', () => {
        resolve({
          ok: false,
          error: { code: 'NETWORK_ERROR', message: 'Network error during upload' },
        })
      })

      xhr.addEventListener('timeout', () => {
        resolve({
          ok: false,
          error: { code: 'TIMEOUT', message: 'Upload timed out' },
        })
      })

      xhr.open('POST', UPLOAD_API)
      xhr.timeout = 120000 // 2 minutes
      xhr.send(formData)
    })
  } catch (error) {
    console.error('[videoUpload] Upload failed:', error)
    return {
      ok: false,
      error: { code: 'UPLOAD_ERROR', message: error.message || 'Upload failed' },
    }
  }
}
