import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { FaCheck, FaStar, FaCheckCircle, FaWhatsapp, FaEnvelope, FaArrowRight } from 'react-icons/fa'

// ─── Update these once payment accounts are ready ───────────────────────────
const CONTACT_EMAIL = 'info@medaghar.com'
// Set to e.g. '923001234567' (country code, no +) to activate WhatsApp buttons
const WHATSAPP_NUMBER = ''
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Pricing — Featured Listings & Agent Plans | MedaGhar',
  description:
    'List property free on MedaGhar. Boost results with Featured Listings, the Verified badge, and Agent Pro plans. Pay easily via JazzCash, Easypaisa or bank transfer.',
  alternates: { canonical: 'https://medaghar.com/pricing' },
  openGraph: {
    title: 'Pricing — Featured Listings & Agent Plans | MedaGhar',
    description:
      'Free listings for everyone. Featured listings, verified badges and agent plans for those who want more leads.',
    url: 'https://medaghar.com/pricing',
    type: 'website',
  },
}

const FAQS = [
  {
    question: 'Is listing my property on MedaGhar really free?',
    answer:
      'Yes. Every owner can post listings completely free, with photos, map location and direct contact from buyers and tenants. Paid options only exist to give your listing extra visibility — they are never required.',
  },
  {
    question: 'How do I pay for a Featured Listing or Agent Pro?',
    answer:
      'We currently accept JazzCash, Easypaisa and direct bank transfer. Contact us via email or WhatsApp with your listing link, make the payment, and your listing is upgraded within a few hours of confirmation.',
  },
  {
    question: 'What does the Verified badge mean?',
    answer:
      'Our team confirms the listing details with the owner and cross-checks the basic documents before granting the green Verified badge. Verified listings stand out in search results and earn more trust from serious buyers.',
  },
  {
    question: 'What extra do agents get with Agent Pro?',
    answer:
      'Agent Pro increases your active listing quota, gives you a public agent profile with reviews, priority placement in the agent directory, and a monthly bundle of featured slots.',
  },
]

export default function PricingPage() {
  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi MedaGhar, I want to feature my listing.')}`
    : null

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Pricing', path: '/pricing' },
          ]),
          faqJsonLd(FAQS),
        ]}
      />

      {/* Hero with photo */}
      <div className="relative text-white overflow-hidden">
        <Image
          src="/images/keys-handover.jpg"
          alt="Featured property listings on MedaGhar"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-800/75" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] text-center">
          <h1 className="text-[26px] lg:text-[34px] font-bold mb-[13px]">
            Simple Pricing — Listing is Always Free
          </h1>
          <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mx-auto">
            Post unlimited-quality listings for free. Want more calls? Boost with a Featured
            Listing, a Verified badge or an Agent Pro plan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[34px]">
        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[21px] mb-[55px]">
          {/* Free */}
          <div className="bg-white rounded-2xl shadow-md p-[34px] flex flex-col">
            <h2 className="text-[21px] font-bold text-gray-900 mb-[8px]">Free Listing</h2>
            <div className="text-[34px] font-bold text-gray-900 mb-[3px]">PKR 0</div>
            <div className="text-[13px] text-gray-500 mb-[21px]">forever</div>
            <ul className="space-y-[13px] text-[14px] text-gray-700 flex-grow">
              {[
                'Up to 2 active listings',
                'Photos, map & full details',
                'Direct messages from buyers',
                'Listing shared in city pages',
                'Edit or remove anytime',
              ].map((f) => (
                <li key={f} className="flex items-start gap-[8px]">
                  <FaCheck className="text-cyan-600 mt-[3px] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sell"
              className="mt-[21px] block text-center bg-slate-100 text-gray-800 py-[13px] rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Post Free Listing
            </Link>
          </div>

          {/* Featured */}
          <div className="bg-white rounded-2xl shadow-xl p-[34px] flex flex-col border-2 border-copper-400 relative">
            <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-copper-500 text-white text-[12px] font-bold px-[13px] py-[5px] rounded-full whitespace-nowrap">
              MOST POPULAR
            </span>
            <h2 className="text-[21px] font-bold text-gray-900 mb-[8px] flex items-center gap-[8px]">
              <FaStar className="text-copper-500" /> Featured Listing
            </h2>
            <div className="text-[34px] font-bold text-gray-900 mb-[3px]">PKR 1,500</div>
            <div className="text-[13px] text-gray-500 mb-[21px]">per listing / 30 days</div>
            <ul className="space-y-[13px] text-[14px] text-gray-700 flex-grow">
              {[
                'Top position on homepage',
                'First in search & city pages',
                'Eye-catching ★ Featured badge',
                'Up to 5× more views & calls',
                'Everything in Free included',
              ].map((f) => (
                <li key={f} className="flex items-start gap-[8px]">
                  <FaCheck className="text-copper-500 mt-[3px] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a
              href={whatsappHref || `mailto:${CONTACT_EMAIL}?subject=Feature my listing`}
              className="mt-[21px] block text-center bg-copper-500 text-white py-[13px] rounded-xl font-semibold hover:bg-copper-600 transition"
            >
              Feature My Listing
            </a>
          </div>

          {/* Agent Pro */}
          <div className="bg-white rounded-2xl shadow-md p-[34px] flex flex-col">
            <h2 className="text-[21px] font-bold text-gray-900 mb-[8px] flex items-center gap-[8px]">
              <FaCheckCircle className="text-cyan-600" /> Agent Pro
            </h2>
            <div className="text-[34px] font-bold text-gray-900 mb-[3px]">PKR 5,000</div>
            <div className="text-[13px] text-gray-500 mb-[21px]">per month</div>
            <ul className="space-y-[13px] text-[14px] text-gray-700 flex-grow">
              {[
                '10 active listings (sale + rent)',
                'Public agent profile with reviews',
                'Priority spot in Agents directory',
                '2 Featured slots included monthly',
                'Verified Agent badge',
                'Buyer leads for your city',
              ].map((f) => (
                <li key={f} className="flex items-start gap-[8px]">
                  <FaCheck className="text-cyan-600 mt-[3px] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a
              href={whatsappHref || `mailto:${CONTACT_EMAIL}?subject=Agent Pro plan`}
              className="mt-[21px] block text-center bg-cyan-700 text-white py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              Become Agent Pro
            </a>
          </div>
        </div>

        {/* Verified badge add-on */}
        <div className="bg-white rounded-2xl shadow-md p-[34px] mb-[55px] flex flex-col md:flex-row items-center gap-[21px]">
          <div className="flex-grow">
            <h2 className="text-[21px] font-bold text-gray-900 mb-[8px] flex items-center gap-[8px]">
              <FaCheckCircle className="text-cyan-600" /> Verified Badge — PKR 1,000 per listing
            </h2>
            <p className="text-[14px] text-gray-600">
              Our team confirms your listing details and basic ownership documents, then adds the
              green <strong>✓ Verified</strong> badge. Verified listings earn more trust and more
              serious enquiries — especially from overseas Pakistanis buying remotely.
            </p>
          </div>
          <a
            href={whatsappHref || `mailto:${CONTACT_EMAIL}?subject=Verify my listing`}
            className="bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition whitespace-nowrap"
          >
            Get Verified
          </a>
        </div>

        {/* How to pay */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 rounded-2xl p-[34px] text-white mb-[55px]">
          <h2 className="text-[21px] lg:text-[26px] font-bold mb-[13px]">How to Pay</h2>
          <ol className="space-y-[8px] text-slate-200 text-[15px] list-decimal ml-[21px] mb-[21px]">
            <li>Contact us with your listing link and the package you want.</li>
            <li>We send you our JazzCash / Easypaisa / bank account details.</li>
            <li>Send the payment and share the receipt screenshot.</li>
            <li>Your listing is upgraded within a few hours — confirmation by email.</li>
          </ol>
          <div className="flex flex-wrap gap-[13px]">
            {whatsappHref && (
              <a
                href={whatsappHref}
                className="inline-flex items-center gap-[8px] bg-white text-slate-900 px-[21px] py-[13px] rounded-xl font-semibold hover:bg-cyan-50 transition"
              >
                <FaWhatsapp className="text-[19px]" /> WhatsApp Us
              </a>
            )}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-[8px] bg-cyan-700 text-white px-[21px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              <FaEnvelope /> {CONTACT_EMAIL}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-[8px] bg-cyan-700 text-white px-[21px] py-[13px] rounded-xl font-semibold hover:bg-cyan-800 transition"
            >
              Contact Form <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <section className="bg-white rounded-2xl shadow-md p-[21px] lg:p-[34px]">
          <h2 className="text-[21px] font-bold text-gray-900 mb-[21px]">Frequently Asked Questions</h2>
          <div className="space-y-[21px]">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-[21px] last:border-0 last:pb-0">
                <h3 className="text-[16px] font-semibold text-gray-900 mb-[8px]">{faq.question}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
