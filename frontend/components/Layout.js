import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import BrandLogo from './BrandLogo'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
]

const defaultCategoryCards = [
  { title: 'Power Tools', count: '1.2k' },
  { title: 'Hand Tools', count: '980' },
  { title: 'Building Materials', count: '720' },
  { title: 'Plumbing', count: '540' },
  { title: 'Electrical', count: '860' },
  { title: 'Lighting', count: '430' }
]

export default function Layout({ children }) {
  const { user } = React.useContext(AuthContext) || {}
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hideHeader, setHideHeader] = useState(false)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const lastScrollY = useRef(0)
  const scrollFrame = useRef(null)

  useEffect(() => {
    const getScrollY = () => {
      return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0
    }

    const updateHeader = () => {
      const currentY = getScrollY()
      setScrolled(currentY > 12)

      const scrollDelta = currentY - lastScrollY.current
      const hideThreshold = 8

      if (scrollDelta > hideThreshold && currentY > 80) {
        setHideHeader(true)
      } else if (scrollDelta < -hideThreshold || currentY < 22) {
        setHideHeader(false)
      }

      lastScrollY.current = currentY
    }

    const handleScroll = () => {
      if (scrollFrame.current) return
      scrollFrame.current = window.requestAnimationFrame(() => {
        scrollFrame.current = null
        updateHeader()
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    lastScrollY.current = getScrollY()
    updateHeader()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setMegaOpen(false)
  }, [router.pathname])

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

    async function loadCategories() {
      try {
        const res = await axios.get(`${API}/home/categories`)
        if (Array.isArray(res.data) && res.data.length) {
          setCategories(res.data)
        }
      } catch (err) {
        console.warn('Failed to load categories in header', err)
      }
    }

    loadCategories()
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const isActiveLink = (href) => router.pathname === href || (href === '/shop' && router.pathname.startsWith('/shop'))
  const submitSearch = (event) => {
    event.preventDefault()
    const query = {}
    if (searchTerm.trim()) query.q = searchTerm.trim()
    if (searchCategory) query.category = searchCategory
    router.push({ pathname: '/shop', query })
  }

  const headerBgDark = scrolled ? 'var(--header-bg-strong-dark)' : 'var(--header-bg-dark)'

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl header-dark"
        style={{
          backgroundColor: headerBgDark,
          borderColor: 'var(--border)',
          transform: hideHeader ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
          transition: 'transform .38s cubic-bezier(.22, 1, .36, 1), background-color .3s ease',
          willChange: 'transform'
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-300">
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-200">Free delivery on orders over $99</span>
            <span className="hidden sm:inline-flex text-slate-400">Call us: +94 74 085 8726</span>
            <span className="hidden md:inline-flex text-slate-400">24/7 support · Secure checkout</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative flex min-h-12 items-center justify-center gap-4 lg:min-h-0 lg:flex-row lg:items-center lg:justify-between">
              <Link href="/" className="flex items-center justify-center" onClick={closeMenu}>
                <BrandLogo className="h-12 w-[190px] sm:h-16 sm:w-[260px] lg:h-20 lg:w-[320px]" />
              </Link>

              {/* Desktop action buttons */}
              <div className="hidden lg:flex flex-wrap items-center gap-2 text-sm text-slate-200 lg:gap-3">
                <Link href="/shop?view=wishlist" className="rounded-full border border-slate-800/70 bg-slate-950/80 px-3 py-2 text-slate-100 transition hover:border-sky-400 hover:text-white" onClick={closeMenu}>Wishlist</Link>
                <Link href="/shop?view=compare" className="rounded-full border border-slate-800/70 bg-slate-950/80 px-3 py-2 text-slate-100 transition hover:border-sky-400 hover:text-white" onClick={closeMenu}>Compare</Link>
                <Link href="/cart" className="relative rounded-full bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110" onClick={closeMenu}>
                  Cart
                  <span className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-sky-300">3</span>
                </Link>
              </div>

              {/* Single mobile navigation toggle */}
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((state) => !state)}
                className="absolute right-0 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-slate-800/70 bg-[#0b1220] p-2 text-slate-100 hover:border-sky-400 lg:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  {mobileMenuOpen ? (
                    <>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <form onSubmit={submitSearch} className="w-full rounded-[24px] border border-slate-800/70 bg-slate-950/80 p-3 shadow-[0_30px_60px_rgba(0,0,0,0.35)] sm:rounded-full">
              <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] items-center">
                <div className="relative min-w-0">
                  <select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)} className="w-full appearance-none rounded-full bg-[#101b2b] py-3 pl-4 pr-10 text-sm text-slate-100 outline-none">
                    <option value="">All Categories</option>
                    {(categories.length ? categories : defaultCategoryCards).map((category) => (
                      <option key={category.slug || category.title} value={category.slug || category.title}>{category.name || category.title}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">▾</span>
                </div>
                <div className="min-w-0">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search tools, safety gear, electrical supplies..."
                    className="w-full rounded-full bg-[#101b2b] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <button type="submit" className="rounded-full bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                  Search
                </button>
              </div>
            </form>

          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#0b1220] px-4 py-3 text-sm text-slate-100 transition hover:border-sky-400"
                onClick={() => setMegaOpen((state) => !state)}
              >
                Categories
                <span className="text-sky-300">▾</span>
              </button>
              <div className="flex flex-wrap items-center gap-2 rounded-full bg-[#0b1220] px-3 py-2 text-xs uppercase tracking-[0.28em] text-slate-400 sm:gap-3">
                <span className="rounded-full bg-slate-950 px-3 py-2 text-sky-300">Fast support</span>
                <span className="rounded-full bg-slate-950 px-3 py-2 text-sky-300">Pro service</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <nav className="hidden lg:flex w-full overflow-x-auto text-sm">
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeMenu} className={`rounded-full px-4 py-3 transition ${isActiveLink(link.href) ? 'bg-sky-100/20 text-sky-300' : 'text-slate-300 hover:bg-slate-950 hover:text-white'}`}>
                      {link.label}
                    </Link>
                  ))}
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="rounded-full border border-sky-200 px-4 py-3 text-sm text-sky-700 transition hover:bg-sky-50" onClick={closeMenu}>Admin</Link>
                  )}
                  {user && user.role !== 'admin' && (
                    <Link href="/dashboard" className="rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-sky-400 hover:text-slate-900" onClick={closeMenu}>Dashboard</Link>
                  )}
                </div>
              </nav>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 rounded-[24px] border border-slate-800/50 bg-[#0b1220]/95 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => { closeMenu(); setMobileMenuOpen(false); }} className={`block rounded-full px-4 py-3 text-sm transition ${isActiveLink(link.href) ? 'bg-sky-100/20 text-sky-300' : 'text-slate-300 hover:bg-slate-950 hover:text-white'}`}>
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/shop?view=wishlist" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-slate-800/70 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 transition hover:border-sky-400 hover:text-white">Wishlist</Link>
                  <Link href="/shop?view=compare" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-slate-800/70 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 transition hover:border-sky-400 hover:text-white">Compare</Link>
                  <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="relative rounded-full bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                    Cart
                    <span className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-sky-300">3</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {megaOpen && (
            <div className="mega-menu mt-3 rounded-[32px] border border-slate-800/50 bg-[#0b1220]/95 p-6 shadow-[0_40px_100px_rgba(0,0,0,0.18)]">
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.5fr_1fr]">
                <div className="grid gap-4 sm:grid-cols-2">
                  {(categories.length ? categories : defaultCategoryCards).map((card) => (
                    <div key={card.slug || card.title} className="rounded-3xl bg-[#101b2b] p-4 border border-slate-800/70">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-sky-700">{card.count ? `${card.count}+ products` : 'Shop collection'}</p>
                          <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.name || card.title}</h3>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-xl text-sky-700">{(card.name || card.title)?.[0]}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[30px] border border-slate-800/50 bg-[#08111f] p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Featured categories</p>
                  <h3 className="mt-4 text-3xl font-semibold text-slate-100">Shop by industry and product family</h3>
                  <p className="mt-4 text-sm text-slate-400">Browse premium hardware categories with curated deals for professionals and homeowners.</p>
                  <div className="mt-6 space-y-3">
                    <Link href="/shop" className="inline-flex rounded-full bg-gradient-to-r from-[#0b4d97] to-[#35b7ff] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110" onClick={closeMenu}>View All Categories</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="page-fade bg-[var(--bg)]">{children}</main>
    </div>
  )
}
