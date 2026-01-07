// SoulMate Profile Generator
// Generates 5,000 realistic synthetic profiles

// First names (common US names, mixed gender)
const FIRST_NAMES = [
  // Female names
  'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
  'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria',
  'Riley', 'Aria', 'Lily', 'Aurora', 'Zoey', 'Nora', 'Camila', 'Hannah', 'Savannah', 'Addison',
  'Brooklyn', 'Leah', 'Zoe', 'Stella', 'Hazel', 'Ellie', 'Paisley', 'Audrey', 'Skylar', 'Violet',
  'Claire', 'Bella', 'Lucy', 'Anna', 'Samantha', 'Caroline', 'Genesis', 'Aaliyah', 'Kennedy', 'Kinsley',
  'Maya', 'Sarah', 'Madelyn', 'Adeline', 'Alexa', 'Ariana', 'Elena', 'Gabriella', 'Naomi', 'Alice',
  'Sadie', 'Hailey', 'Eva', 'Emilia', 'Autumn', 'Quinn', 'Nevaeh', 'Piper', 'Ruby', 'Serenity',
  'Willow', 'Everly', 'Cora', 'Kaylee', 'Lydia', 'Aubrey', 'Arianna', 'Eliana', 'Peyton', 'Melanie',
  'Gianna', 'Isabelle', 'Julia', 'Valentina', 'Nova', 'Clara', 'Vivian', 'Reagan', 'Mackenzie', 'Madeline',
  'Brielle', 'Delilah', 'Isla', 'Rylee', 'Katherine', 'Sophie', 'Josephine', 'Ivy', 'Liliana', 'Jade',
  // Male names
  'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
  'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo',
  'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew',
  'Luke', 'Asher', 'Carter', 'Julian', 'Grayson', 'Leo', 'Jayden', 'Gabriel', 'Isaac', 'Lincoln',
  'Anthony', 'Hudson', 'Dylan', 'Ezra', 'Thomas', 'Charles', 'Christopher', 'Jaxon', 'Maverick', 'Josiah',
  'Isaiah', 'Andrew', 'Elias', 'Joshua', 'Nathan', 'Caleb', 'Ryan', 'Adrian', 'Miles', 'Eli',
  'Nolan', 'Christian', 'Aaron', 'Cameron', 'Ezekiel', 'Colton', 'Luca', 'Landon', 'Hunter', 'Jonathan',
  'Santiago', 'Axel', 'Easton', 'Cooper', 'Jeremiah', 'Angel', 'Roman', 'Connor', 'Jameson', 'Robert',
  'Greyson', 'Jordan', 'Ian', 'Carson', 'Jaxson', 'Leonardo', 'Nicholas', 'Dominic', 'Austin', 'Everett',
  'Brooks', 'Xavier', 'Kai', 'Jose', 'Parker', 'Adam', 'Jace', 'Wesley', 'Kayden', 'Silas'
]

// Cities with states (major US cities)
const LOCATIONS = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Austin', state: 'TX' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Columbus', state: 'OH' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Boston', state: 'MA' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Portland', state: 'OR' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Oakland', state: 'CA' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'New Orleans', state: 'LA' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Pittsburgh', state: 'PA' },
  { city: 'Cincinnati', state: 'OH' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'Salt Lake City', state: 'UT' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Santa Monica', state: 'CA' },
  { city: 'Pasadena', state: 'CA' },
  { city: 'Boulder', state: 'CO' },
  { city: 'Hoboken', state: 'NJ' },
  { city: 'Cambridge', state: 'MA' }
]

// Tags (exact list from requirements)
const TAGS = [
  'Coffee', 'Tea', 'Brunch', 'Cooking', 'Baking', 'Foodie', 'Vegan-friendly', 'Night owl', 'Early bird',
  'Hiking', 'Camping', 'Road trips', 'Beach days', 'National parks', 'Sunrise walks',
  'Gym', 'Yoga', 'Running', 'Cycling', 'Boxing', 'Pilates',
  'Photography', 'Museums', 'Live music', 'Drawing', 'Painting', 'Theater',
  'Gaming', 'Board games', 'Anime', 'Sci-fi', 'Podcasts', 'Startups',
  'Dancing', 'Karaoke', 'Festivals', 'Volunteering', 'Book clubs',
  'Travel', 'Weekend getaways',
  'Dog person', 'Cat person', 'Pet lover',
  'Movies', 'Reading', 'Cozy nights', 'Deep talks'
]

// Bio templates (varied length and tone)
const BIO_TEMPLATES = [
  // Short & sweet
  'Just here to meet cool people.',
  'Let\'s grab coffee sometime.',
  'Adventure seeker. Story collector.',
  'Good vibes only ✨',
  'Swipe right if you love dogs.',
  'Looking for my adventure buddy.',
  'Coffee addict seeking enabler.',
  'Just moved here, show me around?',
  'Probably petting someone\'s dog right now.',
  'Ask me about my latest obsession.',
  // Medium length
  'I\'m the friend who always has snacks and a good playlist ready.',
  'Looking for someone to explore hidden gems in the city with.',
  'Big fan of spontaneous road trips and trying new restaurants.',
  'Fluent in sarcasm and movie quotes. Working on my emoji game.',
  'Yes, I will steal your fries. No, I won\'t apologize.',
  'Seeking someone who appreciates a good meme and deep conversations.',
  'I make a mean brunch. Looking for someone to share it with.',
  'Currently training for my next hiking adventure. Want to join?',
  'Love a good book recommendation. What are you reading?',
  'Weekend plans usually involve farmers markets and live music.',
  'I\'ll probably like your dog more than you. Fair warning.',
  'Looking for someone to binge-watch shows with. No judgment zone.',
  'Passionate about good food and even better company.',
  'Still trying to figure out this whole adulting thing.',
  'Here because my friend said I should put myself out there.',
  // Longer & detailed
  'By day I work in tech, by night I\'m learning to cook Italian food. Looking for someone to be my taste tester.',
  'Moved here for work and fell in love with the city. Now just looking to meet genuine people who enjoy the little things.',
  'I believe the best relationships start as friendships. Let\'s see where this goes. Coffee first?',
  'Competitive board game player looking for a worthy opponent. Also open to teaching beginners.',
  'Photography enthusiast who loves capturing golden hour moments. Would love someone to explore the city with.',
  'Trying to visit every national park before 40. Currently at 12. Looking for a travel buddy who shares this goal.',
  'I make really good playlists and even better conversation. Let\'s grab drinks and see if we vibe.',
  'Not great at bios, but I\'m better in person. Ask me about my latest adventure or favorite podcast.',
  'Yoga in the morning, tacos at night. Looking for someone who appreciates balance.',
  'I\'ve been told I give great recommendations for restaurants, books, and shows. Test me.',
  'Currently mastering the art of homemade pasta. Looking for someone to share my experiments with.',
  'Love concerts and discovering new artists. Always down for a spontaneous show.',
  'Aspiring plant parent with a growing collection. They\'re all still alive, which I consider a win.',
  'Firm believer that the best conversations happen over good food and drinks.',
  'Looking for someone who wants to explore the world, or at least try that new place downtown.',
  // Unique/quirky
  'My love language is sharing food and sending memes at 2am.',
  'I have strong opinions about coffee and pineapple on pizza.',
  'Looking for someone to do nothing with. Productively.',
  'I\'ll remember your birthday and your coffee order.',
  'Seeking someone who thinks grocery shopping together is romantic.',
  'Pros: Good listener. Cons: Will quote The Office at inappropriate times.',
  'Looking for someone who gets excited about trying new restaurants.',
  'I\'ve been called "aggressively friendly" and I\'m okay with it.',
  'Here to find someone who thinks staying in is just as fun as going out.',
  'I have a playlist for every mood and occasion. Yes, even that one.',
  'Currently accepting applications for hiking buddy, brunch companion, and Netflix co-pilot.',
  'I take my coffee seriously but not much else.',
  'The type to plan a trip around where we want to eat.',
  'Looking for someone to be weird with.',
  'I\'ll always share my dessert. That\'s how you know it\'s real.'
]

// Seeded random number generator for reproducibility
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function generateUUID(seed) {
  let result = ''
  const hex = '0123456789abcdef'
  const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  let s = seed
  
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '-') {
      result += '-'
    } else if (pattern[i] === '4') {
      result += '4'
    } else if (pattern[i] === 'y') {
      result += hex[Math.floor(seededRandom(s++) * 4) + 8]
    } else {
      result += hex[Math.floor(seededRandom(s++) * 16)]
    }
  }
  return result
}

// Generate weighted age (mostly 22-34)
function generateAge(seed) {
  const rand = seededRandom(seed)
  if (rand < 0.05) return 18 + Math.floor(seededRandom(seed + 1) * 4) // 18-21 (5%)
  if (rand < 0.85) return 22 + Math.floor(seededRandom(seed + 1) * 13) // 22-34 (80%)
  return 35 + Math.floor(seededRandom(seed + 1) * 6) // 35-40 (15%)
}

// Generate weighted distance (mostly 1-8 miles)
function generateDistance(seed) {
  const rand = seededRandom(seed)
  if (rand < 0.70) return 1 + Math.floor(seededRandom(seed + 1) * 8) // 1-8 miles (70%)
  if (rand < 0.90) return 9 + Math.floor(seededRandom(seed + 1) * 7) // 9-15 miles (20%)
  return 16 + Math.floor(seededRandom(seed + 1) * 10) // 16-25 miles (10%)
}

// Generate profile tags (2-6 tags)
function generateTags(seed) {
  const numTags = 2 + Math.floor(seededRandom(seed) * 5) // 2-6 tags
  const shuffled = [...TAGS].sort(() => seededRandom(seed++) - 0.5)
  return shuffled.slice(0, numTags)
}

// Generate online status (~12% online)
function generateOnlineStatus(seed) {
  const isOnline = seededRandom(seed) < 0.12
  const lastActiveMinutes = isOnline ? 0 : 5 + Math.floor(seededRandom(seed + 1) * 1436) // 5-1440 mins
  return { isOnline, lastActiveMinutes }
}

/**
 * Generate all profiles
 * @param {number} count - Number of profiles to generate (default 5000)
 * @returns {Array} Array of profile objects
 */
export function generateProfiles(count = 5000) {
  const profiles = []
  
  for (let i = 0; i < count; i++) {
    const seed = i * 1000 + 42 // Base seed for this profile
    
    const firstName = FIRST_NAMES[Math.floor(seededRandom(seed) * FIRST_NAMES.length)]
    const location = LOCATIONS[Math.floor(seededRandom(seed + 1) * LOCATIONS.length)]
    const age = generateAge(seed + 2)
    const distanceMiles = generateDistance(seed + 3)
    const bio = BIO_TEMPLATES[Math.floor(seededRandom(seed + 4) * BIO_TEMPLATES.length)]
    const tags = generateTags(seed + 5)
    const { isOnline, lastActiveMinutes } = generateOnlineStatus(seed + 6)
    
    profiles.push({
      id: generateUUID(seed + 7),
      firstName,
      age,
      city: location.city,
      state: location.state,
      distanceMiles,
      bio,
      tags,
      isOnline,
      lastActiveMinutes,
      photoUrl: null // Placeholder for now
    })
  }
  
  return profiles
}

/**
 * Get profiles with optional filtering
 * @param {Object} options - Filter options
 * @returns {Array} Filtered profiles
 */
export function getFilteredProfiles(profiles, options = {}) {
  const { minAge = 18, maxAge = 40, maxDistance = 25, onlineOnly = false } = options
  
  return profiles.filter(p => {
    if (p.age < minAge || p.age > maxAge) return false
    if (p.distanceMiles > maxDistance) return false
    if (onlineOnly && !p.isOnline) return false
    return true
  })
}

/**
 * Format last active time
 * @param {number} minutes - Minutes since last active
 * @returns {string} Formatted string
 */
export function formatLastActive(minutes) {
  if (minutes === 0) return 'Online now'
  if (minutes < 60) return `Active ${minutes}m ago`
  if (minutes < 1440) return `Active ${Math.floor(minutes / 60)}h ago`
  return `Active ${Math.floor(minutes / 1440)}d ago`
}
