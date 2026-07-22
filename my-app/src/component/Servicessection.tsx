"use client"

import React, { useEffect, useRef, useState } from "react"
import type { JSX } from "react"

/* ───────────────── TYPES ───────────────── */
interface Service {
  num: string
  title: string
  bullets: string[]
  result: string
  images: string[]
  accent: string
  bg: string
}

/* ───────────────── DATA ───────────────── */
const SERVICES: Service[] = [
  {
    num: "01",
    title: "Structure Your Activity",
    bullets: [
      "List your offers, formats, and pricing tiers.",
      "Calculate the time you can sell each month.",
      "Compare profitability across offerings to focus on what works.",
    ],
    result: "A crystal-clear map of your business model.",
    images: [
      "/images/p-1.jpeg",
      "/images/p-2.jpeg",
      "/images/p-3.jpeg",
    ],
    accent: "#7B4BA0",
    bg: "#ffffff",
  },
  {
    num: "02",
    title: "Simulate Costs & Remuneration",
    bullets: [
      "Set your target monthly or annual salary.",
      "Enter your professional fees, charges & investments.",
      "Automatically obtain your break-even thresholds.",
    ],
    result: "A coherent budget that reveals whether your choices are viable.",
    images: [
      "/images/p-4.jpeg",
      "/images/p-5.jpeg",
      "/images/p-6.jpeg",
    ],
    accent: "#9B6CC0",
    bg: "#f3eef8",
  },
  {
    num: "03",
    title: "Pilot With Clarity",
    bullets: [
      "Track your monthly performance in real time.",
      "Adjust strategy based on live data insights.",
      "Make decisions backed by clear financial visibility.",
    ],
    result: "Full control over your business direction at every stage.",
    images: [
      "/images/p-7.webp",
      "/images/p-8.webp",
      "/images/p-9.webp",
    ],
    accent: "#7B4BA0",
    bg: "#ffffff",
  },
]

/* ───────────────── CONSTANTS ───────────────── */
const CARD_HEIGHT = 550
const STACK_OFFSET = 28
const CARD_SCROLL_PX = 520

/* ───────────────── PREMIUM FILL BUTTON ───────────────── */
function FillButton({ accent }: { accent: string }): JSX.Element {
  const [hovered, setHovered] = useState(false)

  return (
    <div
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
      }}
    >
      {/* sliding fill */}
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

      <span style={{ position: "relative", zIndex: 1 }}>
        LEARN MORE
      </span>
    </div>
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
      const raw = Math.max(0, Math.min(1, -rect.top / total))

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
    const id = setInterval(() => {
      setActive((p) => (p + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])

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

  const settledTop = (totalCards - 1 - index) * STACK_OFFSET
  const ENTRY_DISTANCE = 520
  const currentTop = settledTop + ENTRY_DISTANCE * (1 - eased)

  const depth = totalCards - 1 - index
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

          <ul style={{ margin: 0, paddingLeft: 18, color: "#6b5b7b" }}>
            {service.bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                {b}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 10, fontStyle: "italic", color: service.accent }}>
            ✦ {service.result}
          </div>

          <div style={{ marginTop: 12 }}>
            <FillButton accent={service.accent} />
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

  const sectionHeight = `calc(100vh + ${SERVICES.length * CARD_SCROLL_PX}px)`
  const stackHeight =
    CARD_HEIGHT + (SERVICES.length - 1) * STACK_OFFSET + 24

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
            Une approche en <em style={{ color: "#7B4BA0" }}>3 temps</em>
          </h2>
        </div>

        <div style={{ position: "relative", height: stackHeight }}>
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.num}
              service={service}
              index={i}
              totalCards={SERVICES.length}
              scrollProgress={scrollProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}