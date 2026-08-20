import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', enquiry: 'Product Enquiries', message: '' });
  const [sent, setSent] = useState(false);

  function update(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }
  function submit(e) { e.preventDefault(); setSent(true); }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="relative overflow-hidden border-b border-slate-300 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blue-700">Contact Us</span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Let's Connect</h1>
            <p className="text-lg leading-8 text-slate-700">Have a product enquiry, quotation request, dealership opportunity, or business requirement? Get in touch with Infix Industries.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Contact Information</p>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Phone / WhatsApp</p>
                  <p className="mt-2">077 231 0421<br/>074 085 8726</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="mt-2">infixindustries@gmail.com</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Address</p>
                  <p className="mt-2">103/3 Prison Road, Dalupotha, Negombo, Sri Lanka</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-600">Business Enquiries</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div>
                      <strong>Product Enquiries:</strong> For enquiries about our PVC, hardware, industrial and related products.
                    </div>
                    <div>
                      <strong>Dealer & Distribution Enquiries:</strong> Interested in becoming a dealer or working with Infix Industries? Contact us to discuss your requirements.
                    </div>
                    <div>
                      <strong>Import & Supply Enquiries:</strong> For product sourcing, importing and supply requirements, get in touch with our team.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-0 overflow-hidden shadow-[0_24px_70px_rgba(15,23,42,0.04)]">
              <iframe
                title="Infix Industries Location"
                src="https://www.google.com/maps?q=103/3+Prison+Road,+Dalupotha,+Negombo,+Sri+Lanka&output=embed"
                width="100%"
                height="320"
                className="block"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            {sent ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-700">Thanks — we received your enquiry and will reply soon.</div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600">Name</label>
                  <input name="name" value={form.name} onChange={update} required placeholder="Name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Company Name</label>
                  <input name="company" value={form.company} onChange={update} placeholder="Company Name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={update} required placeholder="Phone Number" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Email</label>
                  <input name="email" value={form.email} onChange={update} required placeholder="Email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Enquiry Type</label>
                  <select name="enquiry" value={form.enquiry} onChange={update} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-400">
                    <option>Product Enquiries</option>
                    <option>Dealer & Distribution Enquiries</option>
                    <option>Import & Supply Enquiries</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Message</label>
                  <textarea name="message" value={form.message} onChange={update} required placeholder="Message" className="mt-2 h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-400" />
                </div>
                <button className="rounded-full bg-blue-400 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95">Send Enquiry</button>
              </form>
            )}
            <div className="mt-6 text-xs text-slate-500">INFIX INDUSTRIES — Manufacturers • Importers • Distributors</div>
          </div>
        </div>
      </section>
    </main>
  )
}
