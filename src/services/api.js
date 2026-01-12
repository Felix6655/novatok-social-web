/**
 * Central API Client for NovaTok Social
 * 
 * Features:
 * - Standardized error shape
 * - Configurable timeout
 * - Optional auth header injection
 * - Consistent response handling
 */

const DEFAULT_TIMEOUT = 10000 // 10 seconds

/**
 * Standardized API Error
 */
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/**
 * Error codes for standardized error handling
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
}

/**
 * Map HTTP status to error code
 */
function statusToErrorCode(status) {
  switch (status) {
    case 401:
      return ErrorCodes.UNAUTHORIZED
    case 403:
      return ErrorCodes.FORBIDDEN
    case 404:
      return ErrorCodes.NOT_FOUND
    case 422:
      return ErrorCodes.VALIDATION_ERROR
    default:
      if (status >= 500) return ErrorCodes.SERVER_ERROR
      return ErrorCodes.UNKNOWN
  }
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeout) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  return { controller, timeoutId }
}

/**
 * Central API client
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.baseUrl - Base URL for API calls (defaults to /api)
 * @param {number} options.timeout - Request timeout in ms (defaults to 10000)
 * @param {Function} options.getAuthToken - Optional function to get auth token
 */
export function createApiClient(options = {}) {
  const {
    baseUrl = '/api',
    timeout = DEFAULT_TIMEOUT,
    getAuthToken = null,
  } = options

  /**
   * Make an HTTP request
   */
  async function request(endpoint, config = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      customTimeout = timeout,
    } = config

    const url = `${baseUrl}${endpoint}`
    const { controller, timeoutId } = createTimeoutController(customTimeout)

    // Build headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Add auth token if available
    if (getAuthToken) {
      const token = await getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Parse response
      let data = null
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorCode = statusToErrorCode(response.status)
        const message = data?.message || data?.error || `Request failed with status ${response.status}`
        throw new ApiError(message, response.status, errorCode, data)
      }

      return { data, status: response.status }
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        throw new ApiError(
          'Request timed out',
          0,
          ErrorCodes.TIMEOUT
        )
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError(
          'Network error - please check your connection',
          0,
          ErrorCodes.NETWORK_ERROR
        )
      }

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error
      }

      // Unknown error
      throw new ApiError(
        error.message || 'An unexpected error occurred',
        0,
        ErrorCodes.UNKNOWN
      )
    }
  }

  return {
    get: (endpoint, config) => request(endpoint, { ...config, method: 'GET' }),
    post: (endpoint, body, config) => request(endpoint, { ...config, method: 'POST', body }),
    put: (endpoint, body, config) => request(endpoint, { ...config, method: 'PUT', body }),
    patch: (endpoint, body, config) => request(endpoint, { ...config, method: 'PATCH', body }),
    delete: (endpoint, config) => request(endpoint, { ...config, method: 'DELETE' }),
    request,
  }
}

/**
 * Default API client instance
 * Uses /api as base URL (Next.js API routes)
 */
export const apiClient = createApiClient()

export default apiClient
