"use client"

import React, { useEffect, useRef, useState } from "react"
import type { JSX } from "react"
import Link from "next/link"
import "./Servicessection.css"

/* ───────────────── TYPES ───────────────── */
interface Service {
  id: string
  num: string
  title: string
  bullets: string[]
  result: string
  images: string[]
  accent: string
  bg: string
  href: string
}

/* ───────────────── CONFIG ───────────────── */
const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "")
const COLLECTIONS_PAGE = "/collections" // ⬅ the page the button navigates to
const ACCENTS = ["#7B4BA0", "#9B6CC0"]
const BGS = ["#ffffff", "#f3eef8"]

const PAGE_LIMIT = 100 // items requested per page
const MAX_PAGES = 50 // safety cap

const MAX_STACK_PEEK = 3 // how many cards peek out behind the top one (keeps the stack small with many categories)

/* ───────────────── RESPONSIVE LAYOUT ─────────────────
   wide   (≥1200px)  : title on the left, stacked scroll cards on the right (original design)
   medium (900–1199) : title on top, stacked scroll cards below (card height adapts to the screen)
   list   (<900px, or very short screens such as a phone turned sideways)
          : normal vertical list of cards — no scroll-jacking, easy on touch devices */
type Mode = "wide" | "medium" | "list"

interface StackCfg {
  cardH: number
  offset: number
  entry: number
  scrollPx: number
  media: number
}

const WIDE_CFG: StackCfg = { cardH: 550, offset: 28, entry: 520, scrollPx: 520, media: 340 }
const mediumCfg = (vh: number): StackCfg => ({
  cardH: Math.max(340, Math.min(440, vh - 260)),
  offset: 20,
  entry: 420,
  scrollPx: 440,
  media: 280,
})

function useLayout(): { mode: Mode | null; vh: number } {
  const [state, setState] = useState<{ mode: Mode | null; vh: number }>({ mode: null, vh: 800 })

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const mode: Mode = w < 900 || h < 520 ? "list" : w < 1200 ? "medium" : "wide"
      setState((p) => (p.mode === mode && Math.abs(p.vh - h) < 40 ? p : { mode, vh: h }))
    }
    calc()
    window.addEventListener("resize", calc)
    window.addEventListener("orientationchange", calc)
    return () => {
      window.removeEventListener("resize", calc)
      window.removeEventListener("orientationchange", calc)
    }
  }, [])

  return state
}

/* ───────────────── API HELPERS ───────────────── */
// Handles [..] or { data: [..] } or { data: { categories: [..] } } or { categories: [..] } / { products: [..] }
const toArray = (res: any): any[] => {
  if (Array.isArray(res)) return res
  const candidates = [
    res?.data,
    res?.data?.categories,
    res?.data?.products,
    res?.categories,
    res?.products,
  ]
  for (const c of candidates) if (Array.isArray(c)) return c
  return []
}

// Fetches EVERY page of an endpoint (also works when the API has no pagination)
async function fetchAll(endpoint: string): Promise<any[]> {
  const all: any[] = []
  let page = 1
  let totalPages = 1

  do {
    const res = await fetch(`${API}${endpoint}?page=${page}&limit=${PAGE_LIMIT}`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`${endpoint} failed (${res.status})`)
    const json = await res.json()

    all.push(...toArray(json))

    const meta = json?.pagination ?? json?.meta ?? json
    totalPages = Number(meta?.totalPages ?? meta?.pages ?? 1) || 1
    page++
  } while (page <= totalPages && page <= MAX_PAGES)

  // Remove duplicates in case the API ignored the page parameter
  return Array.from(new Map(all.map((x, i) => [x?._id ?? `i-${i}`, x])).values())
}

// Handles "uploads/x.jpg", "/uploads/x.jpg", full URLs, or { url } objects
const imgUrl = (img: any): string => {
  const u: string = typeof img === "string" ? img : img?.url ?? img?.path ?? ""
  if (!u) return ""
  return /^(https?:|data:)/.test(u) ? u : `${API}/${u.replace(/^\/+/, "")}`
}

const norm = (s: any): string => String(s ?? "").trim().toLowerCase()

// product.category can be an id, a category name, or a populated object
const belongsTo = (p: any, cat: any): boolean => {
  const raw = p?.category
  const candidates = [raw?._id, raw?.name, raw?.slug, typeof raw === "string" ? raw : undefined]
    .map(norm)
    .filter(Boolean)
  return candidates.some(
    (c) => c === norm(cat._id) || c === norm(cat.name) || c === norm(cat.slug)
  )
}

// Primary image first, then the rest
const productImages = (p: any): string[] => {
  const imgs: any[] = p?.images ?? []
  const sorted = [...imgs].sort((a, b) => Number(!!b?.isPrimary) - Number(!!a?.isPrimary))
  return sorted.map(imgUrl).filter(Boolean)
}

async function fetchServices(): Promise<Service[]> {
  const [catList, products] = await Promise.all([
    fetchAll("/api/categories"),
    fetchAll("/api/products"),
  ])

  // ALL active categories, in the admin's order
  const categories = catList
    .filter((c) => c?.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return categories.map((cat, i) => {
    const catProducts = products.filter((p) => belongsTo(p, cat))

    // Carousel: category image first, then product images (max 6, de-duplicated)
    const images = Array.from(
      new Set([imgUrl(cat.image), ...catProducts.flatMap(productImages)].filter(Boolean))
    ).slice(0, 6)

    return {
      id: String(cat._id ?? cat.slug ?? i),
      num: String(i + 1).padStart(2, "0"),
      title: cat.name,
      bullets: catProducts.slice(0, 3).map((p) => p.name ?? p.title).filter(Boolean),
      result:
        cat.description ||
        `${catProducts.length} product${catProducts.length === 1 ? "" : "s"} in this collection.`,
      images,
      accent: ACCENTS[i % ACCENTS.length],
      bg: BGS[i % BGS.length],
      href: COLLECTIONS_PAGE,
    }
  })
}

/* ───────────────── PREMIUM FILL BUTTON ───────────────── */
function FillButton({ accent, href, block = false }: { accent: string; href: string; block?: boolean }): JSX.Element {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 30px",
        border: `2px solid ${accent}`,
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        fontSize: 12,
        letterSpacing: "3px",
        fontWeight: 600,
        textTransform: "uppercase",
        fontFamily: "'Lato', sans-serif",
        color: hovered ? "#fff" : accent,
        transition: "color 0.35s ease",
        width: block ? "100%" : "fit-content",
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: accent,
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition: "transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)",
          willChange: "transform",
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>VIEW COLLECTION</span>
    </Link>
  )
}

/* ───────────────── SMOOTH SCROLL HOOK ───────────────── */
function useSmoothScrollProgress(ref: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    let rafId: number

    const update = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const total = ref.current.offsetHeight - window.innerHeight
      const raw = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0

      progressRef.current += (raw - progressRef.current) * 0.08
      setProgress(progressRef.current)

      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [ref, enabled])

  return progress
}

/* ───────────────── IMAGE CAROUSEL ───────────────── */
function ImageCarousel({ images }: { images: string[] }): JSX.Element {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => {
      setActive((p) => (p + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])

  if (images.length === 0) {
    return <div style={{ position: "absolute", inset: 0, background: "#e9e1f1" }} />
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === active ? 1 : 0,
            transform: i === active ? "scale(1)" : "scale(1.06)",
            transition: "opacity 1s ease, transform 1.2s ease",
          }}
        />
      ))}
    </div>
  )
}

/* ───────────────── SERVICE CARD ───────────────── */
function ServiceCard({
  service,
  index,
  totalCards,
  scrollProgress,
  mode,
  cfg,
}: {
  service: Service
  index: number
  totalCards: number
  scrollProgress: number
  mode: Mode
  cfg: StackCfg
}): JSX.Element {
  const inner = (
    <div
      className={`svc-card${mode === "list" ? " svc-card--list" : ""}`}
      style={{ background: service.bg, ["--svc-h" as string]: `${cfg.cardH}px`, ["--svc-media" as string]: `${cfg.media}px` } as React.CSSProperties}
    >
      <div className="svc-media">
        <ImageCarousel images={service.images} />
      </div>

      <div className="svc-body">
        <h3 className="svc-card-title">{service.title}</h3>

        {service.bullets.length > 0 && (
          <ul className="svc-bullets">
            {service.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}

        <div className="svc-result" style={{ color: service.accent }}>
          ✦ {service.result}
        </div>

        <div className="svc-cta">
          <FillButton accent={service.accent} href={service.href} block={mode === "list"} />
        </div>
      </div>
    </div>
  )

  // Phones / small screens: a plain card in the normal page flow
  if (mode === "list") return inner

  const windowSize = 1 / totalCards
  const start = index * windowSize

  let local = (scrollProgress - start) / windowSize
  local = Math.max(0, Math.min(1, local))

  const eased = 1 - Math.pow(1 - local, 4)

  // Depth is capped so the stack never grows taller than the screen, however many categories exist
  const depth = Math.min(totalCards - 1 - index, MAX_STACK_PEEK)
  const settledTop = depth * cfg.offset
  const currentTop = settledTop + cfg.entry * (1 - eased)

  const scale = 1 - depth * 0.018
  const opacity = eased > 0.02 ? 1 : 0

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: index + 1,
        transform: `translate3d(0, ${currentTop}px, 0) scale(${scale})`,
        transformOrigin: "top center",
        opacity,
        willChange: "transform, opacity",
        pointerEvents: opacity === 0 ? "none" : "auto",
      }}
    >
      {inner}
    </div>
  )
}

/* ───────────────── MAIN ───────────────── */
export default function ServicesSection(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { mode, vh } = useLayout()
  const stacked = mode === "wide" || mode === "medium"
  const scrollProgress = useSmoothScrollProgress(sectionRef, stacked)

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchServices()
      .then((data) => !cancelled && setServices(data))
      .catch((e) => {
        console.error("Failed to load categories:", e)
        if (!cancelled) setError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Until we know the screen size, render an empty placeholder (avoids a desktop-layout flash on phones)
  if (mode === null) {
    return <section ref={sectionRef} className="svc-placeholder" aria-hidden />
  }

  const cfg = mode === "medium" ? mediumCfg(vh) : WIDE_CFG
  const count = Math.max(services.length, 1)
  const status = (
    <>
      {loading && <p className="svc-status">Loading…</p>}
      {error && <p className="svc-status svc-status--error">Couldn’t load categories.</p>}
      {!loading && !error && services.length === 0 && (
        <p className="svc-status">New collections coming soon.</p>
      )}
    </>
  )

  /* ── Phones & small screens: simple vertical list ── */
  if (mode === "list") {
    return (
      <section ref={sectionRef} className="svc-list">
        <div className="svc-list-inner">
          <h2 className="svc-title svc-title--list">
            Our <em>Collections</em>
          </h2>
          {status}
          <div className="svc-list-grid">
            {services.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={i}
                totalCards={services.length}
                scrollProgress={0}
                mode="list"
                cfg={cfg}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  /* ── Tablets / laptops / desktops: sticky stacked cards ── */
  const sectionHeight = `calc(100vh + ${count * cfg.scrollPx}px)`
  const stackHeight = cfg.cardH + Math.min(count - 1, MAX_STACK_PEEK) * cfg.offset + 24

  return (
    <section ref={sectionRef} className="svc-section" style={{ height: sectionHeight }}>
      <div className={`svc-sticky svc-sticky--${mode}`}>
        <div className="svc-title-wrap">
          <h2 className="svc-title">
            Our <em>Collections</em>
          </h2>
        </div>

        <div className="svc-stack" style={{ height: stackHeight }}>
          {status}
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              totalCards={services.length}
              scrollProgress={scrollProgress}
              mode={mode}
              cfg={cfg}
            />
          ))}
        </div>
      </div>
    </section>
  )
}