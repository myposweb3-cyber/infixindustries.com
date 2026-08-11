import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { normalizeImageUrl } from '../../lib/imageUrl'
import { useAuth } from '../../hooks/useAuth'

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
    axios.get(`${API}/products?${buildQuery(value, currentPage)}`).then((res) => { setProducts(res.data.items || []); setTotal(res.data.total || 0) }).catch(() => { setProducts([]); setTotal(0) }).finally(() => setLoading(false))
  }
  useEffect(() => { axios.get(`${API}/home/categories`).then((res) => setCategories(res.data)).catch(() => {}); axios.get(`${API}/home/brands`).then((res) => setBrands(res.data)).catch(() => {}) }, [API])
  useEffect(() => { if (!router.isReady) return; const value = { q: typeof router.query.q === 'string' ? router.query.q : '', category: typeof router.query.category === 'string' ? router.query.category : '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' }; setFilters(value); setPage(1); fetchProducts(value, 1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [router.isReady, router.query.q, router.query.category])
  useEffect(() => { if (router.isReady && page > 1) fetchProducts(filters, page) /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page])

  function submit(event) { event.preventDefault(); setPage(1); fetchProducts(filters, 1) }
  function reset() { const value = { q: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' }; setFilters(value); setPage(1); fetchProducts(value, 1); router.replace('/shop', undefined, { shallow: true }) }
  const change = (event) => setFilters((old) => ({ ...old, [event.target.name]: event.target.value }))

  return <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]"><section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8"><div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"><aside className="self-start rounded-[28px] border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-6"><h2 className="text-xl font-semibold text-slate-900">Filter products</h2><form onSubmit={submit} className="mt-6 space-y-4"><input name="q" value={filters.q} onChange={change} placeholder="Search products" className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900" /><select name="category" value={filters.category} onChange={change} className="w-full rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-900"><option value="">All Categories</option>{categories.map((x) => <option key={x.id} value={x.slug}>{x.name}</option>)}</select><select name="brand" value={filters.brand} onChange={change} className="w-full rounded-3xl bg-[#090909] px-4 py-3 text-sm text-white"><option value="">All Brands</option>{brands.map((x) => <option key={x.id} value={x.slug}>{x.name}</option>)}</select><div className="grid gap-3 sm:grid-cols-2"><input name="minPrice" value={filters.minPrice} onChange={change} placeholder="Min price" className="w-full rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-900" /><input name="maxPrice" value={filters.maxPrice} onChange={change} placeholder="Max price" className="w-full rounded-3xl bg-[#090909] px-4 py-3 text-sm text-white" /></div><select name="sort" value={filters.sort} onChange={change} className="w-full rounded-3xl bg-[#090909] px-4 py-3 text-sm text-white"><option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option></select><div className="flex flex-col gap-3 sm:flex-row"><button className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black">Apply Filters</button><button type="button" onClick={reset} className="rounded-full border px-6 py-3 text-sm">Reset</button></div></form></aside><main className="min-w-0 space-y-6"><div className="rounded-[28px] bg-slate-50 p-5"><p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Shop</p><h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Curated premium products</h2><p className="mt-2 text-sm text-gray-500">{loading ? 'Loading products...' : `${total} products found`}</p></div><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((p) => <article key={p.id} className="min-w-0 overflow-hidden rounded-[28px] border bg-slate-50"><img src={normalizeImageUrl(p.image)} alt={p.title} className="h-52 w-full object-cover" /><div className="p-5"><h3 className="min-h-[3.5rem] text-xl font-semibold text-slate-900">{p.title}</h3><p className="mt-2 text-2xl font-semibold text-slate-900">${parseFloat(p.discount_price || p.price || 0).toFixed(2)}</p><div className="mt-5 flex flex-wrap justify-end gap-2"><Link href={`/product/${p.slug || p.id}`} className="inline-flex min-w-[116px] justify-center rounded-full border border-sky-400/50 px-3 py-2 text-sm font-semibold text-sky-300">View Product</Link><button onClick={() => addToCart(p)} disabled={addingProductId === p.id} className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black">{addingProductId === p.id ? 'Adding...' : 'Add'}</button></div></div></article>)}</div><div className="flex justify-center gap-3"><button onClick={() => page > 1 && setPage(page - 1)} className="rounded-full border px-5 py-3">Previous</button><button onClick={() => page * 12 < total && setPage(page + 1)} className="rounded-full border px-5 py-3">Next</button></div></main></div></section></div>
}
