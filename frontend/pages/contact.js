import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', enquiry: 'Product Enquiries', message: '' });
  const [sent, setSent] = useState(false);

  function update(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }
  function submit(e) { e.preventDefault(); setSent(true); }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-blue-600">Contact</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Get in touch with Infix Industries</h1>
            <p className="mt-4 text-lg text-slate-700">Questions about products, distribution, importing or partnerships? Send us a message or use the details to contact us directly.</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 items-start">

          {/* Left: Contact cards + map */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
              <h2 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Contact Information</h2>
              <div className="mt-4 space-y-4 text-slate-700">
                <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <svg className="h-6 w-6 flex-none text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M9 3v2m6-2v2M4 9h16v11H4z"/></svg>
                  <div>
                    <div className="font-medium text-slate-900">Phone / WhatsApp</div>
                    <div className="mt-1 text-sm">077 231 0421 • 074 085 8726</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <svg className="h-6 w-6 flex-none text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12v4H8v-4M12 2v10"/></svg>
                  <div>
                    <div className="font-medium text-slate-900">Email</div>
                    <div className="mt-1 text-sm">infixindustries@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <svg className="h-6 w-6 flex-none text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21s-4.5-6-9-6-9 6-9 6"/></svg>
                  <div>
                    <div className="font-medium text-slate-900">Address</div>
                    <div className="mt-1 text-sm">103/3 Prison Road, Dalupotha, Negombo, Sri Lanka</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="h-64 w-full">
                <iframe
                  title="Infix Industries Location"
                  src="https://www.google.com/maps?q=103/3+Prison+Road,+Dalupotha,+Negombo,+Sri+Lanka&output=embed"
                  width="100%"
                  height="100%"
                  className="block"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-900">Business Enquiries</h3>
              <ul className="mt-3 space-y-2">
                <li><strong>Product Enquiries:</strong> PVC, hardware, industrial and related products.</li>
                <li><strong>Dealer & Distribution Enquiries:</strong> Become a dealer or distributor.</li>
                <li><strong>Import & Supply Enquiries:</strong> Product sourcing, importing and supply.</li>
              </ul>
            </div>
          </div>

          {/* Right: Contact form */}
          <div>
            <div className="sticky top-24 rounded-2xl bg-white p-8 shadow-md border border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Send an Enquiry</h2>
              <p className="mt-2 text-sm text-slate-600">Fill out the form and we'll get back to you within 1-2 business days.</p>

              <div className="mt-6">
                {sent ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">Thanks — we received your enquiry and will reply soon.</div>
                ) : (
                  <form onSubmit={submit} className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Name</label>
                      <input name="name" value={form.name} onChange={update} required placeholder="Your name" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Company</label>
                      <input name="company" value={form.company} onChange={update} placeholder="Company (optional)" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Phone</label>
                        <input name="phone" value={form.phone} onChange={update} required placeholder="Phone number" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input name="email" value={form.email} onChange={update} required placeholder="Email address" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Enquiry Type</label>
                      <select name="enquiry" value={form.enquiry} onChange={update} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400">
                        <option>Product Enquiries</option>
                        <option>Dealer & Distribution Enquiries</option>
                        <option>Import & Supply Enquiries</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Message</label>
                      <textarea name="message" value={form.message} onChange={update} required placeholder="Tell us more about your enquiry" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-400 h-40" />
                    </div>

                    <div className="flex items-center justify-between">
                      <button type="submit" className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95">Send Enquiry</button>
                      <div className="text-xs text-slate-400">INFIX INDUSTRIES — Manufacturers • Importers • Distributors</div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
