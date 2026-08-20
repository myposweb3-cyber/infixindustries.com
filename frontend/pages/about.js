import Link from 'next/link'

export default function About() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="relative overflow-hidden border-b border-slate-300 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blue-700">About HardPro</span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Built for professionals who demand premium hardware and dependable service.</h1>
            <p className="text-lg leading-8 text-slate-700">InfixStore started with a simple mission: provide reliable, top-quality hardware and construction materials to professionals and DIYers alike. We curate trusted brands and maintain high standards for product selection.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110">Browse Products</Link>
              <Link href="/contact" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm text-slate-700 transition hover:border-slate-400">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-300 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Our values</h2>
            <div className="mt-6 space-y-4 text-slate-700">
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Quality</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">We are committed to delivering products that meet high standards of quality, reliability, and performance.</p>
              </div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Integrity</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">We conduct our business with honesty, transparency, and responsibility in everything we do.</p>
              </div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Customer Focus</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">We put our customers and business partners at the center of our decisions and strive to provide dependable service.</p>
              </div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Innovation</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">We continuously seek better products, technologies, and ways of working to meet changing market needs.</p>
              </div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Reliability</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">We believe in keeping our commitments and building trust through consistent products and service.</p>
              </div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Continuous Growth</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">We focus on learning, improving, and expanding our capabilities to build a stronger business for the future.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-300 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Why buyers choose us</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">Quality Products</p>
                  <p className="mt-2 text-sm text-slate-600">Reliable products for everyday business needs</p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">Competitive Pricing</p>
                  <p className="mt-2 text-sm text-slate-600">Value-focused pricing for dealers and customers</p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">Reliable Supply</p>
                  <p className="mt-2 text-sm text-slate-600">Consistent sourcing and dependable distribution</p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">Growing Product Range</p>
                  <p className="mt-2 text-sm text-slate-600">PVC, hardware, industrial and future product solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
