'use client'

import Link from 'next/link'
import Image from 'next/image'
import SocialLinks, { hasSocialLinks } from '@/components/SocialLinks'
import { FaHome, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-center md:justify-start">
              <Image
                src="/logo.png"
                alt="MedaGhar Logo"
                width={100}
                height={100}
                sizes="(max-width: 768px) 60px, (max-width: 1024px) 80px, 100px"
                className="h-[60px] w-[60px] md:h-[80px] md:w-[80px] lg:h-[100px] lg:w-[100px] object-contain"
              />
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white -ml-1 md:-ml-2">MedaGhar</span>
            </div>
            <p className="text-slate-300/70 mb-6 leading-relaxed">
              Free property listings in Pakistan. Find your dream home, plot, or commercial property across Pakistan.
              Trusted by thousands of buyers, sellers, and renters.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-copper-500 flex-shrink-0" />
                <a href="mailto:info@medaghar.com" className="text-sm hover:text-white transition">
                  info@medaghar.com
                </a>
              </div>
            </div>

            {/* Social Media */}
            {hasSocialLinks(true) && (
              <div className="mt-6">
                <h4 className="text-white font-semibold mb-3">Follow Us</h4>
                <SocialLinks variant="dark" includeWhatsapp />
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/residential-for-sale" className="hover:text-white transition text-sm">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link href="/residential-for-rent" className="hover:text-white transition text-sm">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition text-sm">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link href="/for-sale/plot" className="hover:text-white transition text-sm">
                  Plots & Land
                </Link>
              </li>
              <li>
                <Link href="/commercial-for-sale" className="hover:text-white transition text-sm">
                  Commercial
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-white transition text-sm">
                  FSBO Listings
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-white transition text-sm">
                  Find Agents
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities — link into the tree, both purposes */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Popular Cities</h3>
            <ul className="space-y-2">
              {[
                { name: 'Lahore', slug: 'lahore' },
                { name: 'Karachi', slug: 'karachi' },
                { name: 'Islamabad', slug: 'islamabad' },
                { name: 'Rawalpindi', slug: 'rawalpindi' },
                { name: 'Faisalabad', slug: 'faisalabad' },
                { name: 'Multan', slug: 'multan' },
                { name: 'Peshawar', slug: 'peshawar' },
              ].map((city) => (
                <li key={city.slug} className="text-sm">
                  <Link
                    href={`/for-sale/property/${city.slug}`}
                    className="hover:text-white transition"
                  >
                    Property for sale in {city.name}
                  </Link>
                  <span className="text-gray-600 mx-1.5">·</span>
                  <Link
                    href={`/for-rent/property/${city.slug}`}
                    className="hover:text-white transition"
                  >
                    rent
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Free Tools */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Free Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/mortgage-calculator" className="hover:text-white transition text-sm">
                  Home Loan Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/area-converter" className="hover:text-white transition text-sm">
                  Marla & Kanal Converter
                </Link>
              </li>
              <li>
                <Link href="/tools/construction-cost-calculator" className="hover:text-white transition text-sm">
                  Construction Cost Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/property-tax-calculator" className="hover:text-white transition text-sm">
                  Property Tax Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/rental-yield-calculator" className="hover:text-white transition text-sm">
                  Rental Yield Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition text-sm font-semibold text-copper-400">
                  All Tools →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/guides" className="hover:text-white transition text-sm">
                  Property Guides
                </Link>
              </li>
              <li>
                <Link href="/guides/first-time-home-buyer-guide-pakistan" className="hover:text-white transition text-sm">
                  First-Time Buyer Guide
                </Link>
              </li>
              <li>
                <Link href="/home-loans" className="hover:text-white transition text-sm">
                  Home Loans
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition text-sm">
                  Featured Listings
                </Link>
              </li>
              <li>
                <Link href="/market-insights" className="hover:text-white transition text-sm">
                  Market Insights
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/sitemap-page" className="hover:text-white transition text-sm">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-300/60 text-center md:text-left">
              © {new Date().getFullYear()} MedaGhar. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/guides" className="text-slate-300/60 hover:text-white transition">
                Guides
              </Link>
              <Link href="/tools" className="text-slate-300/60 hover:text-white transition">
                Tools
              </Link>
              <Link href="/pricing" className="text-slate-300/60 hover:text-white transition">
                Pricing
              </Link>
              <Link href="/about" className="text-slate-300/60 hover:text-white transition">
                About Us
              </Link>
              <Link href="/privacy" className="text-slate-300/60 hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-300/60 hover:text-white transition">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-slate-300/60 hover:text-white transition">
                Contact Us
              </Link>
              <Link href="/sitemap-page" className="text-slate-300/60 hover:text-white transition">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

