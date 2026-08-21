import Link from 'next/link'

const values = [
  {
    title: 'Quality',
    text: 'We are committed to providing reliable products that meet high standards of quality, performance, and durability.'
  },
  {
    title: 'Innovation',
    text: 'We continuously improve our products, operations, technology, and manufacturing capabilities to serve a changing market.'
  },
  {
    title: 'Partnership',
    text: 'We build strong, lasting relationships with customers, suppliers, dealers, contractors, and business partners.'
  },
  {
    title: 'Growth',
    text: 'We are focused on expanding our product portfolio and developing Infix Industries into a trusted name across Sri Lanka.'
  }
]

export default function About() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.15),_transparent_38%),linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_55%,_#e0f2fe_100%)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute -left-24 top-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl fade-up">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-blue-700">Infix Industries</span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Manufacturers • Importers • Distributors</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Building a trusted future for quality products in Sri Lanka.</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-700">Infix Industries is a Sri Lankan company focused on the manufacturing, importing, and distribution of quality PVC, hardware, industrial, and related products, with plans to expand into additional product categories in the future.</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/shop" className="ripple-btn inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Explore Products</Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-7 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700">Talk to our team</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.07)] sm:p-10 fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">About Us</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Reliable products. Competitive solutions. Professional service.</h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-slate-600">
              <p>We are committed to providing reliable products, competitive solutions, and professional service to dealers, contractors, businesses, and customers across Sri Lanka.</p>
              <p>With a strong focus on quality, innovation, and continuous development, we aim to expand our product portfolio, strengthen our manufacturing capabilities, and build long-term partnerships throughout the country.</p>
              <p>Our goal is to develop Infix Industries into a trusted and recognized name in Sri Lanka&apos;s manufacturing, importing, and distribution sector.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-[32px] bg-slate-950 p-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] fade-up">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Vision</p>
              <p className="mt-5 text-xl leading-8 text-slate-200">To become one of Sri Lanka&apos;s most trusted and recognized companies in manufacturing, importing, and distribution, delivering quality products and dependable solutions across multiple industries.</p>
            </article>
            <article className="rounded-[32px] border border-blue-100 bg-blue-50 p-8 text-slate-900 shadow-[0_24px_60px_rgba(37,99,235,0.08)] fade-up">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Mission</p>
              <p className="mt-5 text-xl leading-8 text-slate-700">To manufacture, import, and distribute reliable products while providing exceptional service, competitive value, and innovative solutions to our customers and business partners.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">What guides us</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">A practical standard for long-term growth.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <article key={value.title} className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_60px_rgba(37,99,235,0.1)] fade-up">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700">0{index + 1}</span>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
