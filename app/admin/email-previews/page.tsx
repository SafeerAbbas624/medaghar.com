import type { Metadata } from 'next'
import {
  generateVerificationEmail,
  generateWelcomeEmail,
} from '@/lib/email-templates'
import {
  generateEnquiryEmail,
  generateListingLiveEmail,
  generateStaleListingEmail,
  generateTourRequestEmail,
} from '@/lib/email/notifications'

export const metadata: Metadata = {
  title: 'Email previews',
  robots: { index: false, follow: false },
}

/**
 * Renders every transactional email with sample data.
 *
 * Outbound mail is currently refused by the host (554, disabled in hPanel),
 * so there is no way to check a template by sending one to yourself. Each is
 * rendered into an iframe here instead — same HTML the mail server would
 * receive.
 *
 * Behind /admin, which middleware gates on the admin-token cookie.
 */
const PREVIEWS: { name: string; note: string; html: string }[] = [
  {
    name: 'Verification code',
    note: 'Sent on credentials signup. OAuth users never see this — their email is already trusted by the provider.',
    html: generateVerificationEmail({ firstName: 'Safeer', verificationCode: '482913' }),
  },
  {
    name: 'Welcome',
    note: 'Sent once the account is usable: after code verification, or immediately on Google/Facebook signup.',
    html: generateWelcomeEmail({ firstName: 'Safeer', role: 'SELLER' }),
  },
  {
    name: 'Welcome (agent)',
    note: 'Same template, agent allowance. Both read from the shared quota table.',
    html: generateWelcomeEmail({ firstName: 'Safeer', role: 'AGENT' }),
  },
  {
    name: 'New enquiry',
    note: 'Wired: sent to a seller when someone messages them about a listing.',
    html: generateEnquiryEmail({
      ownerFirstName: 'Safeer',
      senderName: 'Ahmed Khan',
      propertyTitle: '1 Kanal House for Sale in DHA Phase 6, Lahore',
      propertySlug: '1-kanal-house-for-sale-in-phase-6-dha-defence-lahore-9l98',
      message:
        'Assalam o alaikum, is this still available? I can visit this weekend.\nAlso, is the price negotiable?',
    }),
  },
  {
    name: 'Listing is live',
    note: 'Wired: sent on successful listing creation. Nudges for more photos when there are fewer than five.',
    html: generateListingLiveEmail({
      firstName: 'Safeer',
      propertyTitle: '10 Marla House for Sale in Bahria Town, Lahore',
      propertySlug: '10-marla-house-for-sale-in-bahria-town-lahore-a1b2',
      price: 32500000,
      forRent: false,
      imageCount: 3,
    }),
  },
  {
    name: 'Still available?',
    note: 'NOT YET WIRED. Needs a scheduled job. The highest-value one — sold listings nobody marks sold are what makes buyers stop trusting a portal.',
    html: generateStaleListingEmail({
      firstName: 'Safeer',
      propertyTitle: '5 Marla House for Sale in Johar Town, Lahore',
      propertySlug: '5-marla-house-for-sale-in-johar-town-lahore-c3d4',
      daysLive: 45,
      forRent: false,
    }),
  },
  {
    name: 'Viewing request',
    note: 'NOT YET WIRED. Sent when a TourRequest is created.',
    html: generateTourRequestEmail({
      ownerFirstName: 'Safeer',
      requesterName: 'Fatima Ali',
      propertyTitle: '3 Bed Apartment for Rent in Clifton, Karachi',
      propertySlug: '3-bed-apartment-for-rent-in-clifton-karachi-e5f6',
      preferredDate: 'Saturday 8 August, afternoon',
      note: 'I would like to see the parking and the water arrangement.',
    }),
  },
]

export default function EmailPreviewsPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-[34px]">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-[26px] font-bold text-gray-900 mb-[8px]">Email previews</h1>
        <p className="text-[15px] text-gray-600 mb-[13px]">
          Every transactional template, rendered with sample data — the same HTML the mail
          server would receive.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-[16px] mb-[34px] text-[14px] text-amber-900">
          <strong>Sending is currently disabled at the host.</strong> Outbound mail is refused
          with <code>554 5.7.1 Disabled by user from hPanel</code>, so none of these will
          actually arrive until SMTP is re-enabled in hPanel.
        </div>

        <div className="space-y-[34px]">
          {PREVIEWS.map((p) => (
            <section key={p.name} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-[21px] py-[16px] border-b border-gray-200">
                <h2 className="text-[18px] font-bold text-gray-900">{p.name}</h2>
                <p className="text-[13px] text-gray-500 mt-[4px]">{p.note}</p>
              </div>
              <iframe
                title={p.name}
                srcDoc={p.html}
                className="w-full h-[820px] border-0 bg-slate-50"
              />
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
