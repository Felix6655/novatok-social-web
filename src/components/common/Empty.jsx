'use client'

import { 
  Inbox, 
  Search, 
  FileQuestion, 
  Star, 
  Sparkles,
  Heart,
  Music,
  MessageCircle,
  Image as ImageIcon,
  Calendar,
  Bookmark
} from 'lucide-react'

/**
 * Shared Empty State Component
 * 
 * Features:
 * - Contextual icons and messaging
 * - Optional action button
 * - Multiple preset variants
 */

// Preset configurations for common empty states
const PRESETS = {
  default: {
    icon: Inbox,
    title: 'Nothing here yet',
    description: 'Content will appear here once available.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
  notFound: {
    icon: FileQuestion,
    title: 'Not found',
    description: 'The content you\'re looking for doesn\'t exist.',
  },
  horoscope: {
    icon: Star,
    title: 'No reading yet',
    description: 'Select your sign and generate a reading to see your cosmic guidance.',
  },
  tarot: {
    icon: Sparkles,
    title: 'No cards drawn',
    description: 'Ask a question and draw cards to receive your guidance.',
  },
  matches: {
    icon: Heart,
    title: 'No matches yet',
    description: 'Keep swiping to find your soulmate!',
  },
  music: {
    icon: Music,
    title: 'No tracks',
    description: 'Discover new music to add to your library.',
  },
  messages: {
    icon: MessageCircle,
    title: 'No messages',
    description: 'Start a conversation with someone.',
  },
  media: {
    icon: ImageIcon,
    title: 'No media',
    description: 'Upload photos or videos to see them here.',
  },
  events: {
    icon: Calendar,
    title: 'No events',
    description: 'Check back later for upcoming events.',
  },
  saved: {
    icon: Bookmark,
    title: 'Nothing saved',
    description: 'Items you save will appear here.',
  },
  history: {
    icon: Inbox,
    title: 'No history',
    description: 'Your recent activity will show up here.',
  },
}

export function Empty({
  preset = 'default',
  icon: CustomIcon = null,
  title = null,
  description = null,
  action = null,
  actionLabel = 'Get Started',
  className = '',
  size = 'md',
}) {
  // Get preset config or use defaults
  const presetConfig = PRESETS[preset] || PRESETS.default
  
  const Icon = CustomIcon || presetConfig.icon
  const displayTitle = title || presetConfig.title
  const displayDescription = description || presetConfig.description

  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'w-8 h-8',
      iconWrapper: 'w-12 h-12',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      container: 'py-10',
      icon: 'w-10 h-10',
      iconWrapper: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-base',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}>
      {/* Icon */}
      <div className={`${sizes.iconWrapper} rounded-full bg-gray-800/50 flex items-center justify-center mb-4`}>
        <Icon className={`${sizes.icon} text-gray-500`} />
      </div>
      
      {/* Title */}
      <h3 className={`${sizes.title} font-medium text-gray-300 mb-1`}>
        {displayTitle}
      </h3>
      
      {/* Description */}
      <p className={`${sizes.description} text-gray-500 max-w-xs`}>
        {displayDescription}
      </p>
      
      {/* Action button */}
      {action && (
        <button
          onClick={action}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default Empty
