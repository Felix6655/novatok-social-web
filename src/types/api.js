/**
 * API Type Definitions
 * 
 * JSDoc type definitions for API-related structures.
 * These provide IDE autocompletion without TypeScript.
 */

/**
 * @typedef {Object} ApiResponse
 * @property {*} data - Response data
 * @property {number} status - HTTP status code
 */

/**
 * @typedef {Object} ApiErrorShape
 * @property {string} message - Error message
 * @property {number} status - HTTP status code
 * @property {string} code - Error code from ErrorCodes
 * @property {*} [details] - Additional error details
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} items - List of items
 * @property {number} total - Total count
 * @property {number} page - Current page
 * @property {number} pageSize - Items per page
 * @property {boolean} hasMore - Whether more items exist
 */

/**
 * @typedef {Object} HoroscopeReading
 * @property {string} id - Unique reading ID
 * @property {Object} sign - Zodiac sign info
 * @property {string} date - Date of reading
 * @property {string} love - Love prediction
 * @property {string} career - Career prediction
 * @property {string} mood - Mood prediction
 * @property {string} luckyNumber - Lucky number
 * @property {string} luckyColor - Lucky color
 * @property {string} generatedAt - ISO timestamp
 */

/**
 * @typedef {Object} TarotCard
 * @property {string} name - Card name
 * @property {string} meaning - Upright meaning
 * @property {string} reversed - Reversed meaning
 * @property {boolean} isReversed - Whether card is reversed
 * @property {string} [position] - Position in spread (Past/Present/Future)
 * @property {string} interpretation - Current interpretation
 */

/**
 * @typedef {Object} TarotReading
 * @property {string} id - Unique reading ID
 * @property {string} question - User's question
 * @property {string} spread - Spread type (1-card, 3-card)
 * @property {TarotCard[]} cards - Drawn cards
 * @property {string} overallInterpretation - Overall guidance
 * @property {string} generatedAt - ISO timestamp
 */

export {}
