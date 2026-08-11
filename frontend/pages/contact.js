import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function update(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }
  function submit(e) { e.preventDefault(); setSent(true); }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="relative overflow-hidden border-b border-slate-800/70 bg-[#02070d] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-sky-300">Contact HardPro</span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Need help with an order, product, or project plan?</h1>
            <p className="text-lg leading-8 text-slate-300">Reach out to our expert team and we’ll help you choose the right tools, equipment, and hardware solutions.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-600">Get in touch</p>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Call us</p>
                  <p className="mt-2">+94 74 085 8726</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="mt-2">support@hardpro.com</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Visit</p>
                  <p className="mt-2">103/3 farm road Dalupotha negombo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            {sent ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-700">Thanks — we received your message and will reply soon.</div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600">Your name</label>
                  <input name="name" value={form.name} onChange={update} required placeholder="Your name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Your email</label>
                  <input name="email" value={form.email} onChange={update} required placeholder="Your email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Message</label>
                  <textarea name="message" value={form.message} onChange={update} required placeholder="Message" className="mt-2 h-36 w-full rounded-2xl border border-slate-800/70 bg-[#101b2b] px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
                </div>
                <button className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-95">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
