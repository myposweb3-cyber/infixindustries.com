import Link from 'next/link'
import { useEffect, useState } from 'react'
import { normalizeImageUrl } from '../lib/imageUrl'
import { formatMoney } from '../lib/currency'

export default function ComparePage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    read()
    let bc
    try {
      bc = new BroadcastChannel('infixsite')
      bc.onmessage = (ev) => { if (ev.data?.key === 'compare') read() }
    } catch (e) {}
    return () => { if (bc) bc.close() }
  }, [])

  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem('compare') || '[]')
      setItems(raw || [])
    } catch (e) { setItems([]) }
  }

  function remove(index) {
    const raw = JSON.parse(localStorage.getItem('compare') || '[]')
    raw.splice(index, 1)
    localStorage.setItem('compare', JSON.stringify(raw))
    try { new BroadcastChannel('infixsite').postMessage({ key: 'compare' }) } catch(e){}
    read()
  }

  function clearAll() {
    localStorage.setItem('compare', JSON.stringify([]))
    try { new BroadcastChannel('infixsite').postMessage({ key: 'compare' }) } catch(e){}
    read()
  }

  if (!items.length) return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-semibold">Your compare list is empty</h2>
          <p className="mt-3 text-slate-600">Add items to compare to see them here.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-blue-400 px-6 py-3 text-white">Browse products</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Compare</h1>
          <div className="flex gap-3">
            <button onClick={clearAll} className="rounded-full border px-4 py-2">Clear all</button>
            <Link href="/shop" className="rounded-full bg-blue-400 px-4 py-2 text-white">Continue shopping</Link>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => {
            const title = typeof it === 'string' ? `Product ${it}` : (it.title || 'Product')
            const href = typeof it === 'string' ? `/product/${it}` : (it.slug ? `/product/${it.slug}` : `/product/${it.id || ''}`)
            const price = typeof it === 'string' ? null : (it.price || it.discount_price || null)
            const image = typeof it === 'string' ? null : (it.image || null)
            return (
              <div key={idx} className="rounded-[20px] border bg-white p-4">
                {image ? <img src={normalizeImageUrl(image)} className="h-40 w-full object-cover rounded-md" alt={title} /> : <div className="h-40 w-full rounded-md bg-slate-100" />}
                <h3 className="mt-3 font-semibold">{title}</h3>
                {price && <p className="text-slate-600">{formatMoney(price)}</p>}
                <div className="mt-3 flex gap-2">
                  <Link href={href} className="rounded-full border px-3 py-2">View</Link>
                  <button onClick={() => remove(idx)} className="rounded-full bg-red-600 px-3 py-2 text-white">Remove</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
