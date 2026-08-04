import JsonLd from '@/components/JsonLd'
import { faqJsonLd } from '@/lib/seo'

export interface Faq {
  question: string
  answer: string
}

/**
 * FAQ block with FAQPage JSON-LD. Sits last on the page, immediately before
 * the footer, so it does not push listings down.
 *
 * Rendered as plain <details> — no JS, works before hydration, and Google
 * reads the answer text regardless of open state.
 */
export default function FaqSection({ faqs, heading = 'Frequently asked questions' }: {
  faqs: Faq[]
  heading?: string
}) {
  if (faqs.length === 0) return null

  return (
    <section className="bg-white rounded-2xl shadow-sm p-[21px] lg:p-[34px]">
      <JsonLd data={faqJsonLd(faqs)} />
      <h2 className="text-[21px] lg:text-[26px] font-bold text-gray-900 mb-[21px]">{heading}</h2>

      <div className="divide-y divide-gray-100">
        {faqs.map((f) => (
          <details key={f.question} className="group py-[16px] first:pt-0 last:pb-0">
            <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
              <h3 className="text-[15px] lg:text-[16px] font-semibold text-gray-900 group-open:text-cyan-700 transition">
                {f.question}
              </h3>
              <span className="text-cyan-700 text-[18px] leading-none flex-shrink-0 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-[10px] text-[14px] lg:text-[15px] text-gray-700 leading-relaxed pr-8">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
