'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'
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
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-full hover:bg-cyan-700 transition"
                  aria-label="Facebook"
                >
                  <FaFacebook className="text-xl" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-full hover:bg-cyan-700 transition"
                  aria-label="Twitter"
                >
                  <FaTwitter className="text-xl" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-full hover:bg-cyan-700 transition"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-xl" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-full hover:bg-cyan-700 transition"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="text-xl" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-full hover:bg-cyan-700 transition"
                  aria-label="YouTube"
                >
                  <FaYoutube className="text-xl" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/buy" className="hover:text-white transition text-sm">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link href="/rent" className="hover:text-white transition text-sm">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-white transition text-sm">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link href="/plots" className="hover:text-white transition text-sm">
                  Plots & Land
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="hover:text-white transition text-sm">
                  Commercial
                </Link>
              </li>
              <li>
                <Link href="/fsbo" className="hover:text-white transition text-sm">
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

          {/* Popular Cities */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Popular Cities</h3>
            <ul className="space-y-2">
              {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'].map((city) => (
                <li key={city}>
                  <Link href={`/properties?city=${encodeURIComponent(city)}`} className="hover:text-white transition text-sm">
                    Properties in {city}
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

        {/* Mobile App Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="text-center lg:text-left">
            <h3 className="text-white font-bold text-lg mb-4">Download Our Mobile App</h3>
            <p className="text-slate-300/60 mb-4 text-sm">
              Get the best property search experience on your mobile device
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a 
                href="#" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-cyan-800 px-6 py-3 rounded-lg transition"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a 
                href="#" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-cyan-800 px-6 py-3 rounded-lg transition"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
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

