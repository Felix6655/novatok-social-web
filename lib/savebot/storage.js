// Storage layer for SaveBot feature
// Deal finder and shopping assistant

const STORAGE_KEY = 'novatok_savebot_history_dev'
const MAX_HISTORY = 10

const CATEGORY_TIPS = {
  groceries: {
    stores: ['Costco', 'Aldi', 'Trader Joe\'s', 'Walmart', 'Target', 'Local farmers market'],
    tips: ['Buy in-season produce', 'Use digital coupons', 'Check unit prices', 'Buy store brands', 'Plan meals before shopping'],
    searches: ['weekly grocery deals', 'coupon apps', 'cashback grocery apps'],
  },
  electronics: {
    stores: ['Best Buy', 'Amazon', 'Micro Center', 'B&H Photo', 'Newegg', 'Costco'],
    tips: ['Wait for holiday sales', 'Check open-box deals', 'Compare prices across sites', 'Read reviews before buying', 'Consider refurbished'],
    searches: ['tech deal aggregators', 'price tracking tools', 'refurbished electronics'],
  },
  home: {
    stores: ['IKEA', 'Wayfair', 'Home Depot', 'Lowe\'s', 'Target', 'Amazon'],
    tips: ['Measure twice, buy once', 'Check clearance sections', 'Sign up for email discounts', 'Consider secondhand for furniture', 'DIY when possible'],
    searches: ['home decor deals', 'furniture outlet stores', 'DIY home projects'],
  },
  kids: {
    stores: ['Target', 'Walmart', 'Buy Buy Baby', 'Carter\'s', 'Once Upon a Child', 'Facebook Marketplace'],
    tips: ['Buy clothes one size up', 'Shop consignment', 'Time purchases with sales', 'Buy gender-neutral for reuse', 'Join parent groups for swaps'],
    searches: ['kids consignment near me', 'baby gear deals', 'children\'s clothing sales'],
  },
  pets: {
    stores: ['Chewy', 'Petco', 'PetSmart', 'Amazon', 'Costco', 'Tractor Supply'],
    tips: ['Buy food in bulk', 'Use auto-ship discounts', 'Check for vet clinic deals', 'DIY toys and treats', 'Compare prescription prices'],
    searches: ['pet food subscription deals', 'affordable vet care', 'pet supplies coupons'],
  },
  general: {
    stores: ['Amazon', 'Walmart', 'Target', 'Costco', 'eBay', 'Local stores'],
    tips: ['Compare prices online', 'Use browser extensions for deals', 'Check for student/military discounts', 'Wait for seasonal sales', 'Sign up for rewards programs'],
    searches: ['price comparison tools', 'cashback apps', 'deal alert websites'],
  },
}

const BUDGET_TIPS = [
  'Set a hard budget limit before you start shopping.',
  'Use the 24-hour rule for impulse purchases over $50.',
  'Track your spending in a simple app or spreadsheet.',
  'Consider the cost-per-use for expensive items.',
  'Look for bundle deals when buying multiple items.',
]

const BRAND_TIPS = [
  'Store brands are often the same quality as name brands.',
  'Check Consumer Reports for best-value recommendations.',
  'Read reviews but focus on recent, verified purchases.',
  'Premium brands aren\'t always worth the extra cost.',
  'Look for brands with good warranty policies.',
]

/**
 * Hash function for string
 */
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Detect category from query
 */
function detectCategory(query) {
  const q = query.toLowerCase()
  if (q.includes('food') || q.includes('grocery') || q.includes('produce') || q.includes('meat')) return 'groceries'
  if (q.includes('phone') || q.includes('laptop') || q.includes('tv') || q.includes('computer') || q.includes('tech') || q.includes('electronic')) return 'electronics'
  if (q.includes('furniture') || q.includes('decor') || q.includes('home') || q.includes('kitchen') || q.includes('bedroom')) return 'home'
  if (q.includes('kid') || q.includes('baby') || q.includes('child') || q.includes('toy')) return 'kids'
  if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('animal')) return 'pets'
  return 'general'
}

/**
 * Generate shopping advice based on query
 */
export function generateAdvice(query) {
  const category = detectCategory(query)
  const seed = hashString(query) + new Date().getDate()
  const tips = CATEGORY_TIPS[category]
  
  // Select stores (top 3-4)
  const numStores = 3 + (seed % 2)
  const stores = tips.stores.slice(0, numStores)
  
  // Select tips (2-3)
  const numTips = 2 + (seed % 2)
  const selectedTips = tips.tips.slice(0, numTips)
  
  // Add budget and brand tips
  const budgetTip = BUDGET_TIPS[seed % BUDGET_TIPS.length]
  const brandTip = BRAND_TIPS[(seed + 2) % BRAND_TIPS.length]
  
  // Generate search queries
  const searches = [
    `best ${query} deals ${new Date().getFullYear()}`,
    `${query} price comparison`,
    ...tips.searches.slice(0, 2)
  ]
  
  return {
    id: `savebot_${seed}`,
    query,
    category,
    stores,
    tips: selectedTips,
    budgetTip,
    brandTip,
    searchQueries: searches,
    checklist: [
      { item: 'Compare prices at 2-3 stores', checked: false },
      { item: 'Set your budget', checked: false },
      { item: 'Research brand options', checked: false },
      { item: 'List must-have features', checked: false },
      { item: 'Check for available coupons', checked: false },
    ],
    generatedAt: new Date().toISOString()
  }
}

/**
 * Save query to history
 */
export async function saveQuery(result) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getHistory()
    history.unshift(result)
    if (history.length > MAX_HISTORY) history.pop()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Failed to save savebot query:', e)
  }
}

/**
 * Get history
 */
export function getHistory() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const QUICK_CATEGORIES = ['Groceries', 'Electronics', 'Home', 'Kids', 'Pets']
