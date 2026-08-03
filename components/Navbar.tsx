'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { FaHeart, FaUser, FaBars, FaTimes, FaSignOutAlt, FaCog, FaEnvelope, FaChevronDown } from 'react-icons/fa'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

// Point at the canonical tree targets, not the legacy flat pages — those
// 301 into these in Phase 5, and nav should never route through a redirect.
const PRIMARY_LINKS = [
  { href: '/residential-for-sale', label: 'Buy' },
  { href: '/residential-for-rent', label: 'Rent' },
  { href: '/sell', label: 'Sell' },
  { href: '/for-sale/plot', label: 'Plots' },
  { href: '/commercial-for-sale', label: 'Commercial' },
  { href: '/agents', label: 'Agents' },
  { href: '/guides', label: 'Guides' },
  { href: '/tools', label: 'Tools' },
]

const MORE_LINKS = [
  { href: '/owner', label: 'By Owner — No Commission' },
  { href: '/commercial-for-rent', label: 'Commercial for Rent' },
  { href: '/market-insights', label: 'Market Insights' },
  { href: '/home-loans', label: 'Home Loans' },
  { href: '/pricing', label: 'Pricing & Featured' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session, status } = useSession()
  const moreRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session) {
      fetchUnreadCount()
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/inbox')
      if (response.ok) {
        const data = await response.json()
        const unread = data.messages.filter((msg: any) => !msg.isRead).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px] lg:h-[88px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt="MedaGhar Logo"
              width={72}
              height={72}
              priority
              sizes="(max-width: 1024px) 56px, 72px"
              className="h-14 w-14 lg:h-[72px] lg:w-[72px] object-contain"
            />
            <span className="text-2xl lg:text-[28px] font-bold text-cyan-700 tracking-tight">
              Meda<span className="text-gray-900">Ghar</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium text-[15px] px-3 py-2 rounded-lg transition whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium text-[15px] px-3 py-2 rounded-lg transition"
              >
                More <FaChevronDown className={`text-[10px] transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <Link
              href="/saved"
              className="text-gray-500 hover:text-cyan-700 hover:bg-cyan-50 p-2.5 rounded-lg transition"
              aria-label="Saved properties"
            >
              <FaHeart className="text-lg" />
            </Link>
            {session && (
              <Link
                href="/messages"
                className="text-gray-500 hover:text-cyan-700 hover:bg-cyan-50 p-2.5 rounded-lg transition relative"
                aria-label="Messages"
              >
                <FaEnvelope className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] rounded-full h-4.5 w-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:bg-cyan-50 rounded-lg px-2 py-1.5 transition"
                >
                  {session.user.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt={session.user.name || 'User'}
                      width={34}
                      height={34}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[34px] h-[34px] bg-cyan-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                    </div>
                  )}
                  <span className="text-gray-700 font-medium text-[15px]">{session.user.firstName}</span>
                  <FaChevronDown className={`text-[10px] text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaUser className="mr-2.5 text-gray-400" />
                      My Profile
                    </Link>
                    <Link
                      href="/saved"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaHeart className="mr-2.5 text-gray-400" />
                      Saved Properties
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaEnvelope className="mr-2.5 text-gray-400" />
                      Messages
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaCog className="mr-2.5 text-gray-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt className="mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="bg-cyan-700 text-white text-[15px] font-semibold px-6 py-2.5 rounded-lg hover:bg-cyan-800 transition shadow-sm whitespace-nowrap ml-1"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-gray-700 p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {session && (
                <div className="px-4 py-3 bg-cyan-50 rounded-xl mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
              )}
              {[...PRIMARY_LINKS, ...MORE_LINKS].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium px-4 py-2.5 rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/saved"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium px-4 py-2.5 rounded-lg transition"
              >
                Saved Properties
              </Link>
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    Messages{unreadCount > 0 ? ` (${unreadCount})` : ''}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-cyan-700 hover:bg-cyan-50 font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition text-center font-semibold mt-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-cyan-700 text-white px-4 py-3 rounded-xl hover:bg-cyan-800 transition text-center font-semibold mt-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
