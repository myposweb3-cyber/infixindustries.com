import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { normalizeImageUrl } from '../../lib/imageUrl'
import { useAuth } from '../../hooks/useAuth'
import { formatMoney } from '../../lib/currency'

const fallbackProducts = [
  { id: 'demo-drill', slug: 'premium-drill-set', title: 'Premium Drill Set', brand: 'DeWalt', category: 'Power Tools', price: 219, discount_price: 189, image: '/images/hero-workshop.jpg', short_description: 'A dependable drill set for precise everyday work.' },
  { id: 'demo-mixer', slug: 'concrete-mixer', title: 'Concrete Mixer', brand: 'Bosch', category: 'Building Materials', price: 449, image: '/images/hero-materials.jpg', short_description: 'Reliable mixing performance for demanding builds.' },
  { id: 'demo-pipe', slug: 'high-flow-pipe-set', title: 'High-Flow Pipe Set', brand: 'Total', category: 'Plumbing', price: 89, image: '/images/hero-hardware.webp', short_description: 'Durable pipe components made for dependable flow.' },
  { id: 'demo-helmet', slug: 'safety-helmet-hard-hat', title: 'Safety Helmet Hard Hat', brand: 'Infix Safety', category: 'Safety Equipment', price: 59, discount_price: 49, image: '/images/hero-workshop.jpg', short_description: 'Comfortable protection for active work sites.' },
  { id: 'demo-panel', slug: 'smart-led-panel', title: 'Smart LED Panel', brand: 'Philips', category: 'Electrical', price: 79, image: '/images/hero-materials.jpg', short_description: 'Clean, efficient lighting for homes and businesses.' },
  { id: 'demo-trimmer', slug: 'outdoor-hedge-trimmer', title: 'Outdoor Hedge Trimmer', brand: 'Makita', category: 'Garden', price: 129, image: '/images/hero-hardware.webp', short_description: 'Balanced cutting power for tidy outdoor spaces.' }
]

export default function Shop() {
  const API = process.env.NEXT_PUBLIC_API_URL || '/api'
  const router = useRouter()
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [addingProductId, setAddingProductId] = useState(null)
  const [viewMode, setViewMode] = useState('all')
  const [filters, setFilters] = useState({ q: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' })

  async function addToCart(product) {
    setAddingProductId(product.id)
    try {
      if (token && product.id) await axios.post(`${API}/cart`, { product_id: product.id, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } })
      else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const existing = cart.find((item) => (product.id && item.productId === product.id) || (!product.id && item.slug === product.slug))
        if (existing) existing.quantity = (existing.quantity || 1) + 1
        else cart.push({ productId: product.id, slug: product.slug || String(product.id), title: product.title, price: product.discount_price || product.price, image: product.image, quantity: 1 })
        localStorage.setItem('cart', JSON.stringify(cart))
      }
      alert('Added to cart')
    } catch (error) { alert(error.response?.data?.error || 'Failed to add to cart') }
    finally { setAddingProductId(null) }
  }

  function buildQuery(value = filters, currentPage = page) {
    const params = new URLSearchParams()
    Object.entries(value).forEach(([key, item]) => item && params.append(key, item))
    params.append('page', currentPage); params.append('limit', 12)
    return params.toString()
  }

  function fetchProducts(value = filters, currentPage = page) {
    setLoading(true)
    const currentView = router.query.view || 'all'
    const isFilteredView = currentView === 'wishlist' || currentView === 'compare'

    if (isFilteredView) {
      const ids = JSON.parse(localStorage.getItem(currentView) || '[]')
      const filtered = (window.__shopProducts || fallbackProducts).filter((product) => {
        const pid = String(product.id || product.slug || product.title)
        return ids.includes(pid)
      })

      setProducts(filtered)
      setTotal(filtered.length)
      setLoading(false)
      return
    }

    axios.get(`${API}/products?${buildQuery(value, currentPage)}`).then((res) => {
      const items = res.data.items && res.data.items.length ? res.data.items : fallbackProducts
      window.__shopProducts = items
      setProducts(items)
      setTotal(res.data.items && res.data.items.length ? res.data.total || items.length : items.length)
    }).catch(() => {
      window.__shopProducts = fallbackProducts
      setProducts(fallbackProducts)
      setTotal(fallbackProducts.length)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    axios.get(`${API}/home/categories`).then((res) => setCategories(res.data)).catch(() => {})
    axios.get(`${API}/home/brands`).then((res) => setBrands(res.data)).catch(() => {})
  }, [API])

  useEffect(() => {
    if (!router.isReady) return

    const nextView = router.query.view === 'wishlist' || router.query.view === 'compare' ? router.query.view : 'all'
    setViewMode(nextView)

    const value = {
      q: typeof router.query.q === 'string' ? router.query.q : '',
      category: typeof router.query.category === 'string' ? router.query.category : '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    }

    setFilters(value)
    setPage(1)
    fetchProducts(value, 1)
  }, [router.isReady, router.query.q, router.query.category, router.query.view])

  useEffect(() => {
    if (router.isReady && page > 1) fetchProducts(filters, page)
  }, [page])

  function submit(event) {
    event.preventDefault(); setPage(1); fetchProducts(filters, 1)
  }

  function reset() {
    const value = { q: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' }
    setFilters(value)
    setPage(1)
    router.replace('/shop', undefined, { shallow: true })
    fetchProducts(value, 1)
  }

  const change = (event) => setFilters((old) => ({ ...old, [event.target.name]: event.target.value }))

  function ProductTile({ p }) {
    const [wishlisted, setWishlisted] = useState(false)
    const [compared, setCompared] = useState(false)
    const productName = p.title || p.name || p.product_name || 'Infix Industries product'
    const safeId = String(p.id || p.slug || productName)

    const syncListStates = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
        const compare = JSON.parse(localStorage.getItem('compare') || '[]')
        setWishlisted(wishlist.includes(safeId))
        setCompared(compare.includes(safeId))
      } catch (e) {
        console.error('syncListStates error', e)
      }
    }

    useEffect(() => {
      syncListStates()
      const onStorage = (e) => {
        if (e.key === 'wishlist' || e.key === 'compare') syncListStates()
      }
      window.addEventListener('storage', onStorage)
      let bc
      try {
        bc = new BroadcastChannel('infixsite')
        bc.onmessage = (ev) => { if (ev.data?.key === 'wishlist' || ev.data?.key === 'compare') syncListStates() }
      } catch (e) {}
      return () => { window.removeEventListener('storage', onStorage); if (bc) bc.close() }
    }, [safeId])

    const updateLocalList = (key) => {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || '[]')
        const next = arr.includes(safeId) ? arr.filter((x) => x !== safeId) : [...arr, safeId]
        localStorage.setItem(key, JSON.stringify(next))
        try { const bc = new BroadcastChannel('infixsite'); bc.postMessage({ key }); bc.close() } catch (e) {}
        return next
      } catch (e) { console.error('updateLocalList error', e); return [] }
    }

    const handleWishlistToggle = (ev) => {
      ev.preventDefault(); ev.stopPropagation()
      const next = updateLocalList('wishlist')
      setWishlisted(next.includes(safeId))
    }

    const handleCompareToggle = (ev) => {
      ev.preventDefault(); ev.stopPropagation()
      const next = updateLocalList('compare')
      setCompared(next.includes(safeId))
    }

    const discount = p.price && p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0
    const goToProduct = () => router.push(`/product/${p.slug || p.id}`)

    return (
      <article
        role="button"
        tabIndex={0}
        onClick={goToProduct}
        onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); goToProduct() } }}
        className="shop-product-card product-card-surface group relative flex cursor-pointer flex-col overflow-hidden rounded-[30px] border border-slate-200/80 bg-white"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img src={normalizeImageUrl(p.image || p.image_url)} alt={productName} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80"></div>
          {discount > 0 && (<div className="absolute right-4 top-4 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">Save {discount}%</div>)}
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">{p.brand || 'Infix selection'}</span>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="shop-product-title min-h-[3.25rem] text-xl font-semibold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{productName}</h3>
              <div className="flex items-baseline gap-2">
                <p className="shop-product-price text-2xl font-bold">{formatMoney(p.discount_price || p.price || 0)}</p>
                {discount > 0 && <p className="text-sm text-slate-500 line-through">{formatMoney(p.price || 0)}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button type="button" aria-label="wishlist" onClick={handleWishlistToggle} className={`rounded-full border px-3 py-2 text-sm transition ${wishlisted ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-blue-400 hover:text-white'}`}>{wishlisted ? '♥' : '♡'}</button>
              <button type="button" aria-label="compare" onClick={handleCompareToggle} className={`rounded-full border px-3 py-2 text-sm transition ${compared ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-blue-400 hover:text-white'}`}>⇄</button>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-blue-400/30 via-blue-400/15 to-transparent"></div>
          <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="min-h-[3rem] line-clamp-2 text-sm leading-6 text-slate-600">{p.short_description || p.description || 'Reliable product selection for professional and everyday projects.'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); addToCart(p) }} disabled={addingProductId === p.id} className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:opacity-70">{addingProductId === p.id ? 'Adding...' : 'Add'}</button>
              <Link href={`/product/${p.slug || p.id}`} className="inline-flex items-center justify-center rounded-full border border-blue-500/50 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.12)] transition hover:bg-blue-600 hover:text-white">View</Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="shop-page min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="shop-intro border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="shop-eyebrow text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Shop the collection</p>
              <h1 className="shop-heading mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Everything your next project needs.</h1>
              <p className="shop-lede mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Explore dependable tools, hardware, electrical supplies, building materials, and safety essentials selected for serious work.</p>
            </div>
            <div className="shop-proof flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">✓</span>
              <span><strong className="block text-slate-950">Trusted supply</strong>Serving Sri Lanka</span>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-catalogue mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="shop-filter self-start rounded-[28px] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">Refine your search</p><h2 className="mt-2 text-xl font-semibold text-white">Find the right fit.</h2></div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-blue-200">{total || 0}</span>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Search</label>
              <input name="q" value={filters.q} onChange={change} placeholder="Search products" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400" />
              <label className="block pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category</label>
              <select name="category" value={filters.category} onChange={change} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-blue-400"><option value="">All Categories</option>{categories.map((x) => <option key={x.id} value={x.slug}>{x.name}</option>)}</select>
              <label className="block pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Brand</label>
              <select name="brand" value={filters.brand} onChange={change} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-blue-400"><option value="">All Brands</option>{brands.map((x) => <option key={x.id} value={x.slug}>{x.name}</option>)}</select>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><input name="minPrice" value={filters.minPrice} onChange={change} placeholder="Min price" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400" /><input name="maxPrice" value={filters.maxPrice} onChange={change} placeholder="Max price" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400" /></div>
              <label className="block pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sort by</label>
              <select name="sort" value={filters.sort} onChange={change} className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-blue-400"><option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></select>
              <div className="flex gap-3 pt-2"><button className="flex-1 rounded-full bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-400">Apply</button><button type="button" onClick={reset} className="rounded-full border border-white/20 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">Reset</button></div>
            </form>
          </aside>

          <main className="min-w-0">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold text-slate-950">{viewMode === 'wishlist' ? 'Your wishlist' : viewMode === 'compare' ? 'Compare your picks' : 'Curated for the work ahead'}</p><p className="mt-1 text-sm text-slate-500">{loading ? 'Loading products...' : `${total || 0} products available`}</p></div>
              <div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Reliable selection <span className="mx-1 text-slate-300">•</span> Fast support</div>
            </div>
            {loading ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[420px] animate-pulse rounded-[28px] bg-slate-100" />)}</div> : products.length ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{products.map((p) => <ProductTile key={p.id || p.slug || p.title} p={p} />)}</div> : <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">No products found</p><h2 className="mt-3 text-2xl font-semibold text-slate-950">Try a different search.</h2><p className="mt-2 text-slate-500">Reset the filters or browse all products to continue.</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Reset filters</button></div>}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3"><button onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">← Previous</button><span className="rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">Page {page}</span><button onClick={() => page * 12 < total && setPage(page + 1)} disabled={page * 12 >= total} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">Next →</button></div>
          </main>
        </div>
      </section>
    </div>
  )
}
