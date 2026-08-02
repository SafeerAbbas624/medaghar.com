import { FaShieldAlt, FaLock, FaUserShield, FaDatabase, FaCookie, FaEnvelope } from 'react-icons/fa'
import HeroBg from '@/components/HeroBg'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-[55px] lg:py-[89px]">
        <HeroBg src="/images/cities/city-skyline-2.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaShieldAlt className="text-[55px] lg:text-[89px] mx-auto mb-[21px] opacity-90" />
            <h1 className="text-[34px] sm:text-[55px] lg:text-[68px] font-bold mb-[21px]">
              Privacy Policy
            </h1>
            <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we protect your data.
            </p>
            <p className="text-[13px] text-slate-400 mt-[13px]">
              Last Updated: January 1, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Introduction
          </h2>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            MedaGhar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            By using MedaGhar, you agree to the collection and use of information in accordance with this policy.
            If you do not agree with our policies and practices, please do not use our services.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaDatabase className="text-[21px] text-cyan-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              Information We Collect
            </h2>
          </div>
          
          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px] mt-[21px]">Personal Information</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] mb-[21px] ml-[21px]">
            <li>Register for an account</li>
            <li>List a property for sale or rent</li>
            <li>Contact agents or property owners</li>
            <li>Subscribe to our newsletter</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            This information may include:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px]">
            <li>Name and contact information (email, phone number, address)</li>
            <li>Account credentials (username, password)</li>
            <li>Property details and preferences</li>
            <li>Payment information (processed securely through third-party providers)</li>
            <li>Communication records and messages</li>
          </ul>

          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px] mt-[21px]">Automatically Collected Information</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            When you visit our website, we automatically collect certain information about your device and browsing activity:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px]">
            <li>IP address and location data</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>Search queries and property views</li>
          </ul>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaUserShield className="text-[21px] text-cyan-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              How We Use Your Information
            </h2>
          </div>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px]">
            <li>Provide, operate, and maintain our services</li>
            <li>Process your property listings and transactions</li>
            <li>Connect you with agents and property owners</li>
            <li>Send you property alerts and saved search notifications</li>
            <li>Improve and personalize your experience</li>
            <li>Analyze usage patterns and trends</li>
            <li>Prevent fraud and enhance security</li>
            <li>Communicate with you about updates and promotions</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        {/* Cookies and Tracking */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaCookie className="text-[21px] text-cyan-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              Cookies and Tracking Technologies
            </h2>
          </div>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            We use cookies and similar tracking technologies to track activity on our website and store certain information. 
            Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
            if you do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaLock className="text-[21px] text-cyan-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              Data Security
            </h2>
          </div>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            We implement appropriate technical and organizational security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px]">
            <li>Encryption of sensitive data</li>
            <li>Secure server infrastructure</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Employee training on data protection</li>
          </ul>
          <p className="text-[16px] text-gray-700 leading-relaxed mt-[13px]">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive 
            to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Your Privacy Rights
          </h2>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px]">
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Opt-out of marketing communications</li>
          </ul>
          <p className="text-[16px] text-gray-700 leading-relaxed mt-[13px]">
            To exercise these rights, please contact us at privacy@medaghar.pk
          </p>
        </div>

        {/* Contact Us */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl shadow-lg p-[34px] text-white">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-white/20 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaEnvelope className="text-[21px] text-white" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold">
              Contact Us
            </h2>
          </div>
          
          <p className="text-[16px] leading-relaxed mb-[13px]">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="text-[16px] space-y-[8px]">
            <li><strong>Email:</strong> privacy@medaghar.pk</li>
            <li><strong>Phone:</strong> +92 51 555 5555</li>
            <li><strong>Address:</strong> Blue Area, Islamabad, Pakistan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

