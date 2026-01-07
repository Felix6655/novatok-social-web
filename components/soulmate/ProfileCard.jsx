'use client'

import { Heart, X, Star, MapPin, Clock, User } from 'lucide-react'
import { formatLastActive } from '@/lib/soulmate/profileGenerator'

/**
 * Profile Card Component
 * Displays a single profile with photo placeholder, info, and tags
 */
export default function ProfileCard({ 
  profile, 
  onLike, 
  onPass, 
  onSuperLike,
  isTop = false,
  style = {}
}) {
  if (!profile) return null
  
  const { firstName, age, city, state, distanceMiles, bio, tags, isOnline, lastActiveMinutes, photoUrl } = profile
  
  return (
    <div 
      className={`bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 ${
        isTop ? 'shadow-2xl shadow-pink-500/10' : ''
      }`}
      style={style}
    >
      {/* Photo Area */}
      <div className="h-80 relative overflow-hidden">
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={firstName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-indigo-900/40 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/30 mx-auto mb-3 flex items-center justify-center border border-pink-500/20">
                <User className="w-12 h-12 text-pink-300/60" />
              </div>
              <p className="text-gray-500 text-sm">Photos coming soon</p>
            </div>
          </div>
        )}
        
        {/* Online/Active Badge */}
        <div className="absolute top-4 right-4">
          {isOnline ? (
            <span className="px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Online
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-gray-900/80 text-gray-300 text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {formatLastActive(lastActiveMinutes)}
            </span>
          )}
        </div>
        
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(0,0%,7%)] to-transparent" />
      </div>
      
      {/* Info Section */}
      <div className="p-5 -mt-8 relative">
        {/* Name & Age */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">
            {firstName}, {age}
          </h2>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{city}, {state}</span>
          <span className="text-gray-600">•</span>
          <span>{distanceMiles} {distanceMiles === 1 ? 'mile' : 'miles'} away</span>
        </div>
        
        {/* Bio */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {bio}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.slice(0, 5).map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1 rounded-full bg-gray-800/80 text-gray-300 text-xs font-medium border border-gray-700/50"
            >
              {tag}
            </span>
          ))}
          {tags.length > 5 && (
            <span className="px-3 py-1 rounded-full bg-gray-800/50 text-gray-500 text-xs">
              +{tags.length - 5} more
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onPass?.(profile)}
            className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-700"
            aria-label="Pass"
          >
            <X className="w-7 h-7 text-gray-400" />
          </button>
          <button
            onClick={() => onSuperLike?.(profile)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg shadow-blue-600/30"
            aria-label="Super Like"
          >
            <Star className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={() => onLike?.(profile)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg shadow-pink-500/30"
            aria-label="Like"
          >
            <Heart className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
