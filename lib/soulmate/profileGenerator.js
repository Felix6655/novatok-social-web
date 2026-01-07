// SoulMate Profile Generator v2
// Generates 5,000 highly realistic synthetic profiles
// All data is synthetic - no real people

// ============================================
// FIRST NAMES (300+) with last initials
// ============================================
const FIRST_NAMES = [
  // Female names (150+)
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
  'Maria', 'Taylor', 'Layla', 'Penelope', 'Luna', 'Natalie', 'Ashley', 'Brianna', 'Sydney', 'Morgan',
  'Jasmine', 'Lillian', 'Addison', 'Mila', 'Molly', 'Nicole', 'Lauren', 'Jessica', 'Kylie', 'Brooke',
  'Paige', 'Alyssa', 'Vanessa', 'Mariah', 'Rachel', 'Rebecca', 'Destiny', 'Sierra', 'Kaitlyn', 'Jenna',
  'Amber', 'Alexandra', 'Gabrielle', 'Danielle', 'Chelsea', 'Courtney', 'Brittany', 'Christina', 'Michelle', 'Amanda',
  'Stephanie', 'Jennifer', 'Melissa', 'Heather', 'Crystal', 'Veronica', 'Diana', 'Patricia', 'Sandra', 'Catherine',
  // Male names (150+)
  'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander',
  'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Levi', 'Sebastian', 'Mateo',
  'Jack', 'Owen', 'Theodore', 'Aiden', 'Samuel', 'Joseph', 'John', 'David', 'Wyatt', 'Matthew',
  'Luke', 'Asher', 'Carter', 'Julian', 'Grayson', 'Leo', 'Jayden', 'Gabriel', 'Isaac', 'Lincoln',
  'Anthony', 'Hudson', 'Dylan', 'Ezra', 'Thomas', 'Charles', 'Christopher', 'Jaxon', 'Maverick', 'Josiah',
  'Isaiah', 'Andrew', 'Elias', 'Joshua', 'Nathan', 'Caleb', 'Ryan', 'Adrian', 'Miles', 'Eli',
  'Nolan', 'Christian', 'Aaron', 'Cameron', 'Ezekiel', 'Colton', 'Luca', 'Landon', 'Hunter', 'Jonathan',
  'Santiago', 'Axel', 'Easton', 'Cooper', 'Jeremiah', 'Angel', 'Roman', 'Connor', 'Jameson', 'Robert',
  'Greyson', 'Jordan', 'Ian', 'Carson', 'Jaxson', 'Leonardo', 'Nicholas', 'Dominic', 'Austin', 'Everett',
  'Brooks', 'Xavier', 'Kai', 'Jose', 'Parker', 'Adam', 'Jace', 'Wesley', 'Kayden', 'Silas',
  'Bennett', 'Declan', 'Waylon', 'Weston', 'Evan', 'Emmett', 'Micah', 'Ryder', 'Beau', 'Damian',
  'Harrison', 'Sawyer', 'Vincent', 'Nathaniel', 'Jason', 'Brandon', 'Tyler', 'Zachary', 'Kevin', 'Justin',
  'Marcus', 'Derek', 'Sean', 'Kyle', 'Bryan', 'Eric', 'Brian', 'Kenneth', 'Steven', 'Gregory',
  'Patrick', 'Timothy', 'Raymond', 'Jeffrey', 'Scott', 'Dennis', 'Frank', 'Larry', 'Gerald', 'Russell',
  'Trevor', 'Blake', 'Chase', 'Cole', 'Preston', 'Shane', 'Tristan', 'Gavin', 'Spencer', 'Maxwell'
]

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// ============================================
// LOCATIONS (40 US cities)
// ============================================
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

// ============================================
// TAGS (120+)
// ============================================
const TAGS = [
  // Food & Drink
  'Coffee', 'Tea', 'Brunch', 'Cooking', 'Baking', 'Foodie', 'Vegan-friendly', 'Wine tasting', 'Craft beer', 'Cocktails',
  'Sushi lover', 'Pizza enthusiast', 'BBQ', 'Farm to table', 'Food trucks', 'Farmers markets',
  // Lifestyle
  'Night owl', 'Early bird', 'Morning person', 'Minimalist', 'Homebody', 'Social butterfly', 'Introvert', 'Extrovert',
  'Work from home', 'City life', 'Suburban vibes', 'Beach life', 'Mountain lover',
  // Outdoor & Adventure
  'Hiking', 'Camping', 'Road trips', 'Beach days', 'National parks', 'Sunrise walks', 'Sunset chaser',
  'Kayaking', 'Skiing', 'Snowboarding', 'Surfing', 'Rock climbing', 'Backpacking', 'Fishing',
  // Fitness & Wellness
  'Gym', 'Yoga', 'Running', 'Cycling', 'Boxing', 'Pilates', 'CrossFit', 'Swimming', 'Tennis', 'Basketball',
  'Soccer', 'Golf', 'Meditation', 'Wellness', 'Spin class', 'Weightlifting', 'Marathon runner',
  // Arts & Culture
  'Photography', 'Museums', 'Live music', 'Drawing', 'Painting', 'Theater', 'Ballet', 'Opera',
  'Art galleries', 'Street art', 'Poetry', 'Creative writing', 'Film photography', 'Digital art',
  // Entertainment
  'Gaming', 'Board games', 'Anime', 'Sci-fi', 'Podcasts', 'True crime', 'Comedy shows', 'Stand-up',
  'Concerts', 'Festivals', 'Jazz', 'Hip-hop', 'Indie music', 'Classical music', 'EDM', 'Country music',
  // Social & Activities
  'Dancing', 'Karaoke', 'Volunteering', 'Book clubs', 'Wine clubs', 'Trivia nights', 'Escape rooms',
  'Brunch squad', 'Happy hour', 'Dinner parties', 'Game nights', 'Pub crawls',
  // Travel & Exploration
  'Travel', 'Weekend getaways', 'International travel', 'Solo travel', 'Backpacker', 'Luxury travel',
  'Adventure travel', 'Cultural travel', 'Staycations', 'Road tripper',
  // Pets & Animals
  'Dog person', 'Cat person', 'Pet lover', 'Dog parent', 'Cat parent', 'Animal rescue', 'Horse lover',
  // Intellectual & Career
  'Startups', 'Entrepreneurship', 'Tech', 'Finance', 'Healthcare', 'Education', 'Law', 'Real estate',
  'Marketing', 'Design', 'Engineering', 'Science', 'Research', 'Nonprofit',
  // Relaxation
  'Movies', 'Reading', 'Cozy nights', 'Deep talks', 'Netflix', 'Streaming', 'Journaling', 'Gardening',
  'DIY projects', 'Home improvement', 'Interior design', 'Thrift shopping', 'Vintage finds', 'Plant parent'
]

// ============================================
// JOB TITLES (100+)
// ============================================
const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager',
  'Graphic Designer', 'Content Creator', 'Sales Executive', 'Account Manager', 'Project Manager',
  'Business Analyst', 'Financial Analyst', 'Investment Banker', 'Management Consultant', 'Strategy Consultant',
  'Doctor', 'Nurse', 'Physical Therapist', 'Dentist', 'Pharmacist',
  'Lawyer', 'Paralegal', 'Legal Counsel', 'Attorney', 'Judge',
  'Teacher', 'Professor', 'School Counselor', 'Principal', 'Education Coordinator',
  'Architect', 'Interior Designer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
  'Chef', 'Restaurant Manager', 'Sommelier', 'Pastry Chef', 'Food Blogger',
  'Photographer', 'Videographer', 'Film Editor', 'Art Director', 'Creative Director',
  'Real Estate Agent', 'Property Manager', 'Mortgage Broker', 'Real Estate Developer', 'Appraiser',
  'Entrepreneur', 'Startup Founder', 'Small Business Owner', 'Freelancer', 'Consultant',
  'HR Manager', 'Recruiter', 'Talent Acquisition', 'People Operations', 'Office Manager',
  'Social Media Manager', 'Digital Marketer', 'SEO Specialist', 'Brand Manager', 'PR Specialist',
  'Fitness Trainer', 'Yoga Instructor', 'Personal Coach', 'Life Coach', 'Nutritionist',
  'Journalist', 'Editor', 'Writer', 'Copywriter', 'Technical Writer',
  'Musician', 'DJ', 'Music Producer', 'Sound Engineer', 'Voice Actor',
  'Actor', 'Model', 'Influencer', 'Streamer', 'Podcaster',
  'Pilot', 'Flight Attendant', 'Travel Agent', 'Tour Guide', 'Event Planner',
  'Research Scientist', 'Lab Technician', 'Biotech Researcher', 'Clinical Research', 'Epidemiologist',
  'Police Officer', 'Firefighter', 'Paramedic', 'Military', 'Security Analyst'
]

// ============================================
// EDUCATION (50+)
// ============================================
const EDUCATION = [
  'Harvard University', 'Stanford University', 'MIT', 'Yale University', 'Princeton University',
  'Columbia University', 'University of Chicago', 'Duke University', 'Northwestern University', 'CalTech',
  'UCLA', 'UC Berkeley', 'USC', 'NYU', 'Boston University',
  'University of Michigan', 'University of Texas', 'University of Florida', 'Penn State', 'Ohio State',
  'Arizona State', 'University of Washington', 'University of Colorado', 'Georgia Tech', 'University of Virginia',
  'Vanderbilt University', 'Notre Dame', 'Georgetown University', 'Emory University', 'Rice University',
  'Carnegie Mellon', 'Johns Hopkins', 'Brown University', 'Dartmouth College', 'Cornell University',
  'University of Wisconsin', 'University of Minnesota', 'Indiana University', 'University of Illinois', 'Purdue University',
  'University of North Carolina', 'University of Georgia', 'University of Tennessee', 'University of Kentucky', 'University of Alabama',
  'Community College', 'Trade School', 'Art Institute', 'Culinary School', 'Self-taught'
]

// ============================================
// LOOKING FOR OPTIONS
// ============================================
const LOOKING_FOR = ['Dating', 'Relationship', 'Friends', 'Networking', 'Something casual', 'Not sure yet']

// ============================================
// HEIGHT RANGES (in inches, 5'0" to 6'5")
// ============================================
const HEIGHTS = [
  "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"",
  "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\""
]

// ============================================
// BIO TEMPLATES (250+)
// ============================================
const BIO_TEMPLATES = [
  // === SHORT & WITTY (50) ===
  'Just here to meet cool people.',
  "Let's grab coffee sometime.",
  'Adventure seeker. Story collector.',
  'Good vibes only ✨',
  'Swipe right if you love dogs.',
  'Looking for my adventure buddy.',
  'Coffee addict seeking enabler.',
  'Just moved here, show me around?',
  "Probably petting someone's dog right now.",
  'Ask me about my latest obsession.',
  'Here for the memes.',
  'Will trade travel stories for drinks.',
  'My plants are still alive, so I think I can handle this.',
  'Fluent in sarcasm.',
  'Professional overthinker.',
  'Recovering perfectionist.',
  'Chaos coordinator.',
  "Serial hobbyist. Currently it's [hobby].",
  'Emotionally available. Shocking, I know.',
  'Looking for someone to be weird with.',
  "I'll share my fries. That's love.",
  'Yes, I actually read books.',
  'Certified couch potato on Sundays.',
  'Making bad decisions since [birth year].',
  "My dog is my wingman. He's more photogenic.",
  'Here because my therapist said to try new things.',
  'Looking for my partner in crime.',
  'Will like your Instagram back.',
  'Probably rehearsing conversations in my head.',
  "I peak at 2am conversations. Don't @ me.",
  'Collecting passport stamps and good memories.',
  'Still figuring it out. Join me?',
  'Expert napper. Olympic-level snacker.',
  "I promise I'm funnier in person.",
  "My love language is acts of snacks.",
  "If you can't handle me at my worst, fair.",
  'Looking for someone who gets my references.',
  'I make excellent playlists.',
  'Your mom will love me.',
  'Probably overthinking this bio right now.',
  'Not here for a long time, here for a good time.',
  "I'll remember your birthday.",
  'Looking for my person.',
  "Let's get lost together.",
  'Swipe right for dad jokes.',
  'Warning: may spontaneously break into song.',
  'Currently accepting applications for life co-pilot.',
  'Looking for someone to share appetizers with.',
  'I make a mean breakfast.',
  'Here to find my plus-one.',
  
  // === MEDIUM LENGTH (100) ===
  "I'm the friend who always has snacks and a good playlist ready.",
  'Looking for someone to explore hidden gems in the city with.',
  'Big fan of spontaneous road trips and trying new restaurants.',
  'Fluent in sarcasm and movie quotes. Working on my emoji game.',
  "Yes, I will steal your fries. No, I won't apologize.",
  'Seeking someone who appreciates a good meme and deep conversations.',
  'I make a mean brunch. Looking for someone to share it with.',
  'Currently training for my next hiking adventure. Want to join?',
  "Love a good book recommendation. What are you reading?",
  'Weekend plans usually involve farmers markets and live music.',
  "I'll probably like your dog more than you. Fair warning.",
  "Looking for someone to binge-watch shows with. No judgment zone.",
  'Passionate about good food and even better company.',
  'Still trying to figure out this whole adulting thing.',
  'Here because my friend said I should put myself out there.',
  "I believe breakfast for dinner is a valid life choice.",
  'Looking for someone who thinks grocery shopping together is a date.',
  "My friends describe me as 'chaotic good' and I think that's accurate.",
  "I've been told I give great restaurant recommendations. Test me.",
  'Currently mastering the art of sourdough. Looking for a taste tester.',
  'I have a playlist for every mood. Yes, even that one.',
  "Looking for someone to do absolutely nothing with. Productively.",
  "My ideal weekend involves coffee, a good book, and zero plans.",
  "I'll always be down for tacos. That's my only non-negotiable.",
  'Looking for someone to watch the sunset with. Then grab dinner.',
  "I take my coffee seriously but nothing else.",
  'The type to plan a trip around where we want to eat.',
  "I'll always share my dessert. That's how you know it's real.",
  'Currently accepting applications for hiking buddy and Netflix co-pilot.',
  "I'm the friend who remembers everyone's orders at restaurants.",
  'Looking for someone who thinks a bookstore is a valid first date.',
  "My love language is remembering small details about you.",
  'I have strong opinions about coffee and I stand by them.',
  "Here to find someone who laughs at my jokes. Bar is low.",
  'Looking for someone to be my designated adventure partner.',
  "I make really good pancakes. That's basically my whole personality.",
  'Weekend warrior seeking accomplice for brunch adventures.',
  "I've been told I'm good at pep talks and making grilled cheese.",
  "Looking for someone who doesn't mind my true crime obsession.",
  'My friends say I give good advice. Need some? Swipe right.',
  "I'm the person who always suggests we try the new place.",
  "Currently collecting hobbies like they're Pokemon cards.",
  "Looking for someone to debate whether a hot dog is a sandwich.",
  'I promise to always share the good parking spots I find.',
  "My ideal night involves wine, cheese, and absolutely no pants.",
  'Looking for someone to split appetizers with. The whole menu.',
  "I've perfected the art of the lazy Sunday. Join me.",
  "Here because my horoscope said to take a chance. So... hi.",
  "I'll always let you have the last bite.",
  "Looking for someone who thinks being early is a personality trait.",
  "I make playlists for road trips we haven't taken yet.",
  'My plant collection is out of control and I regret nothing.',
  "Looking for someone who understands that brunch is a lifestyle.",
  "I have opinions about fonts. Is that a red flag?",
  'Currently on a quest to find the best tacos in the city.',
  "Looking for someone to people-watch with at coffee shops.",
  'I will absolutely judge you by your Spotify wrapped.',
  "Here because I'm better at texting than meeting people in person.",
  "Looking for someone to explore the weird museums with me.",
  "I'm the friend who always knows when happy hour ends.",
  'Currently trying to learn guitar. Emphasis on trying.',
  "Looking for someone who won't judge my Spotify playlists.",
  'I have a running list of restaurants to try. Help me check them off.',
  "My guilty pleasure is reality TV and I won't apologize.",
  'Looking for someone who appreciates a well-timed GIF.',
  "I'll always remember what you ordered last time.",
  "Here to find someone who thinks parallel parking is an accomplishment.",
  "Looking for someone to share my popcorn with. Actually, get your own.",
  'I make really good mixtapes. Yes, I still call them that.',
  "Looking for someone to make bad decisions with. Responsibly.",
  "I'm the person who always has recommendations ready.",
  "Looking for someone who thinks napping is a valid hobby.",
  "I have strong feelings about Oxford commas.",
  "Here because meeting people in the wild is hard.",
  "Looking for someone who gets excited about new restaurants.",
  "I'll always defend my controversial food opinions.",
  "Looking for someone to be my emergency contact.",
  "I have approximately 47 unfinished craft projects.",
  "Looking for someone who thinks silence can be comfortable.",
  "I'll always let you pick the movie.",
  "Here to find my person. Or at least someone to get tacos with.",
  "Looking for someone who appreciates a good cheese board.",
  "I'll remember the name of your childhood pet.",
  "Here because I'm tired of third-wheeling my married friends.",
  "Looking for someone to share my umbrella with.",
  "I have a deep appreciation for a well-made cocktail.",
  "Looking for someone who thinks thrift stores count as dates.",
  "I'll always save you a seat.",
  "Here to find someone who values quality time over grand gestures.",
  "Looking for someone to explore with. Maps optional.",
  "I'll always have extra phone chargers.",
  "Looking for someone who appreciates the little things.",
  "Here because I believe good things come to those who swipe.",
  "Looking for someone to debate pineapple on pizza with.",
  "I'll always have your back at IKEA.",
  "Here to find someone who thinks the journey matters more than the destination.",
  "Looking for someone to share inside jokes with.",
  "I'll always split the last piece with you.",
  "Here because life's too short for boring conversations.",
  "Looking for someone who makes ordinary moments feel special.",
  
  // === LONGER & DETAILED (50) ===
  "By day I work in tech, by night I'm learning to cook Italian food. Looking for someone to be my taste tester and maybe teach me about wine.",
  "Moved here for work and fell in love with the city. Now just looking to meet genuine people who enjoy the little things in life.",
  "I believe the best relationships start as friendships. Let's see where this goes. Coffee first?",
  "Competitive board game player looking for a worthy opponent. Also open to teaching beginners. Fair warning: I take Scrabble very seriously.",
  "Photography enthusiast who loves capturing golden hour moments. Would love someone to explore the city with and find the best spots.",
  "Trying to visit every national park before 40. Currently at 12. Looking for a travel buddy who shares this goal.",
  "I make really good playlists and even better conversation. Let's grab drinks and see if we vibe.",
  "Not great at bios, but I'm better in person. Ask me about my latest adventure or favorite podcast.",
  "Yoga in the morning, tacos at night. Looking for someone who appreciates balance.",
  "I've been told I give great recommendations for restaurants, books, and shows. Test me.",
  "Currently mastering the art of homemade pasta. Looking for someone to share my experiments with.",
  "Love concerts and discovering new artists. Always down for a spontaneous show.",
  "Aspiring plant parent with a growing collection. They're all still alive, which I consider a win.",
  "Firm believer that the best conversations happen over good food and drinks.",
  "Looking for someone who wants to explore the world, or at least try that new place downtown.",
  "On weekends you'll find me at coffee shops, farmers markets, or trying to convince someone to go hiking.",
  "I've been known to plan entire trips around restaurant reservations. Looking for someone who gets that.",
  "I believe in work-life balance, which means I work hard and play harder. Looking for someone with the same energy.",
  "Currently on a mission to find the best brunch spot in every neighborhood. Care to join the research?",
  "I'm the friend who always has recommendations ready. Restaurants, shows, books, you name it.",
  "Looking for someone who appreciates both a night out and a night in. Flexibility is key.",
  "My love language is remembering the little details. Your coffee order, your favorite song, your random stories.",
  "I believe in being present, putting phones away at dinner, and actually listening to people.",
  "Looking for someone who values experiences over things. Let's make memories, not collect stuff.",
  "I'm a firm believer that the best adventures are unplanned. Spontaneity is underrated.",
  "On a personal mission to try every cuisine in the city. Always looking for a food adventure partner.",
  "I think the best relationships are built on shared laughter and mutual respect for each other's alone time.",
  "Looking for someone who understands that sometimes the best dates are just walks and good conversation.",
  "I've been told I'm a good listener. I think everyone deserves to be heard. Tell me your story.",
  "My ideal partner is someone who has their own passions and respects mine. Let's support each other.",
  "I believe in celebrating the small wins. Got through Monday? That deserves ice cream.",
  "Looking for someone who's comfortable with silence but also loves deep conversations at 2am.",
  "I'm the kind of person who makes friends with strangers at bars. Looking for someone who appreciates that.",
  "My friends describe me as loyal, thoughtful, and slightly obsessed with finding the best coffee.",
  "Looking for someone who's done playing games and ready for something real. Whatever that looks like.",
  "I think vulnerability is strength. Looking for someone who's not afraid to be real.",
  "On a journey of self-improvement but also learning to accept myself as I am. It's a balance.",
  "Looking for someone who challenges me to be better while accepting who I am right now.",
  "I believe in kindness, curiosity, and always saying yes to dessert.",
  "Looking for someone who's excited about life and wants to share that excitement.",
  "I'm the kind of person who gets genuinely excited about other people's wins. Celebrate with me?",
  "Looking for someone who understands that being supportive doesn't mean agreeing on everything.",
  "I think the best partners are also best friends. Looking for both in one person.",
  "My philosophy is simple: be kind, stay curious, eat well, and don't take yourself too seriously.",
  "Looking for someone who makes even mundane errands feel like an adventure.",
  "I believe the right person makes you want to be better, not someone different.",
  "Looking for someone who values growth, both together and individually.",
  "I'm at a point where I know what I want and I'm not afraid to go after it.",
  "Looking for someone who's building a life they love and wants to share it.",
  "I think the best things in life are better shared. Looking for my person to share them with.",
  
  // === FUNNY/QUIRKY (50) ===
  "My love language is sharing food and sending memes at 2am.",
  "I have strong opinions about coffee and pineapple on pizza. Choose wisely.",
  "Looking for someone to do nothing with. Productively.",
  "I'll remember your birthday and your coffee order. Priorities.",
  "Seeking someone who thinks grocery shopping together is romantic.",
  "Pros: Good listener. Cons: Will quote The Office at inappropriate times.",
  "Looking for someone who gets excited about trying new restaurants.",
  "I've been called 'aggressively friendly' and I'm okay with it.",
  "Here to find someone who thinks staying in is just as fun as going out.",
  "I have a playlist for every mood and occasion. Yes, even that one.",
  "Currently accepting applications for hiking buddy, brunch companion, and Netflix co-pilot.",
  "I take my coffee seriously but not much else.",
  "The type to plan a trip around where we want to eat.",
  "Looking for someone to be weird with. Embrace the chaos.",
  "I'll always share my dessert. That's how you know it's real.",
  "Warning: I have opinions about fonts and I will share them.",
  "Looking for someone who appreciates a well-organized spreadsheet. Is that weird?",
  "I will 100% talk to your pets more than I talk to you at first.",
  "Seeking: partner in snacks. Crime optional.",
  "My autobiography would be titled 'Good intentions, late anyway.'",
  "Looking for someone to enable my plant addiction.",
  "I've been known to befriend other people's dogs at parks. Consider yourself warned.",
  "Currently accepting applications for someone to judge people with at coffee shops.",
  "Looking for a co-host for my imaginary podcast.",
  "I make decisions based on where we can eat after. Sue me.",
  "Warning: I will send you TikToks at 3am. It's my love language.",
  "Seeking someone who appreciates both fine dining and gas station snacks.",
  "My toxic trait is starting new hobbies and abandoning them three weeks later.",
  "Looking for someone who thinks building IKEA furniture together is bonding.",
  "I will absolutely get emotionally attached to your pet.",
  "Seeking: someone to share concerned glances with at social events.",
  "My biggest flex is parallel parking on the first try.",
  "Looking for someone who understands that 'five more minutes' means 30.",
  "I've been told my vibe is 'chaos but make it cozy.'",
  "Warning: I will reorganize your spice rack. It's compulsive.",
  "Seeking someone to split the bill... just kidding, let's split dessert.",
  "My love language is sending you things that made me think of you.",
  "Looking for someone who thinks a clean apartment means we're expecting guests.",
  "I've never met a cheese board I didn't like. This is my personality now.",
  "Seeking: partner for people-watching. Commentary skills required.",
  "My red flag is that I think I'm funny. Jury's still out.",
  "Looking for someone who appreciates a good dad joke. I have many.",
  "Warning: I will absolutely cry at commercials. It's not a weakness.",
  "Seeking someone who thinks buying books counts as reading them.",
  "I make playlists for situations that haven't happened yet. Prepare accordingly.",
  "Looking for someone who takes their work seriously and nothing else.",
  "My biggest achievement is never burning microwave popcorn. The bar is low.",
  "Seeking: someone to pretend we're regulars at new restaurants.",
  "Warning: I will remember that thing you mentioned once and bring it up months later.",
  "Looking for someone who thinks Target runs count as dates."
]

// ============================================
// ABOUT ME TEMPLATES (longer personal descriptions, optional)
// ============================================
const ABOUT_ME_TEMPLATES = [
  "I grew up in a small town but always dreamed of big city life. Now that I'm here, I appreciate both worlds. On weekends I love exploring the city, but I also value quiet nights in with a good book or movie. I'm career-driven but believe life is about balance. Looking for someone who shares that philosophy.",
  "I'm passionate about my work in [field] but believe there's more to life than a paycheck. I love traveling, trying new foods, and having deep conversations about everything from philosophy to pop culture. My friends say I'm loyal, thoughtful, and always up for an adventure.",
  "I've lived in a few different cities and each one has shaped who I am. I love learning about different cultures, whether through travel, food, or conversations with interesting people. I'm looking for someone who's curious about the world and wants to explore it together.",
  "After focusing on my career for the past few years, I'm ready to invest more in my personal life. I'm proud of what I've built professionally, but I've realized that success means nothing without someone to share it with.",
  "I'm an old soul in some ways - I love cooking Sunday dinners, reading actual paper books, and having meaningful conversations. But I also love spontaneous adventures, trying new things, and staying up too late on weeknights when the conversation is good.",
  "My friends describe me as the planner of the group - I'm always researching the best restaurants, planning trips, and organizing get-togethers. But I also know how to go with the flow and appreciate when plans change.",
  "I believe in working hard and playing harder. During the week I'm focused and driven, but weekends are for adventures, brunches, and quality time with the people I care about. Looking for someone with similar energy.",
  "I've learned that life is too short to pretend to be someone you're not. I'm genuine, sometimes awkward, and always authentic. Looking for someone who values real connections over surface-level small talk.",
  "I'm at a point in my life where I know what I want. I've done the soul-searching, worked on myself, and now I'm ready to share my life with someone special. Not looking to play games - just genuine connection.",
  "My journey here has been unconventional, but that's what makes me, me. I've learned from my experiences and I'm grateful for all of them. Now I'm focused on building a future I'm excited about."
]

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

// Generate weighted distance (mostly 1-5 miles)
function generateDistance(seed) {
  const rand = seededRandom(seed)
  if (rand < 0.60) return 1 + Math.floor(seededRandom(seed + 1) * 5) // 1-5 miles (60%)
  if (rand < 0.90) return 6 + Math.floor(seededRandom(seed + 1) * 7) // 6-12 miles (30%)
  return 13 + Math.floor(seededRandom(seed + 1) * 13) // 13-25 miles (10%)
}

// Generate profile tags (2-6 tags) with variation to avoid duplicates
function generateTags(seed, profileIndex) {
  const numTags = 2 + Math.floor(seededRandom(seed) * 5) // 2-6 tags
  // Use profile index to shift the shuffle for variety
  const shiftedTags = [...TAGS]
  const shiftAmount = profileIndex % TAGS.length
  const shuffled = shiftedTags.map((_, i) => 
    shiftedTags[(i + shiftAmount + Math.floor(seededRandom(seed + i) * 10)) % TAGS.length]
  )
  // Filter duplicates
  const unique = [...new Set(shuffled)]
  return unique.slice(0, numTags)
}

// Generate online status with logical lastActiveMinutes
function generateOnlineStatus(seed) {
  const isOnline = seededRandom(seed) < 0.12
  let lastActiveMinutes
  
  if (isOnline) {
    lastActiveMinutes = Math.floor(seededRandom(seed + 1) * 3) // 0-2 mins if online
  } else {
    lastActiveMinutes = 3 + Math.floor(seededRandom(seed + 1) * 1438) // 3-1440 mins if offline
  }
  
  return { isOnline, lastActiveMinutes }
}

// Generate optional height (70% have it)
function generateHeight(seed) {
  if (seededRandom(seed) > 0.70) return null
  return HEIGHTS[Math.floor(seededRandom(seed + 1) * HEIGHTS.length)]
}

// Generate optional job title (85% have it)
function generateJobTitle(seed) {
  if (seededRandom(seed) > 0.85) return null
  return JOB_TITLES[Math.floor(seededRandom(seed + 1) * JOB_TITLES.length)]
}

// Generate optional education (75% have it)
function generateEducation(seed) {
  if (seededRandom(seed) > 0.75) return null
  return EDUCATION[Math.floor(seededRandom(seed + 1) * EDUCATION.length)]
}

// Generate looking for (everyone has this)
function generateLookingFor(seed) {
  return LOOKING_FOR[Math.floor(seededRandom(seed) * LOOKING_FOR.length)]
}

// Generate optional about me (40% have it - longer text)
function generateAboutMe(seed) {
  if (seededRandom(seed) > 0.40) return null
  return ABOUT_ME_TEMPLATES[Math.floor(seededRandom(seed + 1) * ABOUT_ME_TEMPLATES.length)]
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
    const lastInitial = LAST_INITIALS[Math.floor(seededRandom(seed + 0.5) * LAST_INITIALS.length)]
    const location = LOCATIONS[Math.floor(seededRandom(seed + 1) * LOCATIONS.length)]
    const age = generateAge(seed + 2)
    const distanceMiles = generateDistance(seed + 3)
    const bio = BIO_TEMPLATES[Math.floor(seededRandom(seed + 4) * BIO_TEMPLATES.length)]
    const tags = generateTags(seed + 5, i)
    const { isOnline, lastActiveMinutes } = generateOnlineStatus(seed + 6)
    const height = generateHeight(seed + 7)
    const jobTitle = generateJobTitle(seed + 8)
    const education = generateEducation(seed + 9)
    const lookingFor = generateLookingFor(seed + 10)
    const aboutMe = generateAboutMe(seed + 11)
    const profileId = generateUUID(seed + 12)
    
    // Generate DiceBear Lorelei avatar URL from profile ID (deterministic, illustrated, no real people)
    const photoUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${profileId}&backgroundColor=1a1a2e,16213e,0f3460`
    
    profiles.push({
      id: profileId,
      firstName,
      lastInitial,
      displayName: `${firstName} ${lastInitial}.`,
      age,
      city: location.city,
      state: location.state,
      distanceMiles,
      bio,
      tags,
      isOnline,
      lastActiveMinutes,
      height,
      jobTitle,
      education,
      lookingFor,
      aboutMe,
      photoUrl
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
  if (minutes <= 2) return 'Online now'
  if (minutes < 30) return `Active ${minutes}m ago`
  if (minutes < 60) return `Active ${Math.floor(minutes / 5) * 5}m ago`
  if (minutes < 1440) return `Active ${Math.floor(minutes / 60)}h ago`
  return `Active ${Math.floor(minutes / 1440)}d ago`
}

/**
 * Check if recently active (within 30 mins)
 * @param {number} minutes - Minutes since last active
 * @returns {boolean}
 */
export function isRecentlyActive(minutes) {
  return minutes < 30
}

export { TAGS, LOOKING_FOR }
