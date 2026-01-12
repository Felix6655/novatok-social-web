// Services - Barrel Export

export { 
  apiClient, 
  createApiClient, 
  ApiError, 
  ErrorCodes 
} from './api'

// Cross-platform storage
export { 
  default as storage,
  getItem,
  setItem,
  removeItem,
  isStorageAvailable,
  initNativeStorage,
} from './storage'

// Cross-platform sharing
export {
  default as share,
  shareText,
  shareFile,
  copyToClipboard,
  downloadFile,
  isShareAvailable,
  initNativeShare,
} from './share'

// Pending post store (for cross-feature communication)
export {
  default as pendingPost,
  setPendingPost,
  getPendingPost,
  clearPendingPost,
  consumePendingPost,
  hasPendingPost,
} from './pendingPost'

// AI Studio services
export {
  generateImage,
  downloadImage,
  shareImage,
  copyImageUrl,
  postToReels,
  checkAiStatus,
} from './aiStudio'
