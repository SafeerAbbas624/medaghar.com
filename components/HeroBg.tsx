import Image from 'next/image'

/**
 * Photo backdrop for page hero banners — a full-cover image with a slate
 * gradient overlay so white text stays readable. Use inside a hero wrapper
 * that is `relative overflow-hidden`, and give the foreground content
 * `relative z-10`:
 *
 *   <div className="relative overflow-hidden bg-slate-900 text-white py-[55px]">
 *     <HeroBg src="/images/cities/city-skyline-1.jpg" />
 *     <div className="relative z-10 max-w-7xl mx-auto ...">…</div>
 *   </div>
 */
export default function HeroBg({
  src,
  overlay = 'from-slate-950/92 via-slate-900/82 to-slate-800/68',
}: {
  src: string
  overlay?: string
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${overlay}`} aria-hidden />
    </>
  )
}
