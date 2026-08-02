import Link from 'next/link'
import HeroBg from '@/components/HeroBg'
import { FaHome, FaBuilding, FaKey, FaStore, FaMapMarkedAlt, FaCalculator, FaUsers, FaChartLine, FaEnvelope, FaFileAlt, FaShieldAlt, FaFileContract, FaSitemap, FaUserTie } from 'react-icons/fa'

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: 'Main Pages',
      icon: FaHome,
      color: 'green',
      links: [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
      ]
    },
    {
      title: 'Property Search',
      icon: FaMapMarkedAlt,
      color: 'blue',
      links: [
        { name: 'Buy Properties', href: '/buy' },
        { name: 'Rent Properties', href: '/rent' },
        { name: 'Sell Property', href: '/sell' },
        { name: 'All Properties', href: '/properties' },
        { name: 'Plots & Land', href: '/plots' },
        { name: 'Commercial Properties', href: '/commercial' },
      ]
    },
    {
      title: 'Property Types',
      icon: FaBuilding,
      color: 'purple',
      links: [
        { name: 'Houses', href: '/properties?type=HOUSE' },
        { name: 'Flats/Apartments', href: '/properties?type=FLAT' },
        { name: 'Upper Portions', href: '/properties?type=UPPER_PORTION' },
        { name: 'Lower Portions', href: '/properties?type=LOWER_PORTION' },
        { name: 'Farm Houses', href: '/properties?type=FARM_HOUSE' },
        { name: 'Residential Plots', href: '/plots?type=RESIDENTIAL_PLOT' },
        { name: 'Commercial Plots', href: '/plots?type=COMMERCIAL_PLOT' },
        { name: 'Offices', href: '/commercial?type=OFFICE' },
        { name: 'Shops', href: '/commercial?type=SHOP' },
        { name: 'Warehouses', href: '/commercial?type=WAREHOUSE' },
      ]
    },
    {
      title: 'Popular Cities',
      icon: FaMapMarkedAlt,
      color: 'orange',
      links: [
        { name: 'Properties in Lahore', href: '/properties?city=Lahore' },
        { name: 'Properties in Karachi', href: '/properties?city=Karachi' },
        { name: 'Properties in Islamabad', href: '/properties?city=Islamabad' },
        { name: 'Properties in Rawalpindi', href: '/properties?city=Rawalpindi' },
        { name: 'Properties in Faisalabad', href: '/properties?city=Faisalabad' },
        { name: 'Properties in Multan', href: '/properties?city=Multan' },
        { name: 'Properties in Peshawar', href: '/properties?city=Peshawar' },
        { name: 'Properties in Quetta', href: '/properties?city=Quetta' },
      ]
    },
    {
      title: 'Tools & Services',
      icon: FaCalculator,
      color: 'teal',
      links: [
        { name: 'Find Agents', href: '/agents' },
        { name: 'Market Insights', href: '/market-insights' },
        { name: 'FSBO Listings', href: '/fsbo' },
        { name: 'Compare Properties', href: '/compare' },
      ]
    },
    {
      title: 'User Account',
      icon: FaUsers,
      color: 'indigo',
      links: [
        { name: 'Sign In', href: '/signin' },
        { name: 'Sign Up', href: '/signup' },
        { name: 'Saved Properties', href: '/saved' },
        { name: 'Saved Searches', href: '/searches' },
        { name: 'Messages', href: '/messages' },
        { name: 'My Reviews', href: '/reviews/my-reviews' },
      ]
    },
    {
      title: 'Legal & Information',
      icon: FaFileAlt,
      color: 'gray',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Sitemap', href: '/sitemap-page' },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-[55px] lg:py-[89px]">
        <HeroBg src="/images/cities/city-homes-1.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaSitemap className="text-[55px] lg:text-[89px] mx-auto mb-[21px] opacity-90" />
            <h1 className="text-[34px] sm:text-[55px] lg:text-[68px] font-bold mb-[21px]">
              Sitemap
            </h1>
            <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mx-auto">
              Navigate through all pages and features of MedaGhar
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[21px] lg:gap-[34px]">
          {sitemapSections.map((section, index) => {
            const Icon = section.icon
            const colorClasses = {
              green: 'bg-cyan-100 text-cyan-600',
              blue: 'bg-cyan-100 text-cyan-600',
              purple: 'bg-cyan-100 text-cyan-700',
              orange: 'bg-copper-100 text-copper-600',
              teal: 'bg-cyan-100 text-cyan-700',
              red: 'bg-red-100 text-red-600',
              indigo: 'bg-cyan-100 text-cyan-700',
              gray: 'bg-slate-100 text-gray-600',
            }[section.color]

            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-[34px] hover:shadow-xl transition">
                <div className="flex items-center gap-[13px] mb-[21px]">
                  <div className={`w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                    <Icon className="text-[21px]" />
                  </div>
                  <h2 className="text-[21px] font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-[8px]">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.href}
                        className="text-[16px] text-gray-700 hover:text-cyan-600 hover:underline transition block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-[55px] lg:mt-[89px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-[34px] lg:p-[55px] text-white">
          <h2 className="text-[26px] lg:text-[34px] font-bold mb-[34px] text-center">
            Explore MedaGhar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[21px] text-center">
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">100+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Pages & Features</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">50+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Cities Covered</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">24</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Property Types</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">1M+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Active Listings</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-[55px] text-center">
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[21px]">
            Need Help?
          </h2>
          <p className="text-[16px] text-gray-700 mb-[34px] max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you navigate MedaGhar
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl hover:bg-cyan-800 transition font-medium text-[16px]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}

