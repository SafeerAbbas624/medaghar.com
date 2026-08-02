import { FaFileContract, FaGavel, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import HeroBg from '@/components/HeroBg'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-[55px] lg:py-[89px]">
        <HeroBg src="/images/cities/city-skyline-2.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaFileContract className="text-[55px] lg:text-[89px] mx-auto mb-[21px] opacity-90" />
            <h1 className="text-[34px] sm:text-[55px] lg:text-[68px] font-bold mb-[21px]">
              Terms of Service
            </h1>
            <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mx-auto">
              Please read these terms carefully before using our services
            </p>
            <p className="text-[13px] text-slate-400 mt-[13px]">
              Last Updated: January 1, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
        {/* Agreement to Terms */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Agreement to Terms
          </h2>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            These Terms of Service ("Terms") constitute a legally binding agreement between you and MedaGhar
            ("Company," "we," "us," or "our") concerning your access to and use of the MedaGhar website and services.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part 
            of these Terms, you may not access our services.
          </p>
        </div>

        {/* Use of Services */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-[21px] text-cyan-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              Use of Our Services
            </h2>
          </div>
          
          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px] mt-[21px]">Eligibility</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[21px]">
            You must be at least 18 years old to use our services. By using MedaGhar, you represent and warrant
            that you meet this age requirement and have the legal capacity to enter into these Terms.
          </p>

          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px]">Account Registration</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            To access certain features, you may need to register for an account. You agree to:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px] mb-[21px]">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px]">Acceptable Use</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            You agree to use our services only for lawful purposes and in accordance with these Terms. You agree NOT to:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px]">
            <li>Post false, misleading, or fraudulent property listings</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit viruses or malicious code</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Scrape or collect data without permission</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with the proper functioning of our services</li>
          </ul>
        </div>

        {/* Property Listings */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Property Listings
          </h2>
          
          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px]">Listing Requirements</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            If you list a property on MedaGhar, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside text-[16px] text-gray-700 space-y-[8px] ml-[21px] mb-[21px]">
            <li>You have the legal right to list the property</li>
            <li>All information provided is accurate and truthful</li>
            <li>The property complies with all applicable laws</li>
            <li>You have proper authorization to use all photos and content</li>
            <li>The listing does not violate any third-party rights</li>
          </ul>

          <h3 className="text-[16px] font-bold text-gray-900 mb-[13px]">Listing Removal</h3>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            We reserve the right to remove any listing that violates these Terms, is reported as fraudulent, 
            or is deemed inappropriate at our sole discretion.
          </p>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Intellectual Property Rights
          </h2>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            The MedaGhar website, including all content, features, and functionality, is owned by MedaGhar and
            is protected by Pakistani and international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit any 
            content from our services without our express written permission.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            By submitting content to MedaGhar, you grant us a worldwide, non-exclusive, royalty-free license to
            use, reproduce, modify, and display such content in connection with our services.
          </p>
        </div>

        {/* Disclaimers */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-copper-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle className="text-[21px] text-copper-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              Disclaimers
            </h2>
          </div>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            <strong>No Warranty:</strong> Our services are provided "AS IS" and "AS AVAILABLE" without warranties 
            of any kind, either express or implied.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            <strong>Third-Party Content:</strong> We do not verify the accuracy of property listings or user-generated 
            content. You are responsible for conducting your own due diligence.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            <strong>Not a Real Estate Agent:</strong> MedaGhar is a platform that connects buyers, sellers, and
            agents. We are not a real estate broker or agent and do not participate in transactions.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            <strong>Market Data:</strong> Property values, market insights, and estimates are for informational 
            purposes only and should not be relied upon as professional advice.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <div className="flex items-center gap-[13px] mb-[21px]">
            <div className="bg-red-100 w-[55px] h-[55px] rounded-full flex items-center justify-center flex-shrink-0">
              <FaGavel className="text-[21px] text-red-600" />
            </div>
            <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900">
              Limitation of Liability
            </h2>
          </div>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            To the maximum extent permitted by Pakistani law, MedaGhar and its affiliates, officers, employees,
            and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of our services.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            Our total liability to you for all claims arising from your use of our services shall not exceed the 
            amount you paid to us in the twelve (12) months preceding the claim, or PKR 10,000, whichever is greater.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Governing Law and Jurisdiction
          </h2>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, 
            without regard to its conflict of law provisions.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            Any disputes arising from these Terms or your use of our services shall be subject to the exclusive 
            jurisdiction of the courts in Islamabad, Pakistan.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-2xl shadow-lg p-[34px] mb-[34px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">
            Changes to These Terms
          </h2>
          
          <p className="text-[16px] text-gray-700 leading-relaxed mb-[13px]">
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting 
            the new Terms on this page and updating the "Last Updated" date.
          </p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            Your continued use of our services after any changes constitutes acceptance of the new Terms.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl shadow-lg p-[34px] text-white">
          <h2 className="text-[21px] lg:text-[26px] font-bold mb-[21px]">
            Contact Us
          </h2>
          
          <p className="text-[16px] leading-relaxed mb-[13px]">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul className="text-[16px] space-y-[8px]">
            <li><strong>Email:</strong> legal@medaghar.pk</li>
            <li><strong>Phone:</strong> +92 51 555 5555</li>
            <li><strong>Address:</strong> Blue Area, Islamabad, Pakistan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

