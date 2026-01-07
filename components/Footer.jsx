'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/ToastProvider'

// Social media icons as SVG components for crisp rendering
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DiscordIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

const TelegramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
)

// Footer link columns data
const footerLinks = {
  ecosystem: {
    title: 'Ecosystem',
    links: [
      { label: 'All Apps', href: '/home' },
      { label: 'Ecosystem', href: '#' },
      { label: 'NFT Marketplace', href: '#' },
      { label: 'Token', href: '#' },
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Whitepaper', href: '#' },
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ]
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Investors', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Community', href: '#' },
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ]
  }
}

// Social links data
const socialLinks = [
  { name: 'Twitter', href: '#', icon: TwitterIcon },
  { name: 'Discord', href: '#', icon: DiscordIcon },
  { name: 'Telegram', href: '#', icon: TelegramIcon },
  { name: 'YouTube', href: '#', icon: YouTubeIcon },
  { name: 'GitHub', href: '#', icon: GitHubIcon },
]

// Network Status Component (can be wired to real status later)
function NetworkStatus() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span>Built on Solana</span>
      <span className="text-gray-600">•</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>Network Status: <span className="text-green-400">Operational</span></span>
      </div>
    </div>
  )
}

// Link Column Component
function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link 
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Main Footer Component
export default function Footer() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Newsletter subscription:', email)
    toast({ type: 'success', message: 'Subscribed! Welcome to the NovaTok newsletter.' })
    setEmail('')
    setIsSubmitting(false)
  }

  return (
    <footer className="relative mt-auto">
      {/* Gradient glow effect at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      {/* Main footer container with glass effect */}
      <div className="relative bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-black/95 backdrop-blur-xl border-t border-gray-800/50">
        {/* Subtle glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 lg:gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">N</span>
                  </div>
                  <span className="text-white font-bold text-xl tracking-tight">NovaTok</span>
                </Link>
                
                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                  Building the future of multi-app crypto utility. Join us in revolutionizing decentralized applications.
                </p>
                
                {/* Social Links */}
                <div className="flex items-center gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-purple-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                      aria-label={social.name}
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Link Columns - Responsive Grid */}
              <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                <LinkColumn {...footerLinks.ecosystem} />
                <LinkColumn {...footerLinks.resources} />
                <LinkColumn {...footerLinks.company} />
                <LinkColumn {...footerLinks.legal} />
              </div>
            </div>
          </div>
          
          {/* Newsletter Section */}
          <div className="py-8 border-t border-gray-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-white font-semibold mb-1">Subscribe to our newsletter</h3>
                <p className="text-gray-400 text-sm">Get the latest updates and news directly to your inbox.</p>
              </div>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex-1 lg:w-72">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError('')
                    }}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      emailError 
                        ? 'border-red-500/50 focus:ring-red-500/30' 
                        : 'border-gray-700/50 focus:border-purple-500/50 focus:ring-purple-500/30'
                    }`}
                    aria-label="Email address"
                    aria-invalid={!!emailError}
                  />
                  {emailError && (
                    <p className="mt-1 text-red-400 text-xs">{emailError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="py-6 border-t border-gray-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} NovaTok. All rights reserved.
              </p>
              <NetworkStatus />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
