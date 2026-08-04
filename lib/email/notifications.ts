/**
 * Transactional emails driven by activity on a listing.
 *
 * These are the messages that make the marketplace work: a seller who never
 * hears that someone enquired has no reason to come back, and a listing that
 * is quietly sold months ago poisons the search results for everyone.
 *
 * All of them are one-to-one responses to something the recipient's own
 * account did — no marketing sends, no lists.
 */

import { layout, textFooter, esc, pkr, SITE } from './shell'

export interface EnquiryEmailData {
  /** Listing owner. */
  ownerFirstName: string
  senderName: string
  /** Free text the enquirer typed. */
  message: string
  propertyTitle: string
  propertySlug: string
}

/** Someone has messaged a seller about their listing. */
export function generateEnquiryEmail(d: EnquiryEmailData): string {
  return layout(
    'New enquiry on your listing',
    `      <h2>You have a new enquiry</h2>

      <p><strong>${esc(d.senderName)}</strong> has messaged you about your listing.</p>

      <div class="card">
        <strong>${esc(d.propertyTitle)}</strong><br />
        <a href="${SITE}/properties/${esc(d.propertySlug)}">View the listing</a>
      </div>

      <div class="panel">
        ${esc(d.message).replace(/\n/g, '<br />')}
      </div>

      <p style="text-align:center; margin-top:24px;">
        <a href="${SITE}/messages" class="cta">Reply in your inbox</a>
      </p>

      <p class="muted" style="margin-top:24px;">
        Enquiries go stale quickly — most buyers in Pakistan contact several
        sellers the same day. Replying within the hour makes a real difference.
      </p>`,
    'You are receiving this because someone enquired about a property you listed.'
  )
}

export function generateEnquiryEmailText(d: EnquiryEmailData): string {
  return `You have a new enquiry

${d.senderName} has messaged you about your listing: ${d.propertyTitle}

"${d.message}"

Reply in your inbox: ${SITE}/messages
View the listing: ${SITE}/properties/${d.propertySlug}
${textFooter()}`
}

export interface ListingLiveEmailData {
  firstName: string
  propertyTitle: string
  propertySlug: string
  price: number
  forRent: boolean
  /** Photos on the listing, so we can nudge if it is thin. */
  imageCount: number
}

/** A listing has gone live. */
export function generateListingLiveEmail(d: ListingLiveEmailData): string {
  const thin = d.imageCount < 5
  return layout(
    'Your listing is live',
    `      <h2>Your listing is live</h2>

      <p>Hello ${esc(d.firstName)}, your property is now visible on MedaGhar and can be found in search.</p>

      <div class="card">
        <strong>${esc(d.propertyTitle)}</strong><br />
        ${pkr(d.price, d.forRent)}<br />
        <a href="${SITE}/properties/${esc(d.propertySlug)}">View your listing</a>
      </div>

      ${
        thin
          ? `<div class="warn">
        Your listing has ${d.imageCount} ${d.imageCount === 1 ? 'photo' : 'photos'}. Listings with
        five or more get noticeably more enquiries — buyers skip past the ones they cannot see
        properly. <a href="${SITE}/dashboard">Add a few more</a> while it is fresh.
      </div>`
          : ''
      }

      <p><strong>What happens next:</strong></p>
      <ol class="steps">
        <li>Buyers contact you directly — we never take a commission or sit in the middle.</li>
        <li>Enquiries arrive in <a href="${SITE}/messages">your inbox</a> and by email.</li>
        <li>When it sells or lets, mark it so from your dashboard to free the slot.</li>
      </ol>

      <p style="text-align:center; margin-top:24px;">
        <a href="${SITE}/dashboard" class="cta">Manage your listings</a>
      </p>`,
    'You are receiving this because you posted a listing on MedaGhar.'
  )
}

export function generateListingLiveEmailText(d: ListingLiveEmailData): string {
  return `Your listing is live

Hello ${d.firstName}, your property is now visible on MedaGhar.

${d.propertyTitle}
${pkr(d.price, d.forRent)}
${SITE}/properties/${d.propertySlug}
${d.imageCount < 5 ? `\nYour listing has ${d.imageCount} photo(s). Listings with five or more get noticeably more enquiries.\n` : ''}
Manage your listings: ${SITE}/dashboard
${textFooter()}`
}

export interface StaleListingEmailData {
  firstName: string
  propertyTitle: string
  propertySlug: string
  daysLive: number
  forRent: boolean
}

/**
 * Is this still available?
 *
 * The single highest-value automated email for a property marketplace: sold
 * listings that nobody marks sold are the main reason buyers stop trusting a
 * portal, and the seller gets their slot back.
 */
export function generateStaleListingEmail(d: StaleListingEmailData): string {
  const verb = d.forRent ? 'rented' : 'sold'
  return layout(
    'Is your property still available?',
    `      <h2>Is this still available?</h2>

      <p>Hello ${esc(d.firstName)}, your listing has been live for ${d.daysLive} days.</p>

      <div class="card">
        <strong>${esc(d.propertyTitle)}</strong><br />
        <a href="${SITE}/properties/${esc(d.propertySlug)}">View the listing</a>
      </div>

      <p>If it is still available, you need do nothing — it stays live.</p>

      <p>If it has ${verb}, marking it so takes a moment and frees the slot for your
      next property. It also keeps MedaGhar honest: nothing puts a buyer off a
      portal faster than calling about a property that went ${verb} months ago.</p>

      <p style="text-align:center; margin-top:24px;">
        <a href="${SITE}/dashboard" class="cta">Update your listing</a>
      </p>`,
    'You are receiving this because you have an active listing on MedaGhar.'
  )
}

export function generateStaleListingEmailText(d: StaleListingEmailData): string {
  const verb = d.forRent ? 'rented' : 'sold'
  return `Is this still available?

Hello ${d.firstName}, your listing has been live for ${d.daysLive} days.

${d.propertyTitle}
${SITE}/properties/${d.propertySlug}

If it is still available, do nothing. If it has ${verb}, marking it so frees
the slot for your next property.

Update your listing: ${SITE}/dashboard
${textFooter()}`
}

export interface TourRequestEmailData {
  ownerFirstName: string
  requesterName: string
  propertyTitle: string
  propertySlug: string
  preferredDate: string
  note?: string
}

/** Someone wants to visit a property. */
export function generateTourRequestEmail(d: TourRequestEmailData): string {
  return layout(
    'Someone wants to view your property',
    `      <h2>Viewing request</h2>

      <p><strong>${esc(d.requesterName)}</strong> would like to visit your property.</p>

      <div class="card">
        <strong>${esc(d.propertyTitle)}</strong><br />
        Preferred time: <strong>${esc(d.preferredDate)}</strong><br />
        <a href="${SITE}/properties/${esc(d.propertySlug)}">View the listing</a>
      </div>

      ${d.note ? `<div class="panel">${esc(d.note).replace(/\n/g, '<br />')}</div>` : ''}

      <p style="text-align:center; margin-top:24px;">
        <a href="${SITE}/dashboard" class="cta">Respond to the request</a>
      </p>

      <div class="warn">
        Meet at the property during daylight and take someone with you. MedaGhar
        does not verify the identity of buyers or sellers.
      </div>`,
    'You are receiving this because someone requested a viewing of your listing.'
  )
}

export function generateTourRequestEmailText(d: TourRequestEmailData): string {
  return `Viewing request

${d.requesterName} would like to visit your property.

${d.propertyTitle}
Preferred time: ${d.preferredDate}
${d.note ? `\n"${d.note}"\n` : ''}
Respond: ${SITE}/dashboard

Meet at the property during daylight and take someone with you. MedaGhar does
not verify the identity of buyers or sellers.
${textFooter()}`
}
