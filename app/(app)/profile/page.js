'use client'

import { User, Settings, Camera, MapPin, Calendar, Link as LinkIcon } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
            <User className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-sm text-gray-400">Your public profile</p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-purple-600/30 to-pink-600/30 relative">
          <button className="absolute bottom-3 right-3 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-[hsl(0,0%,7%)]">
              <User className="w-10 h-10 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Name & Bio */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white">Your Name</h2>
              <p className="text-gray-500">@username</p>
            </div>
            <p className="text-gray-300">Your bio will appear here. Tell the world about yourself!</p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </span>
              <span className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                website.com
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined 2024
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t border-gray-800">
              <div>
                <span className="text-white font-bold">0</span>
                <span className="text-gray-500 ml-1">Following</span>
              </div>
              <div>
                <span className="text-white font-bold">0</span>
                <span className="text-gray-500 ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <button className="w-full py-3 rounded-xl border border-gray-700 text-white font-medium hover:bg-gray-800 transition-colors">
        Edit Profile
      </button>
    </div>
  )
}
