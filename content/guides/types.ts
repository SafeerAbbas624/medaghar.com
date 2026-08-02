export type GuideCategory =
  | 'Buying'
  | 'Selling'
  | 'Renting'
  | 'Investment'
  | 'Legal & Taxes'
  | 'Construction'
  | 'Home Financing'

export interface GuideFaq {
  question: string
  answer: string
}

export interface Guide {
  slug: string
  title: string
  description: string
  category: GuideCategory
  keywords: string[]
  publishedAt: string
  updatedAt: string
  readTimeMinutes: number
  /** Slugs of related guides shown at the bottom of the article */
  related: string[]
  faqs: GuideFaq[]
  /**
   * Article body as HTML. Allowed tags: h2, h3, p, ul, ol, li, table, thead,
   * tbody, tr, th, td, strong, em, a, blockquote. No h1 (page renders it), no
   * inline styles, no scripts. Internal links use relative paths (/tools/...,
   * /guides/..., /properties?...).
   */
  html: string
}
