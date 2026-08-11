import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { normalizeImageUrl } from '../lib/imageUrl'
import { useAuth } from '../hooks/useAuth'

const defaultCategoryCards = [
  { title: 'Power Tools', count: 1280, image: 'https://images.unsplash.com/photo-1511909525234-0fca0376b1d0?auto=format&fit=crop&w=900&q=80' },
  { title: 'Hand Tools', count: 980, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80' },
  { title: 'Building Materials', count: 720, image: 'https://images.unsplash.com/photo-1518622358389-37e9fe4c61c1?auto=format&fit=crop&w=900&q=80' },
  { title: 'Plumbing', count: 540, image: 'https://images.unsplash.com/photo-1563805042-7684bfb4a1c1?auto=format&fit=crop&w=900&q=80' },
  { title: 'Electrical', count: 860, image: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe8?auto=format&fit=crop&w=900&q=80' },
  { title: 'Lighting', count: 430, image: 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=900&q=80' },
  { title: 'Paint', count: 610, image: 'https://images.unsplash.com/photo-1545235617-87c8d5e1dda1?auto=format&fit=crop&w=900&q=80' },
  { title: 'Hardware', count: 1100, image: 'https://images.unsplash.com/photo-1585386959984-a4155226e4d7?auto=format&fit=crop&w=900&q=80' },
  { title: 'Garden', count: 490, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
  { title: 'Safety Equipment', count: 720, image: 'https://images.unsplash.com/photo-1519305121506-0f7edf0c44a8?auto=format&fit=crop&w=900&q=80' },
  { title: 'Fasteners', count: 530, image: 'https://images.unsplash.com/photo-1608670040986-42f39d1c0e09?auto=format&fit=crop&w=900&q=80' },
  { title: 'Water Pumps', count: 410, image: 'https://images.unsplash.com/photo-1511381939415-10256efb4732?auto=format&fit=crop&w=900&q=80' }
]

const defaultFeaturedProducts = [
  {
    brand: 'DeWalt',
    title: 'XR Brushless Hammer Drill',
    rating: 4.9,
    reviews: 178,
    stock: 'In stock',
    price: 229,
    oldPrice: 319,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1570818120229-3b79e4d4c70a?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Bosch',
    title: 'Pro Impact Driver Kit',
    rating: 4.8,
    reviews: 134,
    stock: 'Only 12 left',
    price: 189,
    oldPrice: 249,
    discount: 24,
    image: 'https://images.unsplash.com/photo-1543791180-1f5f953e5adc?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Makita',
    title: 'Cordless Circular Saw',
    rating: 4.7,
    reviews: 104,
    stock: 'In stock',
    price: 199,
    oldPrice: 269,
    discount: 26,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Stanley',
    title: 'Precision Tool Set',
    rating: 4.6,
    reviews: 89,
    stock: 'In stock',
    price: 79,
    oldPrice: 109,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1515777315835-281b94c9584d?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Philips',
    title: 'Premium Lighting Kit',
    rating: 4.8,
    reviews: 142,
    stock: 'Limited stock',
    price: 129,
    oldPrice: 179,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Total',
    title: 'Commercial Grade Wrench Set',
    rating: 4.7,
    reviews: 97,
    stock: 'In stock',
    price: 99,
    oldPrice: 139,
    discount: 29,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Yale',
    title: 'Security Lock Bundle',
    rating: 4.9,
    reviews: 215,
    stock: 'Only 8 left',
    price: 64,
    oldPrice: 89,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80'
  },
  {
    brand: 'Ingco',
    title: 'Heavy-Duty Angle Grinder',
    rating: 4.7,
    reviews: 118,
    stock: 'In stock',
    price: 109,
    oldPrice: 149,
    discount: 27,
    image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80'
  }
]

const promoBanners = [
  {
    title: 'Power Tools Sale',
    description: 'Save up to 35% on premium drills, drivers, and compressors.',
    badge: 'Up to 35% OFF',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    cta: 'Shop Power'
  },
  {
    title: 'Building Materials',
    description: 'Trusted quality timber, hardware and masonry essentials.',
    badge: 'Build Better',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    cta: 'Explore Building'
  },
  {
    title: 'Electrical Essentials',
    description: 'High-performance cabling, switches and safety components.',
    badge: 'Electrify Deals',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c39?auto=format&fit=crop&w=900&q=80',
    cta: 'Browse Electrical'
  },
  {
    title: 'Garden Collection',
    description: 'Durable outdoor tools, irrigation and landscape supplies.',
    badge: 'Fresh Outdoors',
    image: 'https://images.unsplash.com/photo-1495688734822-86f1574fa6b6?auto=format&fit=crop&w=900&q=80',
    cta: 'Shop Garden'
  }
]

const defaultBestSellers = [
  { title: 'Premium Drill Set', brand: 'DeWalt', price: 219, image: 'https://images.unsplash.com/photo-1581091870620-6501c8a508f3?auto=format&fit=crop&w=900&q=80' },
  { title: 'Concrete Mixer', brand: 'Bosch', price: 449, image: 'https://images.unsplash.com/photo-1519861158037-8d1e82ac5a16?auto=format&fit=crop&w=900&q=80' },
  { title: 'Paint Roller Kit', brand: 'Nippon Paint', price: 39, image: 'https://images.unsplash.com/photo-1582571357191-5c0f77625b2f?auto=format&fit=crop&w=900&q=80' },
  { title: 'High-Flow Pipe Set', brand: 'Total', price: 89, image: 'https://images.unsplash.com/photo-1534204604390-1dbea4a128d6?auto=format&fit=crop&w=900&q=80' },
  { title: 'Outdoor Hedge Trimmer', brand: 'Makita', price: 129, image: 'https://images.unsplash.com/photo-1518977956816-bb3e7f8a08ec?auto=format&fit=crop&w=900&q=80' },
  { title: 'Smart LED Panel', brand: 'Philips', price: 79, image: 'https://images.unsplash.com/photo-1542444459-dee0893bfd27?auto=format&fit=crop&w=900&q=80' }
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

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1 text-yellow-400 text-xs">
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
    <article className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[#111111] shadow-[0_24px_60px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
      <img src={normalizeImageUrl(image)} alt={title} loading="lazy" decoding="async" className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-black/40 to-transparent opacity-95" />
      <div className="absolute inset-x-6 bottom-6 text-white">
        <span className="text-sm uppercase tracking-[0.26em] text-yellow-300/90">{label}</span>
        <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      </div>
    </article>
  )
}

function ProductCard({ item }) {
  const { token } = useAuth()
  const [adding, setAdding] = useState(false)
  const API = process.env.NEXT_PUBLIC_API_URL || '/api'
  const productId = item.id || item.product_id
  const productHref = item.slug ? `/product/${item.slug}` : '/shop'

  const handleAddToCart = async () => {
    setAdding(true)
    try {
      if (token && productId) {
        await axios.post(`${API}/cart`, { product_id: productId, quantity: 1 }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        const cartKey = item.slug || item.title
        const existing = cart.find((cartItem) => (
          (productId && cartItem.productId === productId) ||
          (!productId && cartItem.slug === cartKey)
        ))

        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1
        } else {
          cart.push({
            productId,
            slug: item.slug || cartKey.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: item.title,
            price: item.discount_price || item.price,
            image: item.image,
            quantity: 1
          })
        }

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
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0f0f] shadow-[0_28px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_35px_95px_rgba(0,0,0,0.35)]">
      <div className="relative overflow-hidden image-mask">
        <img src={normalizeImageUrl(item.image)} alt={item.title} loading="lazy" decoding="async" className="h-56 w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
          <span className="rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-yellow-300">{item.brand}</span>
          <span className="rounded-full bg-yellow-400/95 px-3 py-1 text-xs font-semibold text-black">-{item.discount}%</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <StarRating value={item.rating} />
              <span>{item.reviews} reviews</span>
            </div>
          </div>
          <Link href="/shop?view=wishlist" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 transition hover:bg-yellow-400 hover:text-black">♥</Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">{item.stock}</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-white">${item.price}</p>
            <p className="text-sm text-gray-500 line-through">${item.oldPrice}</p>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <Link href={productHref} className="inline-flex min-w-[116px] items-center justify-center whitespace-nowrap rounded-full border border-sky-400/50 bg-sky-400/10 px-3 py-2 text-sm font-semibold text-sky-300 shadow-[0_10px_24px_rgba(14,165,233,0.12)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-400 hover:text-slate-950">
              View Product
            </Link>
            <button type="button" onClick={handleAddToCart} disabled={adding} className="inline-flex min-w-[68px] items-center justify-center whitespace-nowrap rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_25px_rgba(250,204,21,0.25)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
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
        { image: 'https://images.unsplash.com/photo-1515263487990-61e7be6d2782?auto=format&fit=crop&w=900&q=80' },
        { image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80' },
        { image: 'https://images.unsplash.com/photo-1525286116112-b59af11adad1?auto=format&fit=crop&w=900&q=80' },
        { image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80' }
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
  const featuredColumns = useMemo(() => (featuredProducts.length ? featuredProducts : defaultFeaturedProducts).slice(0, 8), [featuredProducts])

  return (
    <div className="bg-[var(--bg)] text-[var(--text)]" ref={containerRef}>
      <Head>
        <title>Premium Hardware Store</title>
        <meta name="description" content="Premium hardware marketplace with fast search, curated tools, and trusted brands." />
      </Head>

      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
        <div className="h-full bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <main>
        <section className="relative overflow-visible border-b border-white/10 bg-[#070707] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div className="space-y-8">
                <div>
                  <span className="inline-flex items-center rounded-full bg-yellow-400/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-yellow-300">Industrial premium hardware</span>
                  <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Premium tools, trusted brands, and industrial-grade performance.</h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400">Build smarter with a curated marketplace of power tools, construction essentials, and professional-grade hardware designed for speed, reliability, and safety.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="/shop" className="ripple-btn inline-flex items-center justify-center rounded-full bg-yellow-400 px-8 py-3 text-sm font-semibold text-black shadow-lg transition hover:brightness-95">Shop Now</Link>
                  <Link href="#promo" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/20">Learn More</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-[#121212]/80 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Free delivery</p>
                    <p className="mt-2 text-base text-white">Fast shipping across the country.</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#121212]/80 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Pro assurance</p>
                    <p className="mt-2 text-base text-white">Genuine tools and expert service.</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#121212]/80 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Easy returns</p>
                    <p className="mt-2 text-base text-white">Hassle-free exchanges within 30 days.</p>
                  </div>
                </div>
              </div>

              
              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#111111] shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
                <div className="relative h-[560px] w-full overflow-hidden">
                  {heroSlides.map((slide, index) => (
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

                {heroSlides.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                      className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Previous slide"
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                      className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Next slide"
                    >
                      ❯
                    </button>
                    <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                      {heroSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHeroIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentHeroIndex ? 'bg-yellow-400 w-8' : 'bg-white/40 w-2 hover:bg-white/60'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute inset-x-6 bottom-6 rounded-[32px] border border-white/10 bg-black/80 p-6 text-sm shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-col gap-4 text-white">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-yellow-300 font-semibold">Best-selling pick</p>
                      <p className="mt-2 text-base font-bold line-clamp-2">{activeHero?.title}</p>
                    </div>
                    <Link href={activeHero?.link || '/shop'} className="inline-flex w-max items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:brightness-95">Shop Deal</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-title fade-up mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Browse Categories</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">Explore premium categories for every project</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-400">From power tools to garden gear, shop categories built for productivity, safety, and quality.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {categoryDisplay.map((card) => (
              <CategoryCard key={card.slug || card.title} card={card} />
            ))}
          </div>
        </section>

        <section id="featured-products" className="fade-up bg-[#080808] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Featured Products</p>
                <h2 className="mt-3 text-4xl font-semibold text-white">Premium gear built for performance</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">High-performance tools and accessories designed for serious projects, dependable results, and lasting value.</p>
              </div>
              <Link href="/shop" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-200 transition hover:bg-yellow-400 hover:text-black">View full catalog</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {featuredColumns.map((item) => (
                <ProductCard key={`${item.slug || item.title}`} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section id="promo" className="fade-up mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Promotions</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">Seasonal offers for premium projects</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-400">Curated deals on top brands and essential equipment for every workflow.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            {promoBanners.map((promo) => (
              <article key={promo.title} className="group relative overflow-hidden rounded-[36px] bg-[#111111] shadow-[0_30px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:shadow-[0_35px_100px_rgba(0,0,0,0.35)]">
                <img src={normalizeImageUrl(promo.image)} alt={promo.title} loading="lazy" decoding="async" className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="relative p-6">
                  <span className="rounded-full bg-yellow-400/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-black">{promo.badge}</span>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{promo.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">{promo.description}</p>
                  <Link href={`/shop?category=${encodeURIComponent(promo.title.replace(/\s+/g, ' '))}`} className="mt-6 inline-flex rounded-full bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95">{promo.cta}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fade-up bg-[#0b0b0b] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-4">
              {trustCards.map((card) => (
                <div key={card.title} className="rounded-[32px] border border-white/10 bg-[#111111] p-6 text-white transition hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-[0_30px_80px_rgba(255,199,0,0.12)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-yellow-400 text-black text-xl">{card.icon}</div>
                  <h3 className="mt-6 text-xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{card.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fade-up px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Best Sellers</p>
                <h2 className="mt-3 text-4xl font-semibold text-white">Top selling hardware products</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleBestScroll('left')}
                  className="rounded-full border border-white/10 bg-[#111111] p-3 text-white transition hover:bg-white/10"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => handleBestScroll('right')}
                  className="rounded-full border border-white/10 bg-[#111111] p-3 text-white transition hover:bg-white/10"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111111]/60 p-5">
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#090909] to-transparent" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#090909] to-transparent" />
              <div ref={bestSellersRef} className="best-sellers-slider flex gap-6 overflow-x-auto pb-4 pr-6 scroll-smooth">
                {Array.from({ length: 2 }).flatMap(() => currentBestSellers).map((item, index) => (
                  <div key={`${item.slug || item.title}-${index}`} className="min-w-[280px] max-w-[280px] rounded-[26px] bg-[#111111] p-4 shadow-[0_28px_60px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(0,0,0,0.32)]">
                    <div className="overflow-hidden rounded-[26px] bg-[#0a0a0a]">
                      <img src={normalizeImageUrl(item.image)} alt={item.title} loading="lazy" decoding="async" className="h-52 w-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{item.brand}</span>
                        <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-300">Best seller</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-yellow-300">★★★★☆</div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xl font-semibold text-white">${item.price}</span>
                        <button className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95">Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up bg-[#090909] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Top Brands</p>
                <h2 className="mt-3 text-4xl font-semibold text-white">Trusted professional brands</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-gray-400">Shop top manufacturers with premium product selection and rapid shipping.</p>
            </div>
            <div className="brand-marquee relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111111]/60 py-6">
              <div className="animate-scrollBrands flex items-center gap-8 px-6">
                {brandLogos.concat(brandLogos).map((brand, index) => (
                  <div key={`${brand}-${index}`} className="flex min-w-[150px] items-center justify-center rounded-3xl bg-[#090909] p-5 text-center text-sm uppercase tracking-[0.24em] text-gray-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">{brand}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[36px] border border-white/10 bg-[#111111] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Customer Reviews</p>
              <h2 className="mt-4 text-4xl font-semibold text-white">Trusted by pros and serious DIYers</h2>
              <div className="mt-8 rounded-[28px] bg-[#090909] p-6">
                <div className="flex items-center gap-4">
                  <img src={normalizeImageUrl(testimonials[activeTestimonial].image)} alt={testimonials[activeTestimonial].name} loading="lazy" decoding="async" className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <p className="text-xl font-semibold text-white">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-gray-400">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <div className="mt-6 text-lg leading-8 text-gray-300">“{testimonials[activeTestimonial].review}”</div>
                <div className="mt-6 flex items-center gap-3 text-yellow-400">
                  {Array.from({ length: Math.round(testimonials[activeTestimonial].rating) }).map((_, index) => (<span key={index}>★</span>))}
                  <span className="text-sm text-gray-400">Verified purchase</span>
                </div>
                <div className="mt-6 flex gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveTestimonial(index)}
                      className={`h-3 w-3 rounded-full transition ${activeTestimonial === index ? 'bg-yellow-400' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-[36px] border border-white/10 bg-[#111111] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.4)]">
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">Newsletter</p>
              <h2 className="mt-4 text-4xl font-semibold text-white">Subscribe for exclusive offers</h2>
              <p className="mt-4 text-sm leading-6 text-gray-400">Be first to receive new arrivals, special discounts and premium hardware insights.</p>
              <form className="mt-8 flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-white/10 bg-[#0b0b0b] px-6 py-4 text-sm text-white outline-none transition focus:border-yellow-400"
                />
                <Link href="/contact" className="ripple-btn rounded-full bg-yellow-400 px-8 py-4 text-sm font-semibold text-black transition hover:brightness-95">Subscribe</Link>
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-[#090909] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-4">
            <div>
              <h3 className="text-xl font-semibold text-white">HardPro</h3>
              <p className="mt-4 text-sm leading-6 text-gray-400">Premium hardware marketplace with fast checkout, authentic brands, and expert service for every build.</p>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-[0.3em] text-yellow-300">Company</h4>
              <ul className="mt-5 space-y-3 text-sm text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/about">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-[0.3em] text-yellow-300">Quick Links</h4>
              <ul className="mt-5 space-y-3 text-sm text-gray-400">
                <li><Link href="/shop">Shop</Link></li>
                <li><Link href="/shop?view=brands">Brands</Link></li>
                <li><Link href="/shop">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-[0.3em] text-yellow-300">Contact</h4>
              <p className="mt-5 text-sm leading-6 text-gray-400">103/3 farm road<br />Dalupotha, Negombo<br />+94 74 085 8726<br />info@infix.lk</p>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-gray-500 sm:flex-row">
            <p>© {new Date().getFullYear()} HardPro. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>PayPal</span>
              <span>Apple Pay</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

