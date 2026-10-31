"use client"

import React, { useEffect, useRef, useState } from "react"
import type { JSX } from "react"
import Link from "next/link"

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

const CARD_HEIGHT = 550
const STACK_OFFSET = 28
const MAX_STACK_PEEK = 3 // how many cards peek out behind the top one (keeps the stack small with many categories)
const CARD_SCROLL_PX = 520

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
function FillButton({ accent, href }: { accent: string; href: string }): JSX.Element {
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
        width: "fit-content",
        textDecoration: "none",
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
function useSmoothScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)

  useEffect(() => {
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
  }, [ref])

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
    return <div style={{ width: "100%", height: "100%", background: "#e9e1f1" }} />
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
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
}: {
  service: Service
  index: number
  totalCards: number
  scrollProgress: number
}): JSX.Element {
  const windowSize = 1 / totalCards
  const start = index * windowSize

  let local = (scrollProgress - start) / windowSize
  local = Math.max(0, Math.min(1, local))

  const eased = 1 - Math.pow(1 - local, 4)

  // Depth is capped so the stack never grows taller than the screen, however many categories exist
  const depth = Math.min(totalCards - 1 - index, MAX_STACK_PEEK)
  const settledTop = depth * STACK_OFFSET
  const ENTRY_DISTANCE = 520
  const currentTop = settledTop + ENTRY_DISTANCE * (1 - eased)

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
      <div
        style={{
          background: service.bg,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          height: CARD_HEIGHT,
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        <ImageCarousel images={service.images} />

        <div
          style={{
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "2rem",
              color: "#1a0f2e",
              margin: 0,
            }}
          >
            {service.title}
          </h3>

          {service.bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, color: "#6b5b7b" }}>
              {service.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: 10, fontStyle: "italic", color: service.accent }}>
            ✦ {service.result}
          </div>

          <div style={{ marginTop: 12 }}>
            <FillButton accent={service.accent} href={service.href} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────── MAIN ───────────────── */
export default function ServicesSection(): JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useSmoothScrollProgress(sectionRef)

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

  const count = Math.max(services.length, 1)
  const sectionHeight = `calc(100vh + ${count * CARD_SCROLL_PX}px)`
  const stackHeight = CARD_HEIGHT + Math.min(count - 1, MAX_STACK_PEEK) * STACK_OFFSET + 24

  return (
    <section
      ref={sectionRef}
      style={{
        height: sectionHeight,
        background: "#f8f8f5",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 56,
          alignItems: "center",
          padding: "60px 64px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "4.6rem",
              color: "#1a0f2e",
            }}
          >
            Our <em style={{ color: "#7B4BA0" }}>Collections</em>
          </h2>
        </div>

        <div style={{ position: "relative", height: stackHeight }}>
          {loading && <p style={{ color: "#6b5b7b" }}>Loading…</p>}
          {error && <p style={{ color: "#a33" }}>Couldn’t load categories.</p>}
          {!loading && !error && services.length === 0 && (
            <p style={{ color: "#6b5b7b" }}>New collections coming soon.</p>
          )}

          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              totalCards={services.length}
              scrollProgress={scrollProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}