import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { normalizeImageUrl } from '../lib/imageUrl'
import { formatMoney } from '../lib/currency'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'
import ShinyText from '../components/reactbits/ShinyText'
import SpotlightCard from '../components/reactbits/SpotlightCard'

const defaultBestSellers = [
  { title: 'Premium Drill Set', brand: 'DeWalt', price: 219, image: 'https://images.unsplash.com/photo-1581091870620-6501c8a508f3?auto=format&fit=crop&w=900&q=80' },
  { title: 'Concrete Mixer', brand: 'Bosch', price: 449, image: 'https://images.unsplash.com/photo-1519861158037-8d1e82ac5a16?auto=format&fit=crop&w=900&q=80' },
  { title: 'Paint Roller Kit', brand: 'Nippon Paint', price: 39, image: 'https://images.unsplash.com/photo-1582571357191-5c0f77625b2f?auto=format&fit=crop&w=900&q=80' },
  { title: 'High-Flow Pipe Set', brand: 'Total', price: 89, image: 'https://images.unsplash.com/photo-1534204604390-1dbea4a128d6?auto=format&fit=crop&w=900&q=80' },
  { title: 'Outdoor Hedge Trimmer', brand: 'Makita', price: 129, image: 'https://images.unsplash.com/photo-1518977956816-bb3e7f8a08ec?auto=format&fit=crop&w=900&q=80' },
  { title: 'Smart LED Panel', brand: 'Philips', price: 79, image: 'https://images.unsplash.com/photo-1542444459-dee0893bfd27?auto=format&fit=crop&w=900&q=80' }
]

const defaultCategoryCards = [
  { name: 'Power Tools', title: 'Power Tools', slug: 'power-tools', count: 250, image: 'https://images.unsplash.com/photo-1515235395289-278126433e13?auto=format&fit=crop&w=900&q=80' },
  { name: 'Building Materials', title: 'Building Materials', slug: 'building-materials', count: 500, image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80' },
  { name: 'Electrical Supplies', title: 'Electrical Supplies', slug: 'electrical-supplies', count: 300, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c39?auto=format&fit=crop&w=900&q=80' },
  { name: 'Garden Tools', title: 'Garden Tools', slug: 'garden-tools', count: 180, image: 'https://images.unsplash.com/photo-1495688734822-86f1574fa6b6?auto=format&fit=crop&w=900&q=80' }
]

const defaultFeaturedProducts = [
  { title: 'Professional Impact Drill', brand: 'Makita', price: 349, discount_price: 279, discount: 20, rating: 4.8, reviews: 156, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1581091870620-6501c8a508f3?auto=format&fit=crop&w=900&q=80', oldPrice: 349, slug: 'professional-impact-drill' },
  { title: 'Heavy-Duty Concrete Pump', brand: 'Bosch', price: 589, discount_price: 449, discount: 24, rating: 4.9, reviews: 89, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1519861158037-8d1e82ac5a16?auto=format&fit=crop&w=900&q=80', oldPrice: 589, slug: 'heavy-duty-concrete-pump' },
  { title: 'Premium Paint Roller Set', brand: 'Nippon Paint', price: 59, discount_price: 39, discount: 34, rating: 4.7, reviews: 234, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1582571357191-5c0f77625b2f?auto=format&fit=crop&w=900&q=80', oldPrice: 59, slug: 'premium-paint-roller-set' },
  { title: 'Industrial Pipe Wrench', brand: 'Total', price: 129, discount_price: 89, discount: 31, rating: 4.6, reviews: 145, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1534204604390-1dbea4a128d6?auto=format&fit=crop&w=900&q=80', oldPrice: 129, slug: 'industrial-pipe-wrench' },
  { title: 'Cordless Hedge Trimmer Pro', brand: 'Makita', price: 199, discount_price: 129, discount: 35, rating: 4.8, reviews: 178, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1518977956816-bb3e7f8a08ec?auto=format&fit=crop&w=900&q=80', oldPrice: 199, slug: 'cordless-hedge-trimmer-pro' },
  { title: 'Smart RGB LED Panel', brand: 'Philips', price: 119, discount_price: 79, discount: 34, rating: 4.9, reviews: 267, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1542444459-dee0893bfd27?auto=format&fit=crop&w=900&q=80', oldPrice: 119, slug: 'smart-rgb-led-panel' },
  { title: 'Professional Circular Saw', brand: 'DeWalt', price: 279, discount_price: 199, discount: 29, rating: 4.7, reviews: 198, stock: 'Low Stock', image: 'https://images.unsplash.com/photo-1581092162562-40038f63c77d?auto=format&fit=crop&w=900&q=80', oldPrice: 279, slug: 'professional-circular-saw' },
  { title: 'Impact Driver Set', brand: 'Stanley', price: 159, discount_price: 109, discount: 31, rating: 4.8, reviews: 212, stock: 'In Stock', image: 'https://images.unsplash.com/photo-1577740314460-7a94f7120e44?auto=format&fit=crop&w=900&q=80', oldPrice: 159, slug: 'impact-driver-set' }
]

const testimonials = [
  {
    name: 'Harper R.',
    role: 'Project Manager',
    rating: 5,
    review: 'The selection is incredible and delivery was faster than expected. Every order feels premium.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Liam S.',
    role: 'Electrical Contractor',
    rating: 4.9,
    review: 'Reliable tools, excellent prices, and the customer support team knows their products.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Ava T.',
    role: 'DIY Enthusiast',
    rating: 4.8,
    review: 'The hero promotions and product cards make it easy to find what I need for every project.',
    image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80'
  }
]

const brandLogos = ['Bosch', 'Makita', 'DeWalt', 'Stanley', 'Total', 'Ingco', 'Yale', 'Philips', 'Nippon Paint', 'Asian Paints']
const trustCards = [
  { title: 'Genuine Products', content: 'Authorized brands with verified quality.', icon: '✓' },
  { title: 'Islandwide Delivery', content: 'Fast shipping across the country.', icon: '🚚' },
  { title: 'Secure Payments', content: 'Encrypted checkout with trusted gateways.', icon: '🔒' },
  { title: 'Expert Support', content: 'Live guidance for professional projects.', icon: '💬' }
]

const serviceCards = [
  { eyebrow: '01', title: 'Manufacturing', text: 'Developing quality PVC and related products with a practical focus on consistency, durability, and dependable supply.', icon: '◈' },
  { eyebrow: '02', title: 'Importing', text: 'Sourcing reliable products and trusted brands to give businesses, contractors, and customers access to competitive solutions.', icon: '↗' },
  { eyebrow: '03', title: 'Distribution', text: 'Connecting dealers, businesses, and customers across Sri Lanka with professional service and dependable delivery.', icon: '◎' }
]

const eventCards = [
  { date: '01', label: 'Industry connection', title: 'Dealer & partner meetups', text: 'Building stronger relationships with dealers, suppliers, contractors, and business partners.' },
  { date: '02', label: 'Product development', title: 'New product showcases', text: 'Introducing new additions to our PVC, hardware, industrial, and future product categories.' },
  { date: '03', label: 'Continuous growth', title: 'A stronger Sri Lankan network', text: 'Expanding our capabilities and distribution network to serve more industries and communities.' }
]

const processSteps = [
  { number: '01', title: 'Understand the need', text: 'We listen to the requirements of dealers, contractors, businesses, and customers.' },
  { number: '02', title: 'Source with care', text: 'We manufacture and import products with quality, reliability, and value in mind.' },
  { number: '03', title: 'Deliver with confidence', text: 'We connect the right products to the right people through dependable distribution.' }
]

const faqItems = [
  { question: 'What products does Infix Industries work with?', answer: 'Our current focus includes PVC, hardware, industrial, and related products, with additional categories planned as we grow.' },
  { question: 'Who do you serve?', answer: 'We work with dealers, contractors, businesses, suppliers, partners, and customers across Sri Lanka.' },
  { question: 'How can I discuss a product or partnership?', answer: 'Use our contact page or call 077 231 0421. Our team can help with product, supply, and partnership enquiries.' }
]

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1 text-blue-400 text-xs">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>{index < Math.round(value) ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

function CategoryCard({ card }) {
  const title = card.name || card.title
  const image = card.image || 'https://images.unsplash.com/photo-1511909525234-0fca0376b1d0?auto=format&fit=crop&w=900&q=80'
  const label = card.count ? `${card.count}+ items` : 'Shop collection'

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
      <img src={normalizeImageUrl(image)} alt={title} loading="lazy" decoding="async" className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/20 to-transparent opacity-95" />
      <div className="absolute inset-x-6 bottom-6 text-slate-900">
        <span className="text-sm uppercase tracking-[0.26em] text-blue-600">{label}</span>
        <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      </div>
    </article>
  )
}

function ProductCard({ item }) {
  const { token } = useAuth()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [compared, setCompared] = useState(false)
  const API = process.env.NEXT_PUBLIC_API_URL || '/api'
  const productId = item.id || item.product_id
  const productHref = item.slug ? `/product/${item.slug}` : '/shop'
  const safeId = String(productId || item.slug || item.title)

  const syncListStates = () => {
    if (typeof window === 'undefined') return

    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      const compare = JSON.parse(localStorage.getItem('compare') || '[]')
      
      setWishlisted(wishlist.includes(safeId))
      setCompared(compare.includes(safeId))
    } catch (e) {
      console.error('Error syncing list states:', e)
    }
  }

  useEffect(() => {
    syncListStates()

    const handleStorageChange = (e) => {
      if (e.key === 'wishlist' || e.key === 'compare') {
        syncListStates()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for BroadcastChannel messages from the same tab
    let bc
    try {
      bc = new BroadcastChannel('infixsite')
      bc.onmessage = (event) => {
        if (event.data?.key === 'wishlist' || event.data?.key === 'compare') {
          syncListStates()
        }
      }
    } catch (e) {
      // BroadcastChannel not supported, continue with storage events
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (bc) bc.close()
    }
  }, [safeId])

  const updateLocalList = (key, value) => {
    if (typeof window === 'undefined') return []

    try {
      const current = JSON.parse(localStorage.getItem(key) || '[]')
      const match = String(value)
      const next = current.includes(match)
        ? current.filter((entry) => entry !== match)
        : [...current, match]

      localStorage.setItem(key, JSON.stringify(next))
      try { 
        const bc = new BroadcastChannel('infixsite')
        bc.postMessage({ key })
        bc.close()
      } catch (e) {
        // BroadcastChannel not supported
      }
      return next
    } catch (e) {
      console.error('Error updating list:', e)
      return []
    }
  }

  const handleWishlistToggle = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const next = updateLocalList('wishlist', safeId)
    setWishlisted(next.includes(safeId))
  }

  const handleCompareToggle = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const next = updateLocalList('compare', safeId)
    setCompared(next.includes(safeId))
  }

  const goToProduct = () => {
    router.push(productHref)
  }

  const handleAddToCart = async (event) => {
    if (event) { event.preventDefault(); event.stopPropagation() }
    setAdding(true)
    try {
      if (token && productId) {
        await axios.post(`${API}/cart`, { product_id: productId, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } })
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const cartKey = item.slug || item.title
        const existing = cart.find((cartItem) => ((productId && cartItem.productId === productId) || (!productId && cartItem.slug === cartKey)))
        if (existing) existing.quantity = (existing.quantity || 1) + 1
        else cart.push({ productId, slug: item.slug || cartKey.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: item.title, price: item.discount_price || item.price, image: item.image, quantity: 1 })
        localStorage.setItem('cart', JSON.stringify(cart))
      }
      alert('Added to cart')
    } catch (error) {
      console.error('Failed to add product to cart', error)
      alert('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          goToProduct()
        }
      }}
      className="product-card-surface group cursor-pointer overflow-hidden rounded-[30px] border border-slate-200/80 bg-white"
    >
      <div className="relative overflow-hidden image-mask">
        <img src={normalizeImageUrl(item.image)} alt={item.title} loading="lazy" decoding="async" className="aspect-[4/3] h-auto w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
          <span className="rounded-full border border-white/20 bg-slate-950/55 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white backdrop-blur">{item.brand}</span>
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">-{item.discount}%</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <StarRating value={item.rating} />
              <span>{item.reviews} reviews</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Add to wishlist"
              onClick={handleWishlistToggle}
              className={`rounded-full border px-3 py-2 text-sm transition ${wishlisted ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-blue-400 hover:text-white'}`}
            >
              {wishlisted ? '♥' : '♡'}
            </button>
            <button
              type="button"
              aria-label="Add to compare"
              onClick={handleCompareToggle}
              className={`rounded-full border px-3 py-2 text-sm transition ${compared ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-blue-400 hover:text-white'}`}
            >
              ⇄
            </button>
          </div>
        </div>
        <p className="mt-4 inline-flex w-max items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{item.stock}</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-slate-900">{formatMoney(item.price)}</p>
            <p className="text-sm text-slate-500 line-through">{formatMoney(item.oldPrice)}</p>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <Link href={productHref} className="inline-flex min-w-[116px] items-center justify-center whitespace-nowrap rounded-full border border-blue-500/50 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.12)] transition hover:-translate-y-0.5 hover:border-blue-600 hover:bg-blue-600 hover:text-white">
              View Product
            </Link>
            <button type="button" onClick={handleAddToCart} disabled={adding} className="inline-flex min-w-[86px] items-center justify-center whitespace-nowrap rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Home() {
  const [progress, setProgress] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)
  const [heroSlides, setHeroSlides] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [activeHero, setActiveHero] = useState(null)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const bestSellersRef = useRef(null)
  const containerRef = useRef(null)

  const heroImageGrid = heroSlides.length
    ? heroSlides.slice(0, 4)
    : [
        { image: '/images/hero-hardware.webp', title: 'Hardware selected for real work' },
        { image: '/images/hero-workshop.jpg', title: 'Tools that keep projects moving' },
        { image: '/images/hero-materials.jpg', title: 'Materials for stronger builds' },
        { image: '/images/hero-hardware.webp', title: 'Dependable supply, from one partner' }
      ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || '/api'

    async function loadHeroSlides() {
      try {
        const res = await axios.get(`${API}/home/hero-slides`)
        console.debug('home: fetched hero slides', res.data)
        if (res.data?.length) {
          setHeroSlides(res.data)
          setActiveHero(res.data[0])
          console.debug('home: active hero set', res.data[0])
        }
      } catch (err) {
        console.warn('Failed to load hero slides', err)
      }
    }

    async function loadHomeData() {
      try {
        const [categoriesRes, featuredRes, bestSellersRes] = await Promise.all([
          axios.get(`${API}/home/categories`),
          axios.get(`${API}/home/featured`),
          axios.get(`${API}/home/best-sellers`)
        ])

        if (Array.isArray(categoriesRes?.data) && categoriesRes.data.length) {
          setCategories(categoriesRes.data)
        }
        if (Array.isArray(featuredRes?.data) && featuredRes.data.length) {
          setFeaturedProducts(featuredRes.data)
        }
        if (Array.isArray(bestSellersRes?.data) && bestSellersRes.data.length) {
          setBestSellers(bestSellersRes.data)
        }
      } catch (err) {
        console.warn('Failed to load home content', err)
      }
    }

    loadHeroSlides()
    loadHomeData()
  }, [])

  // Auto-advance hero slides every 5 seconds
  useEffect(() => {
    if (!heroSlides.length) return
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  // Update active hero when index changes
  useEffect(() => {
    if (heroSlides.length > 0) {
      setActiveHero(heroSlides[currentHeroIndex])
    }
  }, [currentHeroIndex, heroSlides])

  useEffect(() => {
    let ctx
    let timeoutId
    
    async function animate() {
      if (typeof window === 'undefined') return
      try {
        const gsapModule = await import('gsap')
        const gsap = gsapModule.default || gsapModule
        const ScrollTriggerModule = await import('gsap/dist/ScrollTrigger')
        const ScrollTrigger = ScrollTriggerModule.default || ScrollTriggerModule
        
        if (gsap && ScrollTrigger) {
          gsap.registerPlugin(ScrollTrigger)
          ctx = gsap.context(() => {
            const headline = document.querySelector('.hero-headline')
            const copy = document.querySelector('.hero-copy')
            const cta = document.querySelector('.hero-cta')
            const imageCard = document.querySelector('.hero-image-card')
            
            if (headline) gsap.from('.hero-headline', { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out' })
            if (copy) gsap.from('.hero-copy', { opacity: 0, y: 40, duration: 1.1, delay: 0.15, ease: 'power3.out' })
            if (cta) gsap.from('.hero-cta', { opacity: 0, y: 40, duration: 1.1, delay: 0.3, ease: 'power3.out' })
            
            const sectionTitles = document.querySelectorAll('.section-title')
            if (sectionTitles.length > 0) {
              gsap.from('.section-title', { opacity: 0, y: 32, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.section-title', start: 'top 90%' } })
            }
            
            const fadeUpElements = document.querySelectorAll('.fade-up')
            if (fadeUpElements.length > 0) {
              gsap.utils.toArray('.fade-up').forEach((section) => {
                gsap.from(section, { opacity: 0, y: 40, duration: 0.92, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: section, start: 'top 92%', toggleActions: 'play none none reverse' } })
              })
            }
            
            if (imageCard) gsap.from('.hero-image-card', { opacity: 0, x: 40, duration: 1.1, delay: 0.2, ease: 'power3.out' })
          }, containerRef)
        }
      } catch (err) {
        console.warn('GSAP animation setup failed:', err.message)
      }
    }

    // Wait for DOM to render before setting up animations
    timeoutId = setTimeout(animate, 100)
    
    return () => {
      clearTimeout(timeoutId)
      ctx && ctx.revert()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!bestSellersRef.current) return
    const slider = bestSellersRef.current
    const interval = setInterval(() => {
      if (!slider) return
      const halfWidth = slider.scrollWidth / 2
      if (slider.scrollLeft >= halfWidth) {
        slider.scrollLeft = 0
      } else {
        slider.scrollBy({ left: 320, behavior: 'smooth' })
      }
    }, 5200)
    return () => clearInterval(interval)
  }, [])

  const handleBestScroll = (direction) => {
    if (!bestSellersRef.current) return
    bestSellersRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  const categoryDisplay = categories.length ? categories : defaultCategoryCards
  const currentBestSellers = bestSellers.length ? bestSellers : defaultBestSellers
  const displayHeroSlides = heroSlides.length ? heroSlides : heroImageGrid

  return (
    <div className="bg-[var(--bg)] text-[var(--text)]" ref={containerRef}>
      <Head>
        <title>Infix Industries | Manufacturers, Importers & Distributors</title>
        <meta name="description" content="Infix Industries manufactures, imports, and distributes quality PVC, hardware, industrial, and related products across Sri Lanka." />
      </Head>

      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
        <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <main>
        <section className="relative overflow-hidden border-b border-slate-800 bg-[#07111f] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
          <div className="absolute -right-32 -top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="space-y-8">
                <div>
                  <span className="inline-flex items-center rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blue-200"><ShinyText text="Manufacturers • Importers • Distributors" color="#9db2cc" shineColor="#ffffff" speed={3} pauseOnHover /></span>
                  <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">Quality products. <span className="text-blue-300">Dependable solutions.</span> A stronger Sri Lanka.</h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">Infix Industries connects quality PVC, hardware, industrial, and related products with dealers, contractors, businesses, and customers across Sri Lanka.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/shop" className="ripple-btn inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-400">Explore products</Link>
                  <Link href="#services" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">Discover our services</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Reliable supply</p>
                    <p className="mt-2 text-base text-slate-200">Quality products for growing businesses.</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Local focus</p>
                    <p className="mt-2 text-base text-slate-200">Professional service across Sri Lanka.</p>
                  </div>
                </div>
              </div>

              
              <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-slate-900 shadow-[0_40px_120px_rgba(2,8,23,0.45)]">
                <div className="relative h-[560px] w-full overflow-hidden">
                  {displayHeroSlides.map((slide, index) => (
                    <img
                      key={slide.id || index}
                      src={normalizeImageUrl(slide.image)}
                      alt={slide.title || `Hero image ${index + 1}`}
                      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                        index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-hidden={index !== currentHeroIndex}
                    />
                  ))}
                </div>

                {displayHeroSlides.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + displayHeroSlides.length) % displayHeroSlides.length)}
                      className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white backdrop-blur transition hover:bg-blue-500"
                      aria-label="Previous slide"
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % displayHeroSlides.length)}
                      className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white backdrop-blur transition hover:bg-blue-500"
                      aria-label="Next slide"
                    >
                      ❯
                    </button>
                    <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                      {displayHeroSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHeroIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentHeroIndex ? 'bg-blue-400 w-8' : 'bg-slate-400/40 w-2 hover:bg-slate-400/60'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute inset-x-6 bottom-6 rounded-[32px] border border-white/15 bg-slate-950/75 p-6 text-sm shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-col gap-4 text-white sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">Featured selection</p>
                      <p className="mt-2 text-base font-bold line-clamp-2">{activeHero?.title || 'Reliable products for the work ahead'}</p>
                    </div>
                    <Link href={activeHero?.link || '/shop'} className="inline-flex w-max items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-400">View selection</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-title fade-up mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Browse Categories</p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-900">Explore premium categories for every project</h2>
            </div>
                <p className="max-w-xl text-sm leading-6 text-slate-600">From power tools to garden gear, shop categories built for productivity, safety, and quality.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {categoryDisplay.map((card) => (
              <CategoryCard key={card.slug || card.title} card={card} />
            ))}
          </div>
        </section>

        <section id="services" className="fade-up bg-[#0b1626] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">What we do</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Services built around reliable supply.</h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-slate-300">From manufacturing and importing to nationwide distribution, Infix Industries connects quality products with the people and businesses that depend on them.</p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {serviceCards.map((service) => (
                <SpotlightCard key={service.title} className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1" spotlightColor="rgba(96, 165, 250, 0.24)">
                  <div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl text-white transition duration-300 hover:rotate-6">{service.icon}</span><span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{service.eyebrow}</span></div>
                  <h3 className="mt-8 text-2xl font-semibold text-white">{service.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{service.text}</p>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="fade-up px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[40px] bg-slate-950 p-8 text-white shadow-[0_40px_100px_rgba(15,23,42,0.18)] sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Events & updates</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Growing together, one connection at a time.</h2>
                <p className="mt-5 text-base leading-8 text-slate-300">Stay close to the conversations, product developments, and partnerships shaping the next chapter of Infix Industries.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {eventCards.map((event) => (
                  <SpotlightCard key={event.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1" spotlightColor="rgba(34, 211, 238, 0.2)">
                    <span className="text-sm font-semibold text-blue-300">{event.date}</span>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{event.label}</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{event.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{event.text}</p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-4">
              {trustCards.map((card) => (
                <div key={card.title} className="rounded-[32px] border border-slate-200 bg-white p-6 text-slate-900 transition hover:-translate-y-1 hover:border-blue-300/30 hover:shadow-[0_30px_80px_rgba(96,165,250,0.08)]"> 
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-400 text-white text-xl">{card.icon}</div>
                  <h3 className="mt-6 text-xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fade-up px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Best Sellers</p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-900">Top selling hardware products</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleBestScroll('left')}
                  className="rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => handleBestScroll('right')}
                  className="rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[32px] border border-slate-300 bg-white p-5">
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
              <div ref={bestSellersRef} className="best-sellers-slider flex gap-6 overflow-x-auto pb-4 pr-6 scroll-smooth">
                {Array.from({ length: 2 }).flatMap(() => currentBestSellers).map((item, index) => (
                  <div key={`${item.slug || item.title}-${index}`} className="min-w-[280px] max-w-[280px] rounded-[26px] bg-slate-50 p-4 shadow-[0_28px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(15,23,42,0.12)]">
                    <div className="overflow-hidden rounded-[26px] bg-slate-200">
                      <img src={normalizeImageUrl(item.image)} alt={item.title} loading="lazy" decoding="async" className="h-52 w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{item.brand}</span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Best seller</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-blue-400">★★★★☆</div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xl font-semibold text-slate-900">{formatMoney(item.price)}</span>
                        <button className="rounded-full bg-blue-400 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95">Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Top Brands</p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-900">Trusted professional brands</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-slate-600">Shop top manufacturers with premium product selection and rapid shipping.</p>
            </div>
            <div className="brand-marquee relative overflow-hidden rounded-[32px] border border-slate-300 bg-white/70 py-6">
              <div className="animate-scrollBrands flex items-center gap-8 px-6">
                {brandLogos.concat(brandLogos).map((brand, index) => (
                  <div key={`${brand}-${index}`} className="flex min-w-[150px] items-center justify-center rounded-3xl bg-white p-5 text-center text-sm uppercase tracking-[0.24em] text-slate-600 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">{brand}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up bg-[#f4f8fc] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">How we work</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">From a clear need to dependable supply.</h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-slate-600">Our approach is practical and partnership-led: understand what matters, build or source with care, then deliver solutions people can rely on.</p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {processSteps.map((step) => (
                <article key={step.number} className="group rounded-[32px] border border-blue-100 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_30px_80px_rgba(37,99,235,0.12)]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white transition duration-300 group-hover:rotate-6">{step.number}</span>
                  <h3 className="mt-8 text-2xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="fade-up px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Frequently asked</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">A clearer way to get started.</h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">Have a question about our products, services, or partnerships? Start here, then reach out when you are ready.</p>
            </div>
            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={item.question} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-slate-950 transition hover:bg-slate-50">
                      <span>{item.question}</span>
                      <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-700 transition ${isOpen ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden"><p className="px-6 pb-6 text-sm leading-7 text-slate-600">{item.answer}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="fade-up px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-[0_40px_100px_rgba(37,99,235,0.25)] sm:p-12 lg:p-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">Let&apos;s build what&apos;s next</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Ready to find a more dependable way forward?</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-blue-50">Talk to Infix Industries about products, supply, distribution, or your next business partnership.</p>
              </div>
              <Link href="/contact" className="inline-flex w-max items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-semibold text-blue-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50">Talk to our team</Link>
            </div>
          </div>
        </section>

        <section className="fade-up px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[36px] border border-slate-300 bg-white p-8 shadow-[0_40px_120px_rgba(15,23,42,0.08)]">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Customer Reviews</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">Trusted by pros and serious DIYers</h2>
              <div className="mt-8 rounded-[28px] bg-slate-50 p-6">
                <div className="flex items-center gap-4">
                  <img src={normalizeImageUrl(testimonials[activeTestimonial].image)} alt={testimonials[activeTestimonial].name} loading="lazy" decoding="async" className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-slate-600">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <div className="mt-6 text-lg leading-8 text-slate-600">"{ testimonials[activeTestimonial].review}"</div>
                <div className="mt-6 flex items-center gap-3 text-blue-400">
                  {Array.from({ length: Math.round(testimonials[activeTestimonial].rating) }).map((_, index) => (<span key={index}>★</span>))}
                  <span className="text-sm text-slate-600">Verified purchase</span>
                </div>
                <div className="mt-6 flex gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveTestimonial(index)}
                      className={`h-3 w-3 rounded-full transition ${activeTestimonial === index ? 'bg-blue-400' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-[36px] border border-slate-300 bg-white p-8 shadow-[0_40px_120px_rgba(15,23,42,0.08)]">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-400">Newsletter</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">Subscribe for exclusive offers</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">Be first to receive new arrivals, special discounts and premium hardware insights.</p>
              <form className="mt-8 flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-slate-300 bg-white px-6 py-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                />
                <Link href="/contact" className="ripple-btn rounded-full bg-blue-400 px-8 py-4 text-sm font-semibold text-white transition hover:brightness-95">Subscribe</Link>
              </form>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

