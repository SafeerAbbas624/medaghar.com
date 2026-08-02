import { FaHome, FaUsers, FaChartLine, FaHandshake, FaAward, FaMapMarkedAlt } from 'react-icons/fa'
import HeroBg from '@/components/HeroBg'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-[55px] lg:py-[89px]">
        <HeroBg src="/images/cities/city-skyline-1.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-[34px] sm:text-[55px] lg:text-[68px] font-bold mb-[21px]">
              About MedaGhar
            </h1>
            <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mx-auto">
              Pakistan's Most Trusted Property Portal - Connecting Dreams with Reality
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
        {/* Our Story */}
        <div className="mb-[55px] lg:mb-[89px]">
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[21px] text-center">
            Our Story
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-[16px] text-gray-700 mb-[21px] leading-relaxed">
              Founded with a vision to revolutionize Pakistan's real estate market, MedaGhar has grown to become
              the nation's most trusted property portal. We understand that buying, selling, or renting a property
              is one of the most important decisions in a person's life, and we're here to make that journey smooth,
              transparent, and successful.
            </p>
            <p className="text-[16px] text-gray-700 mb-[21px] leading-relaxed">
              From the bustling streets of Karachi to the scenic valleys of Islamabad, from the cultural heart of 
              Lahore to the emerging markets of Faisalabad and Multan, we connect millions of Pakistanis with their 
              dream properties every day.
            </p>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              Our platform combines cutting-edge technology with deep local market knowledge, offering comprehensive 
              property listings, virtual tours, market insights, and expert guidance to help you make informed decisions.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-[34px] mb-[55px] lg:mb-[89px]">
          <div className="bg-white p-[34px] rounded-2xl shadow-lg">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[21px]">
              <FaChartLine className="text-[21px] text-cyan-600" />
            </div>
            <h3 className="text-[21px] font-bold text-gray-900 mb-[13px]">Our Mission</h3>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              To empower every Pakistani with the tools, information, and confidence to make the best real estate
              decisions. We strive to bring transparency, efficiency, and trust to Pakistan's property market.
            </p>
          </div>
          <div className="bg-white p-[34px] rounded-2xl shadow-lg">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[21px]">
              <FaAward className="text-[21px] text-cyan-600" />
            </div>
            <h3 className="text-[21px] font-bold text-gray-900 mb-[13px]">Our Vision</h3>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              To be the most trusted and innovative real estate platform in Pakistan, setting new standards for 
              customer service, technology, and market intelligence while contributing to the nation's economic growth.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-[55px] lg:mb-[89px]">
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[34px] text-center">
            Why Choose MedaGhar
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[21px]">
            <div className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[13px]">
                <FaHome className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-[8px]">Extensive Listings</h3>
              <p className="text-[13px] text-gray-600">
                Thousands of verified properties across all major cities of Pakistan
              </p>
            </div>
            <div className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[13px]">
                <FaMapMarkedAlt className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-[8px]">Interactive Maps</h3>
              <p className="text-[13px] text-gray-600">
                Explore properties with detailed maps and neighborhood information
              </p>
            </div>
            <div className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[13px]">
                <FaUsers className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-[8px]">Expert Agents</h3>
              <p className="text-[13px] text-gray-600">
                Connect with verified real estate professionals across Pakistan
              </p>
            </div>
            <div className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[13px]">
                <FaChartLine className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-[8px]">Market Insights</h3>
              <p className="text-[13px] text-gray-600">
                Real-time data and trends to help you make informed decisions
              </p>
            </div>
            <div className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[13px]">
                <FaHandshake className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-[8px]">Trusted Platform</h3>
              <p className="text-[13px] text-gray-600">
                Verified listings and secure transactions for peace of mind
              </p>
            </div>
            <div className="bg-white p-[21px] rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[13px]">
                <FaAward className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-[8px]">Award Winning</h3>
              <p className="text-[13px] text-gray-600">
                Recognized as Pakistan's leading property portal
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-[34px] lg:p-[55px] text-white">
          <h2 className="text-[26px] lg:text-[34px] font-bold mb-[34px] text-center">
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[21px] text-center">
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">1M+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Properties Listed</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">5M+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Monthly Visitors</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">10K+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Verified Agents</div>
            </div>
            <div>
              <div className="text-[34px] lg:text-[55px] font-bold mb-[8px]">50+</div>
              <div className="text-[13px] lg:text-[16px] text-slate-300">Cities Covered</div>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="mt-[55px] lg:mt-[89px] text-center max-w-4xl mx-auto">
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[21px]">
            Our Commitment to You
          </h2>
          <p className="text-[16px] text-gray-700 mb-[21px] leading-relaxed">
            At MedaGhar, we're committed to providing you with the most accurate, up-to-date property information
            and the best user experience. Our team works tirelessly to verify listings, update market data, and
            improve our platform to serve you better.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            Whether you're a first-time buyer, seasoned investor, property seller, or renter, we're here to support 
            you every step of the way. Your trust is our greatest asset, and we're dedicated to earning it every day.
          </p>
        </div>
      </div>
    </div>
  )
}

