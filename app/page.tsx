import Link from 'next/link'
import Image from 'next/image'
import { getGuideCover } from '@/lib/images'
import SearchBar from '@/components/SearchBar'
import PropertyCard from '@/components/PropertyCard'
import AdSlot from '@/components/AdSlot'
import { prisma } from '@/lib/prisma'
import { GUIDES } from '@/content/guides'
import { FaHome, FaBuilding, FaKey, FaMapMarkedAlt, FaStore, FaHandshake, FaChartLine, FaArrowRight, FaStar, FaCheckCircle, FaUserTie, FaAward, FaPhone, FaCalculator, FaRulerCombined, FaHardHat, FaFileInvoiceDollar, FaBookOpen, FaClock } from 'react-icons/fa'

export default async function Home() {
  // Fetch featured properties
  const featuredProperties = await prisma.property.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
    orderBy: [{ isFeatured: 'desc' }, { listedDate: 'desc' }],
    take: 6,
  })

  // Get property counts by city
  const propertyCounts = await prisma.property.groupBy({
    by: ['city'],
    _count: true,
    where: { status: 'ACTIVE' },
  })

  // Fetch top-rated agents
  const featuredAgents = await prisma.agent.findMany({
    where: {
      rating: {
        gte: 4.0,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          properties: true,
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
    ],
    take: 5,
  })

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section with photo background */}
      <div className="relative text-white overflow-hidden">
        <Image
          src="/images/hero-home.jpg"
          alt="Modern house in Pakistan"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Brand overlay: keeps text readable while the photo shows through */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-800/60" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
          <div className="text-center mb-[34px] lg:mb-[55px]">
            <span className="inline-block bg-white/15 backdrop-blur border border-white/25 text-slate-200 text-[13px] lg:text-[15px] font-semibold px-[21px] py-[8px] rounded-full mb-[21px]">
              Pakistan&apos;s 100% Free Property Marketplace
            </span>
            <h1 className="text-[34px] sm:text-[55px] lg:text-[68px] font-bold mb-[21px] leading-tight drop-shadow-lg">
              Find Your Ghar in Pakistan
            </h1>
            <p className="text-[16px] lg:text-[21px] text-slate-200 max-w-4xl mx-auto drop-shadow-md">
              Buy, sell & rent houses, flats, plots and commercial property in Lahore, Karachi,
              Islamabad & across Pakistan — free listings, direct contact, no commission.
            </p>
          </div>
          <SearchBar />

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-x-[34px] gap-y-[13px] mt-[34px] text-[14px] text-slate-200/90">
            <span className="flex items-center gap-[8px]"><FaCheckCircle className="text-copper-400" /> Free forever for owners</span>
            <span className="flex items-center gap-[8px]"><FaCheckCircle className="text-copper-400" /> Direct owner & agent contact</span>
            <span className="flex items-center gap-[8px]"><FaCheckCircle className="text-copper-400" /> Verified listings badge</span>
          </div>
        </div>
      </div>

      {/* Quick Links - Fibonacci spacing: py-[55px] */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px] lg:py-[55px]">
        {/* Fibonacci grid: 6 columns (Fibonacci number) with gap-[21px] */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[13px] lg:gap-[21px]">
          <Link href="/buy" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
            <FaHome className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">Buy</p>
            <p className="text-[13px] text-gray-600 hidden sm:block">Houses, Flats & More</p>
          </Link>
          <Link href="/rent" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
            <FaKey className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">Rent</p>
            <p className="text-[13px] text-gray-600 hidden sm:block">Apartments & Portions</p>
          </Link>
          <Link href="/sell" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
            <FaBuilding className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">Sell</p>
            <p className="text-[13px] text-gray-600 hidden sm:block">List Your Property</p>
          </Link>
          <Link href="/fsbo" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
            <FaHandshake className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">FSBO</p>
            <p className="text-[13px] text-gray-600 hidden sm:block">For Sale By Owner</p>
          </Link>
          <Link href="/plots" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
            <FaMapMarkedAlt className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">Plots</p>
            <p className="text-[13px] text-gray-600 hidden sm:block">Residential & Commercial</p>
          </Link>
          <Link href="/commercial" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
            <FaStore className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">Commercial</p>
            <p className="text-[13px] text-gray-600 hidden sm:block">Offices & Shops</p>
          </Link>
          <Link href="/market-insights" className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-xl transition text-center col-span-2 lg:col-span-2 group">
            <FaChartLine className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
            <p className="text-[16px] font-semibold mb-[8px]">Market Insights</p>
            <p className="text-[13px] text-gray-600">Trends & Analytics</p>
          </Link>
        </div>

        {/* For Landlords Section with photo */}
        <div className="mt-[34px] relative rounded-2xl overflow-hidden text-white shadow-lg">
          <Image
            src="/images/keys-handover.jpg"
            alt="Handing over house keys"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-slate-800/70" />
          <div className="relative z-10 p-[21px] lg:p-[34px] flex flex-col md:flex-row items-center justify-between gap-[21px]">
            <div>
              <p className="text-[21px] lg:text-[26px] font-bold mb-[13px]">Are you a Landlord?</p>
              <p className="text-[16px] text-slate-300">Post your rental property free and get direct calls from verified tenants</p>
            </div>
            <Link
              href="/post-rent"
              className="bg-white text-slate-900 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-slate-100 transition whitespace-nowrap"
            >
              Post Rental Free
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Cities - Fibonacci spacing: py-[55px] */}
      <div className="bg-white py-[55px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fibonacci typography: text-[34px] */}
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[34px] text-center">
            Explore Properties by City
          </h2>
          {/* Fibonacci grid: 6 columns with gap-[21px] */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[13px] lg:gap-[21px]">
            {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'].map((city) => (
              <Link
                key={city}
                href={`/properties?city=${encodeURIComponent(city)}`}
                className="bg-slate-50 hover:bg-cyan-50 p-[21px] rounded-xl text-center transition border-2 border-gray-200 hover:border-cyan-600 group"
              >
                <h3 className="font-semibold text-gray-900 text-[16px] mb-[8px] group-hover:text-cyan-600 transition">{city}</h3>
                <p className="text-[13px] text-gray-600">
                  {propertyCounts.find(c => c.city === city)?._count || 0} Properties
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Properties - Fibonacci spacing: py-[55px] */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px]">
        <div className="flex justify-between items-center mb-[34px]">
          {/* Fibonacci typography: text-[34px] */}
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900">Featured Properties</h2>
          <Link href="/properties" className="text-cyan-700 hover:text-cyan-700 font-medium text-[16px] flex items-center gap-[8px]">
            View All <FaArrowRight className="text-[13px]" />
          </Link>
        </div>
        {/* Fibonacci grid: 3 columns with gap-[21px] */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>

      {/* Ad placement between content sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot />
      </div>

      {/* Free Tools - drives calculator traffic (SEO + AdSense pages) */}
      <div className="bg-white py-[55px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-[34px]">
            <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900">
              Free Property Tools
            </h2>
            <Link href="/tools" className="text-cyan-700 hover:text-cyan-700 font-medium text-[16px] flex items-center gap-[8px]">
              All Tools <FaArrowRight className="text-[13px]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[13px] lg:gap-[21px]">
            <Link href="/tools/mortgage-calculator" className="bg-slate-50 p-[21px] rounded-xl border-2 border-gray-200 hover:border-cyan-600 hover:bg-cyan-50 transition text-center group">
              <FaCalculator className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <p className="text-[15px] font-semibold">Home Loan Calculator</p>
            </Link>
            <Link href="/tools/area-converter" className="bg-slate-50 p-[21px] rounded-xl border-2 border-gray-200 hover:border-cyan-600 hover:bg-cyan-50 transition text-center group">
              <FaRulerCombined className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <p className="text-[15px] font-semibold">Marla Converter</p>
            </Link>
            <Link href="/tools/construction-cost-calculator" className="bg-slate-50 p-[21px] rounded-xl border-2 border-gray-200 hover:border-cyan-600 hover:bg-cyan-50 transition text-center group">
              <FaHardHat className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <p className="text-[15px] font-semibold">Construction Cost</p>
            </Link>
            <Link href="/tools/property-tax-calculator" className="bg-slate-50 p-[21px] rounded-xl border-2 border-gray-200 hover:border-cyan-600 hover:bg-cyan-50 transition text-center group">
              <FaFileInvoiceDollar className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <p className="text-[15px] font-semibold">Property Tax</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Guides - content marketing & SEO */}
      <div className="bg-slate-50 py-[55px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-[34px]">
            <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 flex items-center gap-[13px]">
              <FaBookOpen className="text-cyan-600" /> Property Guides
            </h2>
            <Link href="/guides" className="text-cyan-700 hover:text-cyan-700 font-medium text-[16px] flex items-center gap-[8px]">
              All Guides <FaArrowRight className="text-[13px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
            {GUIDES.slice(0, 6).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={getGuideCover(guide.slug, guide.category)}
                    alt={guide.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-[13px] left-[13px] bg-white/90 backdrop-blur text-cyan-700 text-[12px] font-bold px-[13px] py-[5px] rounded-full shadow">
                    {guide.category}
                  </span>
                </div>
                <div className="p-[21px] flex flex-col flex-grow">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-[8px] group-hover:text-cyan-700 transition leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-[13px] text-gray-600 mb-[13px] flex-grow line-clamp-2">{guide.description}</p>
                  <span className="flex items-center gap-[5px] text-[13px] text-gray-500">
                    <FaClock /> {guide.readTimeMinutes} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Property Types - Fibonacci spacing: py-[55px] */}
      <div className="bg-slate-100 py-[55px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fibonacci typography: text-[34px] */}
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[34px] text-center">
            Browse by Property Type
          </h2>
          {/* Fibonacci grid: 4 columns (not Fibonacci but balanced) with gap-[21px] */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[21px]">
            <Link href="/properties?type=HOUSE" className="bg-white p-[34px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
              <FaHome className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[16px]">Houses</h3>
            </Link>
            <Link href="/properties?type=FLAT" className="bg-white p-[34px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
              <FaBuilding className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[16px]">Flats</h3>
            </Link>
            <Link href="/properties?type=RESIDENTIAL_PLOT" className="bg-white p-[34px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
              <FaMapMarkedAlt className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[16px]">Residential Plots</h3>
            </Link>
            <Link href="/properties?type=OFFICE" className="bg-white p-[34px] rounded-xl shadow-md hover:shadow-xl transition text-center group">
              <FaStore className="text-[34px] text-cyan-600 mx-auto mb-[13px] group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[16px]">Commercial</h3>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Agents Section - Fibonacci spacing: py-[89px] */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-[55px] lg:py-[89px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Fibonacci typography: text-[55px] */}
          <div className="text-center mb-[55px]">
            <h2 className="text-[34px] lg:text-[55px] font-bold text-gray-900 mb-[21px] leading-tight">
              Meet Our Top-Rated Agents
            </h2>
            <p className="text-[16px] lg:text-[21px] text-gray-600 max-w-3xl mx-auto">
              Connect with experienced real estate professionals who will help you find your dream property
            </p>
          </div>

          {/* Agents Grid - Fibonacci spacing: gap-[21px] */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px] mb-[55px]">
            {featuredAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-white rounded-2xl shadow-lg p-[34px] hover:shadow-xl transition-shadow group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Agent Avatar */}
                  <div className="relative mb-[21px]">
                    <div className="w-[89px] h-[89px] rounded-full overflow-hidden bg-gray-200 border-4 border-cyan-100 group-hover:border-cyan-200 transition">
                      {agent.user.avatar ? (
                        <img
                          src={agent.user.avatar}
                          alt={`${agent.user.firstName} ${agent.user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-700 to-cyan-800">
                          <FaUserTie className="text-[34px] text-white" />
                        </div>
                      )}
                    </div>
                    {/* Verified Badge */}
                    <div className="absolute -bottom-[8px] -right-[8px] bg-cyan-700 rounded-full p-[8px]">
                      <FaCheckCircle className="text-[16px] text-white" />
                    </div>
                  </div>

                  {/* Agent Info */}
                  <h3 className="text-[21px] font-bold text-gray-900 mb-[8px]">
                    {agent.user.firstName} {agent.user.lastName}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-[8px] mb-[13px]">
                    <div className="flex items-center gap-[4px]">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-[13px] ${
                            i < Math.floor(agent.rating)
                              ? 'text-copper-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[16px] font-semibold text-gray-900">
                      {agent.rating.toFixed(1)}
                    </span>
                    <span className="text-[13px] text-gray-500">
                      ({agent.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-[21px] mb-[21px]">
                    <div className="text-center">
                      <div className="text-[21px] font-bold text-cyan-600">
                        {agent._count.properties}
                      </div>
                      <div className="text-[13px] text-gray-500">Listings</div>
                    </div>
                    <div className="w-[1px] h-[34px] bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-[21px] font-bold text-cyan-600">
                        <FaAward className="inline text-[21px]" />
                      </div>
                      <div className="text-[13px] text-gray-500">Top Rated</div>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <div className="w-full">
                    <div className="inline-flex items-center gap-[8px] text-cyan-600 font-semibold text-[16px] group-hover:gap-[13px] transition-all">
                      <FaPhone className="text-[13px]" />
                      Contact Agent
                      <FaArrowRight className="text-[13px]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Section - Fibonacci spacing */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl shadow-lg p-[34px] lg:p-[55px] text-center text-white">
            <h3 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
              Looking for an Agent?
            </h3>
            <p className="text-[16px] lg:text-[21px] text-slate-300 mb-[34px] max-w-2xl mx-auto">
              Browse our complete directory of verified real estate agents across Pakistan
            </p>
            <Link
              href="/agents"
              className="inline-flex items-center gap-[13px] bg-white text-slate-900 px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition text-[16px]"
            >
              View All Agents <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section - Fibonacci spacing: py-[89px] and typography */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white py-[55px] lg:py-[89px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fibonacci grid: 4 columns with gap-[34px] */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[21px] lg:gap-[34px] text-center">
            <div>
              {/* Fibonacci typography: text-[55px] */}
              <div className="text-[34px] lg:text-[55px] font-bold mb-[13px]">10+</div>
              <div className="text-slate-300 text-[16px]">Properties Listed</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[13px]">3</div>
              <div className="text-slate-300 text-[16px]">Expert Agents</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[13px]">5+</div>
              <div className="text-slate-300 text-[16px]">Cities Covered</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[13px]">PKR 500M+</div>
              <div className="text-slate-300 text-[16px]">Properties Value</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
