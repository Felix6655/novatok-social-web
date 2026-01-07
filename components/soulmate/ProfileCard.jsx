'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, X, Star, MapPin, Clock, User, Briefcase, GraduationCap, Ruler, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { formatLastActive, isRecentlyActive } from '@/lib/soulmate/profileGenerator'

/**
 * Profile Card Component
 * Displays a single profile with photo, info, tags, and optional fields
 * Uses next/image for optimized loading with fade-in effect
 */
export default function ProfileCard({ 
  profile, 
  onLike, 
  onPass, 
  onSuperLike,
  isTop = false,
  style = {}
}) {
  const [showMore, setShowMore] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  if (!profile) return null
  
  const { 
    displayName, 
    age, 
    city, 
    state, 
    distanceMiles, 
    bio, 
    tags, 
    isOnline, 
    lastActiveMinutes, 
    photoUrl,
    height,
    jobTitle,
    education,
    lookingFor,
    aboutMe
  } = profile
  
  const recentlyActive = !isOnline && isRecentlyActive(lastActiveMinutes)
  const showPlaceholder = !photoUrl || imageError
  
  return (
    <div 
      className={`bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 ${
        isTop ? 'shadow-2xl shadow-pink-500/10' : ''
      }`}
      style={style}
    >
      {/* Photo Area */}
      <div className="h-80 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Gradient Placeholder (shown while loading or on error) */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-indigo-900/40 flex items-center justify-center transition-opacity duration-500 ${
            showPlaceholder ? 'opacity-100' : imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/30 mx-auto mb-3 flex items-center justify-center border border-pink-500/20">
              <User className="w-12 h-12 text-pink-300/60" />
            </div>
            {showPlaceholder && (
              <p className="text-gray-500 text-sm">Photo unavailable</p>
            )}
          </div>
        </div>
        
        {/* Actual Photo with fade-in */}
        {photoUrl && !imageError && (
          <div 
            className={`absolute inset-0 transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={photoUrl}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover object-top"
              priority={isTop}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
          {isOnline ? (
            <span className="px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Online
            </span>
          ) : recentlyActive ? (
            <span className="px-3 py-1.5 rounded-full bg-emerald-600/80 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              Recently active
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-gray-900/80 text-gray-300 text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {formatLastActive(lastActiveMinutes)}
            </span>
          )}
        </div>
        
        {/* Looking For Badge */}
        {lookingFor && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-full bg-purple-600/80 text-white text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              {lookingFor}
            </span>
          </div>
        )}
        
        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[hsl(0,0%,7%)] via-[hsl(0,0%,7%)]/80 to-transparent z-[5]" />
      </div>
      
      {/* Info Section */}
      <div className="p-5 -mt-12 relative z-10">
        {/* Name & Age */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-white">
            {displayName}, {age}
          </h2>
          {height && (
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              {height}
            </span>
          )}
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>{city}, {state}</span>
          <span className="text-gray-600">•</span>
          <span>{distanceMiles} {distanceMiles === 1 ? 'mile' : 'miles'} away</span>
        </div>
        
        {/* Job & Education Row */}
        {(jobTitle || education) && (
          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm mb-3">
            {jobTitle && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                {jobTitle}
              </span>
            )}
            {education && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                {education}
              </span>
            )}
          </div>
        )}
        
        {/* Bio */}
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {bio}
        </p>
        
        {/* About Me (expandable) */}
        {aboutMe && (
          <div className="mb-3">
            <button 
              onClick={() => setShowMore(!showMore)}
              className="text-pink-400 text-xs font-medium flex items-center gap-1 hover:text-pink-300 transition-colors"
            >
              {showMore ? 'Show less' : 'More about me'}
              {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showMore && (
              <p className="text-gray-400 text-sm mt-2 leading-relaxed bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                {aboutMe}
              </p>
            )}
          </div>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.slice(0, 5).map((tag) => (
            <span 
              key={tag} 
              className="px-3 py-1 rounded-full bg-gray-800/80 text-gray-300 text-xs font-medium border border-gray-700/50 hover:border-gray-600 transition-colors"
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

/**
 * Skeleton Loading Card
 */
export function ProfileCardSkeleton() {
  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden animate-pulse">
      {/* Photo skeleton */}
      <div className="h-80 bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gray-700/50 mx-auto mb-3" />
            <div className="h-4 w-32 bg-gray-700/50 rounded mx-auto" />
          </div>
        </div>
        {/* Badge skeletons */}
        <div className="absolute top-4 right-4">
          <div className="h-7 w-20 bg-gray-700/50 rounded-full" />
        </div>
        <div className="absolute top-4 left-4">
          <div className="h-7 w-16 bg-gray-700/50 rounded-full" />
        </div>
      </div>
      
      {/* Info skeleton */}
      <div className="p-5 -mt-8 relative">
        <div className="flex justify-between mb-2">
          <div className="h-7 w-40 bg-gray-700/50 rounded" />
          <div className="h-5 w-12 bg-gray-700/50 rounded" />
        </div>
        <div className="h-4 w-48 bg-gray-700/50 rounded mb-3" />
        <div className="h-4 w-64 bg-gray-700/50 rounded mb-2" />
        <div className="h-4 w-56 bg-gray-700/50 rounded mb-4" />
        
        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="h-7 w-16 bg-gray-700/50 rounded-full" />
          <div className="h-7 w-20 bg-gray-700/50 rounded-full" />
          <div className="h-7 w-14 bg-gray-700/50 rounded-full" />
          <div className="h-7 w-18 bg-gray-700/50 rounded-full" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex justify-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-700/50" />
          <div className="w-14 h-14 rounded-full bg-gray-700/50" />
          <div className="w-14 h-14 rounded-full bg-gray-700/50" />
        </div>
      </div>
    </div>
  )
}
