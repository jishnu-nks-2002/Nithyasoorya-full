import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ImageItem = string | { src: string; alt?: string };
type VideoItem = { video: string; poster?: string; alt?: string };
type MediaItem = ImageItem | VideoItem;

type DomeGalleryProps = {
  images?: MediaItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  isVideo: boolean;
  poster?: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isVideoItem(item: MediaItem): item is VideoItem {
  return typeof item === 'object' && item !== null && 'video' in item;
}
function isVideoUrl(src: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
}

// ─── Default media (mix of images + sample videos) ───────────────────────────
const EMPAVAI_IMAGES: MediaItem[] = [
  { src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', alt: 'Amethyst Reverie' },
  { video: '/images/videos/video-1.mp4', poster: '/images/videos/video-1.mp4', alt: 'Celestite Orbit' },
  { src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', alt: 'Rose Quartz Portal' },
  { video: '/images/videos/video-2.mp4', poster: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', alt: 'Obsidian Tide' },
  { src: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', alt: 'Labradorite Arc' },
  { video: '/images/videos/video-1.mp4', poster: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80', alt: 'Tourmaline Dusk' },
  { src: 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=800&q=80', alt: 'Aquamarine Veil' },
  { src: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?w=800&q=80', alt: 'Citrine Bloom' },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => { const a = (((deg + 180) % 360) + 360) % 360; return a - 180; };
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: MediaItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs  = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });
  const totalSlots = coords.length;
  if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '', isVideo: false }));

  const normalized: { src: string; alt: string; isVideo: boolean; poster?: string }[] = pool.map(item => {
    if (isVideoItem(item)) return { src: item.video, alt: item.alt || '', isVideo: true, poster: item.poster };
    if (typeof item === 'string') return { src: item, alt: '', isVideo: isVideoUrl(item) };
    return { src: item.src || '', alt: item.alt || '', isVideo: isVideoUrl(item.src || '') };
  });

  const usedMedia = Array.from({ length: totalSlots }, (_, i) => normalized[i % normalized.length]);
  for (let i = 1; i < usedMedia.length; i++) {
    if (usedMedia[i].src === usedMedia[i - 1].src) {
      for (let j = i + 1; j < usedMedia.length; j++) {
        if (usedMedia[j].src !== usedMedia[i].src) {
          [usedMedia[i], usedMedia[j]] = [usedMedia[j], usedMedia[i]];
          break;
        }
      }
    }
  }
  return coords.map((c, i) => ({ ...c, ...usedMedia[i] }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  return { rotateX: unit * (offsetY - (sizeY - 1) / 2), rotateY: unit * (offsetX + (sizeX - 1) / 2) };
}

// ─── TileVideo ────────────────────────────────────────────────────────────────
// CRITICAL: Do NOT set backface-visibility on the <video> element itself.
// CSS 3D backface-visibility causes browsers to suspend video decoding/rendering.
// The parent .emp-sphere-item already has backface-visibility:hidden which is enough
// to cull back-facing tiles.
function TileVideo({ src, poster, grayscale }: { src: string; poster?: string; grayscale?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = ref.current;
    if (!vid) return;

    // Imperatively set muted — required for autoplay policy in all browsers
    vid.muted = true;

    const doPlay = () => {
      vid.play().catch(() => {
        // Retry once after 400ms (handles cases where element is not yet visible/composited)
        setTimeout(() => { vid.play().catch(() => {}); }, 400);
      });
    };

    doPlay();

    // Fallback: also trigger on first user gesture in case browser blocked it
    const onGesture = () => { doPlay(); };
    document.addEventListener('pointerdown', onGesture, { once: true });
    document.addEventListener('touchstart',  onGesture, { once: true, passive: true });

    return () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('touchstart',  onGesture);
      vid.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted           // attribute (React prop) — belt-and-suspenders with the imperative set above
      loop
      playsInline
      preload="auto"  // preload so playback is ready immediately
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        pointerEvents: 'none',
        // NO backfaceVisibility here — intentionally omitted, see note above
        filter: grayscale ? 'grayscale(1)' : 'none',
      }}
    />
  );
}

// ─── Core DomeGallery ─────────────────────────────────────────────────────────
function DomeGalleryCore({
  images = EMPAVAI_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#faf8f5',
  maxVerticalRotationDeg = 5,
  dragSensitivity = 20,
  enlargeTransitionMs = 300,
  segments = 35,
  dragDampening = 2,
  openedImageWidth = '400px',
  openedImageHeight = '400px',
  imageBorderRadius = '4px',
  openedImageBorderRadius = '4px',
  grayscale = false,
}: DomeGalleryProps) {
  const rootRef    = useRef<HTMLDivElement>(null);
  const mainRef    = useRef<HTMLDivElement>(null);
  const sphereRef  = useRef<HTMLDivElement>(null);
  const frameRef   = useRef<HTMLDivElement>(null);
  const viewerRef  = useRef<HTMLDivElement>(null);
  const scrimRef   = useRef<HTMLDivElement>(null);
  const focusedElRef            = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const rotationRef   = useRef({ x: 0, y: 0 });
  const startRotRef   = useRef({ x: 0, y: 0 });
  const startPosRef   = useRef<{ x: number; y: number } | null>(null);
  const draggingRef   = useRef(false);
  const cancelTapRef  = useRef(false);
  const movedRef      = useRef(false);
  const inertiaRAF    = useRef<number | null>(null);
  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>('mouse');
  const tapTargetRef  = useRef<HTMLElement | null>(null);
  const openingRef    = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const scrollLockedRef = useRef(false);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const minDim = Math.min(w, h), maxDim = Math.max(w, h), aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case 'min': basis = minDim; break; case 'max': basis = maxDim; break;
        case 'width': basis = w; break; case 'height': basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      radius = Math.min(radius, h * 1.35);
      radius = clamp(radius, minRadius, maxRadius);
      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${Math.round(radius)}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR  = mainRef.current.getBoundingClientRect();
        if (openedImageWidth && openedImageHeight) {
          const tmpDiv = document.createElement('div');
          tmpDiv.style.cssText = `position:absolute;width:${openedImageWidth};height:${openedImageHeight};visibility:hidden;`;
          document.body.appendChild(tmpDiv);
          const tmpRect = tmpDiv.getBoundingClientRect();
          document.body.removeChild(tmpDiv);
          enlargedOverlay.style.left = `${frameR.left - mainR.left + (frameR.width - tmpRect.width) / 2}px`;
          enlargedOverlay.style.top  = `${frameR.top  - mainR.top  + (frameR.height - tmpRect.height) / 2}px`;
        } else {
          enlargedOverlay.style.left   = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top    = `${frameR.top  - mainR.top}px`;
          enlargedOverlay.style.width  = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, fitBasis, minRadius, maxRadius, padFactor, grayscale, imageBorderRadius, openedImageBorderRadius, openedImageWidth, openedImageHeight]);

  useEffect(() => { applyTransform(0, 0); }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) { cancelAnimationFrame(inertiaRAF.current); inertiaRAF.current = null; }
  }, []);

  const startInertia = useCallback((vx: number, vy: number) => {
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul   = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames     = Math.round(90 + 270 * d);
    const step = () => {
      vX *= frictionMul; vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) { inertiaRAF.current = null; return; }
      if (++frames > maxFrames) { inertiaRAF.current = null; return; }
      const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [dragDampening, maxVerticalRotationDeg, stopInertia]);

  useGesture({
    onDragStart: ({ event }) => {
      if (focusedElRef.current) return;
      stopInertia();
      const evt = event as PointerEvent;
      pointerTypeRef.current = (evt.pointerType as any) || 'mouse';
      if (pointerTypeRef.current === 'touch') { evt.preventDefault(); lockScroll(); }
      draggingRef.current = true; cancelTapRef.current = false; movedRef.current = false;
      startRotRef.current = { ...rotationRef.current };
      startPosRef.current = { x: evt.clientX, y: evt.clientY };
      const potential = (evt.target as Element).closest?.('.emp-item-img') as HTMLElement | null;
      tapTargetRef.current = potential || null;
    },
    onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
      if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
      const evt = event as PointerEvent;
      if (pointerTypeRef.current === 'touch') evt.preventDefault();
      const dxTotal = evt.clientX - startPosRef.current.x;
      const dyTotal = evt.clientY - startPosRef.current.y;
      if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true;
      const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = startRotRef.current.y + dxTotal / dragSensitivity;
      if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
      }
      if (last) {
        draggingRef.current = false;
        const dx = evt.clientX - startPosRef.current.x;
        const dy = evt.clientY - startPosRef.current.y;
        const TAP = pointerTypeRef.current === 'touch' ? 10 : 6;
        const isTap = dx * dx + dy * dy <= TAP * TAP;
        let [vMagX, vMagY] = velArr;
        const [dirX, dirY] = dirArr;
        let vx = vMagX * dirX, vy = vMagY * dirY;
        if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
          const [mx, my] = movement;
          vx = (mx / dragSensitivity) * 0.02;
          vy = (my / dragSensitivity) * 0.02;
        }
        if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) startInertia(vx, vy);
        startPosRef.current = null;
        cancelTapRef.current = !isTap;
        if (isTap && tapTargetRef.current && !focusedElRef.current) openItemFromElement(tapTargetRef.current);
        tapTargetRef.current = null;
        if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
        if (pointerTypeRef.current === 'touch') unlockScroll();
        if (movedRef.current) lastDragEndAt.current = performance.now();
        movedRef.current = false;
      }
    }
  }, { target: mainRef, eventOptions: { passive: false } });

  // ── Close enlarged overlay ──────────────────────────────────────────────────
  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement as HTMLElement;
      const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
      if (!overlay) return;
      const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;
      const originalPos = originalTilePositionRef.current;
      if (!originalPos) {
        overlay.remove(); if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        el.style.visibility = ''; (el.style as any).zIndex = 0;
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging'); openingRef.current = false;
        return;
      }
      const currentRect = overlay.getBoundingClientRect();
      const rootRect    = rootRef.current!.getBoundingClientRect();
      const origRel  = { left: originalPos.left - rootRect.left, top: originalPos.top - rootRect.top, width: originalPos.width, height: originalPos.height };
      const overlayRel = { left: currentRect.left - rootRect.left, top: currentRect.top - rootRect.top, width: currentRect.width, height: currentRect.height };

      const animOverlay = document.createElement('div');
      animOverlay.style.cssText = `position:absolute;left:${overlayRel.left}px;top:${overlayRel.top}px;width:${overlayRel.width}px;height:${overlayRel.height}px;z-index:9999;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.18);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;`;

      const origMedia = overlay.querySelector('video, img');
      if (origMedia) {
        if (origMedia.tagName === 'VIDEO') {
          const v = document.createElement('video');
          v.src = (origMedia as HTMLVideoElement).src; v.muted = true; v.autoplay = true; v.loop = true; v.playsInline = true;
          v.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
          v.play().catch(() => {});
          animOverlay.appendChild(v);
        } else {
          const img = (origMedia as HTMLImageElement).cloneNode() as HTMLImageElement;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
          animOverlay.appendChild(img);
        }
      }

      overlay.remove();
      rootRef.current!.appendChild(animOverlay);
      void animOverlay.getBoundingClientRect();
      requestAnimationFrame(() => {
        animOverlay.style.left = origRel.left + 'px'; animOverlay.style.top = origRel.top + 'px';
        animOverlay.style.width = origRel.width + 'px'; animOverlay.style.height = origRel.height + 'px';
        animOverlay.style.opacity = '0';
      });

      const cleanup = () => {
        animOverlay.remove(); originalTilePositionRef.current = null;
        if (refDiv) refDiv.remove();
        parent.style.transition = 'none'; el.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        requestAnimationFrame(() => {
          el.style.visibility = ''; el.style.opacity = '0'; (el.style as any).zIndex = 0;
          focusedElRef.current = null; rootRef.current?.removeAttribute('data-enlarging');
          requestAnimationFrame(() => {
            parent.style.transition = ''; el.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = ''; el.style.opacity = ''; openingRef.current = false;
                if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true')
                  document.body.classList.remove('dg-scroll-lock');
              }, 300);
            });
          });
        });
      };
      animOverlay.addEventListener('transitionend', cleanup, { once: true });
    };

    scrim.addEventListener('click', close);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => { scrim.removeEventListener('click', close); window.removeEventListener('keydown', onKey); };
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale]);

  // ── Open enlarged overlay ───────────────────────────────────────────────────
  const openItemFromElement = (el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true; openStartedAtRef.current = performance.now(); lockScroll();
    const parent = el.parentElement as HTMLElement;
    focusedElRef.current = el; el.setAttribute('data-focused', 'true');
    const offsetX = getDataNumber(parent, 'offsetX', 0), offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX   = getDataNumber(parent, 'sizeX', 2),   sizeY   = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const parentY   = normalizeAngle(parentRot.rotateY), globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${-parentRot.rotateX - rotationRef.current.x}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image--reference';
    refDiv.style.cssText = `position:absolute;inset:8px;pointer-events:none;opacity:0;transform:rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg);`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR  = refDiv.getBoundingClientRect();
    const mainR  = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();
    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false; focusedElRef.current = null; parent.removeChild(refDiv); unlockScroll(); return;
    }
    originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden'; (el.style as any).zIndex = 0;

    const rawSrc    = parent.dataset.src    || '';
    const rawAlt    = parent.dataset.alt    || '';
    const rawPoster = parent.dataset.poster || '';
    const isVid     = parent.dataset.isVideo === 'true';

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;opacity:0;z-index:30;will-change:transform,opacity;transform-origin:top left;transition:transform ${enlargeTransitionMs}ms ease,opacity ${enlargeTransitionMs}ms ease;border-radius:${openedImageBorderRadius};overflow:hidden;box-shadow:0 24px 64px rgba(107,63,160,0.22),0 4px 16px rgba(107,63,160,0.10);`;

    if (isVid) {
      const vid = document.createElement('video');
      vid.src = rawSrc;
      if (rawPoster) vid.poster = rawPoster;
      // Set imperatively — React attribute alone can fail in some browsers
      vid.muted = true; vid.autoplay = true; vid.loop = true; vid.playsInline = true;
      vid.style.cssText = `width:100%;height:100%;object-fit:cover;display:block;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
      overlay.appendChild(vid);

      // Mute/unmute toggle button
      const iconMuted   = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      const iconUnmuted = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      const btn = document.createElement('button');
      btn.innerHTML = iconMuted;
      btn.title = 'Toggle sound';
      btn.style.cssText = `position:absolute;bottom:12px;right:12px;z-index:10;background:rgba(0,0,0,0.48);border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:all;transition:background 0.18s;`;
      btn.onmouseenter = () => { btn.style.background = 'rgba(0,0,0,0.72)'; };
      btn.onmouseleave = () => { btn.style.background = 'rgba(0,0,0,0.48)'; };
      btn.onclick = (e) => {
        e.stopPropagation();
        vid.muted = !vid.muted;
        btn.innerHTML = vid.muted ? iconMuted : iconUnmuted;
      };
      overlay.appendChild(btn);

      // Delayed play — wait for overlay to be in DOM + a frame so browser is ready
      setTimeout(() => { vid.play().catch(() => {}); }, 50);
    } else {
      const img = document.createElement('img');
      img.src = rawSrc; img.alt = rawAlt;
      img.style.cssText = `width:100%;height:100%;object-fit:cover;display:block;filter:${grayscale ? 'grayscale(1)' : 'none'};`;
      overlay.appendChild(img);
    }

    viewerRef.current!.appendChild(overlay);

    const tx0 = tileR.left - frameR.left, ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width, sy0 = tileR.height / frameR.height;
    overlay.style.transform = `translate(${tx0}px,${ty0}px) scale(${isFinite(sx0) && sx0 > 0 ? sx0 : 1},${isFinite(sy0) && sy0 > 0 ? sy0 : 1})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px,0px) scale(1,1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);

    if (openedImageWidth || openedImageHeight) {
      const onFirstEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== 'transform') return;
        overlay.removeEventListener('transitionend', onFirstEnd);
        const prevT = overlay.style.transition;
        overlay.style.transition = 'none';
        const tw = openedImageWidth || `${frameR.width}px`, th = openedImageHeight || `${frameR.height}px`;
        overlay.style.width = tw; overlay.style.height = th;
        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = `${frameR.width}px`; overlay.style.height = `${frameR.height}px`;
        void overlay.offsetWidth;
        overlay.style.transition = `left ${enlargeTransitionMs}ms ease,top ${enlargeTransitionMs}ms ease,width ${enlargeTransitionMs}ms ease,height ${enlargeTransitionMs}ms ease`;
        requestAnimationFrame(() => {
          overlay.style.left   = `${frameR.left - mainR.left + (frameR.width  - newRect.width)  / 2}px`;
          overlay.style.top    = `${frameR.top  - mainR.top  + (frameR.height - newRect.height) / 2}px`;
          overlay.style.width  = tw;
          overlay.style.height = th;
        });
        overlay.addEventListener('transitionend', () => { overlay.style.transition = prevT; }, { once: true });
      };
      overlay.addEventListener('transitionend', onFirstEnd);
    }
  };

  useEffect(() => () => { document.body.classList.remove('dg-scroll-lock'); }, []);

  const css = `
    body.dg-scroll-lock { overflow: hidden; }
    .emp-dome-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14159);
      --rot-y: calc(360deg / var(--segments-x) / 2);
      --rot-x: calc(360deg / var(--segments-y) / 2);
      --item-width:  calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    .emp-dome-root * { box-sizing: border-box; }
    .emp-sphere, .emp-sphere-item { transform-style: preserve-3d; }
    .emp-stage {
      width: 100%; height: 100%; display: grid; place-items: center;
      position: absolute; inset: 0; margin: auto;
      perspective: calc(var(--radius) * 2); perspective-origin: 50% 50%;
    }
    .emp-sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform; position: absolute;
    }
    .emp-sphere-item {
      width:  calc(var(--item-width)  * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute; top: -999px; bottom: -999px; left: -999px; right: -999px;
      margin: auto; transform-origin: 50% 50%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      transform:
        rotateY(calc(var(--rot-y) * (var(--offset-x) + (var(--item-size-x) - 1) / 2) + var(--rot-y-delta, 0deg)))
        rotateX(calc(var(--rot-x) * (var(--offset-y) - (var(--item-size-y) - 1) / 2) + var(--rot-x-delta, 0deg)))
        translateZ(var(--radius));
    }
    /* IMPORTANT: no backface-visibility on .emp-item-img — it breaks video rendering */
    .emp-item-img {
      position: absolute; inset: 8px;
      border-radius: var(--tile-radius, 4px);
      overflow: hidden; cursor: pointer;
      pointer-events: auto;
      outline: 1.5px solid transparent;
      transition: outline 0.22s ease;
    }
    .emp-item-img:hover { outline: 1.5px solid rgba(107,63,160,0.5); }
    .emp-item-img[data-is-video="true"]::after {
      content: '';
      position: absolute; bottom: 8px; right: 8px;
      width: 24px; height: 24px;
      background: rgba(0,0,0,0.48) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpolygon points='6 3 20 12 6 21 6 3'/%3E%3C/svg%3E") center / 11px no-repeat;
      border-radius: 50%; pointer-events: none; z-index: 3;
    }
    .emp-dome-root[data-enlarging="true"] .emp-scrim {
      opacity: 1 !important; pointer-events: all !important;
    }
    @media (max-aspect-ratio: 1/1) { .emp-viewer-frame { height: auto !important; width: 100% !important; } }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={rootRef}
        className="emp-dome-root"
        style={{
          position: 'relative', width: '100%', height: '100%',
          ['--segments-x' as any]: segments,
          ['--segments-y' as any]: segments,
          ['--tile-radius' as any]: imageBorderRadius,
          ['--enlarge-radius' as any]: openedImageBorderRadius,
        } as React.CSSProperties}
      >
        <main
          ref={mainRef}
          style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            overflow: 'hidden', userSelect: 'none', touchAction: 'none',
            background: 'transparent', WebkitUserSelect: 'none',
          }}
        >
          <div className="emp-stage">
            <div ref={sphereRef} className="emp-sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="emp-sphere-item"
                  data-src={it.src}
                  data-alt={it.alt}
                  data-poster={it.poster || ''}
                  data-is-video={String(it.isVideo)}
                  data-offset-x={it.x} data-offset-y={it.y}
                  data-size-x={it.sizeX} data-size-y={it.sizeY}
                  style={{
                    ['--offset-x' as any]: it.x,
                    ['--offset-y' as any]: it.y,
                    ['--item-size-x' as any]: it.sizeX,
                    ['--item-size-y' as any]: it.sizeY,
                    top: '-999px', bottom: '-999px', left: '-999px', right: '-999px',
                  } as React.CSSProperties}
                >
                  <div
                    className="emp-item-img"
                    data-is-video={String(it.isVideo)}
                    role="button" tabIndex={0}
                    aria-label={it.alt || (it.isVideo ? 'Open video' : 'Open image')}
                    onClick={e => {
                      if (draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return;
                      openItemFromElement(e.currentTarget as HTMLElement);
                    }}
                    onPointerUp={e => {
                      if ((e.nativeEvent as PointerEvent).pointerType !== 'touch') return;
                      if (draggingRef.current || movedRef.current || performance.now() - lastDragEndAt.current < 80 || openingRef.current) return;
                      openItemFromElement(e.currentTarget as HTMLElement);
                    }}
                  >
                    {it.isVideo ? (
                      <TileVideo src={it.src} poster={it.poster} grayscale={grayscale} />
                    ) : (
                      <img
                        src={it.src} alt={it.alt} draggable={false}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                          pointerEvents: 'none', backfaceVisibility: 'hidden',
                          filter: grayscale ? 'grayscale(1)' : 'none',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edge fades */}
          <div style={{ position:'absolute', inset:0, zIndex:3, pointerEvents:'none', backgroundImage:`radial-gradient(rgba(250,248,245,0) 60%, ${overlayBlurColor} 100%)` }} />
          <div style={{ position:'absolute', inset:0, zIndex:3, pointerEvents:'none', WebkitMaskImage:`radial-gradient(rgba(250,248,245,0) 65%, ${overlayBlurColor} 88%)`, maskImage:`radial-gradient(rgba(250,248,245,0) 65%, ${overlayBlurColor} 88%)`, backdropFilter:'blur(2px)' }} />
          <div style={{ position:'absolute', left:0, right:0, top:0, height:100, zIndex:5, pointerEvents:'none', background:`linear-gradient(to top, transparent, ${overlayBlurColor})` }} />
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:100, zIndex:5, pointerEvents:'none', background:`linear-gradient(to bottom, transparent, ${overlayBlurColor})` }} />

          {/* Viewer + scrim */}
          <div ref={viewerRef} style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center', padding:'var(--viewer-pad)' }}>
            <div ref={scrimRef} className="emp-scrim" style={{ position:'absolute', inset:0, zIndex:10, pointerEvents:'none', opacity:0, transition:'opacity 0.5s ease', background:'rgba(250,248,245,0.88)', backdropFilter:'blur(4px)' }} />
            <div ref={frameRef} className="emp-viewer-frame" style={{ height:'100%', aspectRatio:'1', display:'flex', borderRadius:`var(--enlarge-radius, ${openedImageBorderRadius})` }} />
          </div>
        </main>
      </div>
    </>
  );
}

// ─── Branded section wrapper ──────────────────────────────────────────────────
export default function EmpavaiDomeGallery({ images = EMPAVAI_IMAGES, ...rest }: DomeGalleryProps) {
  return (
    <section style={{ background:'#faf8f5', padding:'0', position:'relative', overflow:'hidden', fontFamily:"'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
        @keyframes dome-fade-up { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'clamp(72px,10vw,112px) clamp(24px,6vw,96px) clamp(20px,3vw,32px)', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'flex-end', gap:32, animation:'dome-fade-up 0.7s ease both' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ width:28, height:1.5, background:'#6b3fa0' }} />
            <span style={{ fontFamily:"'Jost',sans-serif", fontSize:9.5, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#6b3fa0' }}>Sphere of Stones</span>
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(36px,5.5vw,66px)', fontWeight:400, color:'#1e1030', margin:0, lineHeight:1.06, letterSpacing:'-0.01em' }}>
            The <em style={{ fontStyle:'italic', color:'#6b3fa0' }}>Crystal</em> Dome
          </h2>
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:300, color:'#9b82c4', letterSpacing:'0.06em', marginTop:14, marginBottom:0, maxWidth:420, lineHeight:1.75 }}>
            Drag to explore — click any piece to illuminate it. Each stone holds a world.
          </p>
        </div>
        <a href="/collections" style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'Jost',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#6b3fa0', textDecoration:'none', paddingBottom:4, borderBottom:'1.5px solid #6b3fa0', whiteSpace:'nowrap', transition:'opacity 0.2s ease' }}
          onMouseEnter={e => (e.currentTarget.style.opacity='0.6')}
          onMouseLeave={e => (e.currentTarget.style.opacity='1')}>
          Shop All
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>

      <div style={{ width:'100%', height:'min(80vh,700px)', position:'relative' }}>
        <DomeGalleryCore images={images} overlayBlurColor="#faf8f5" grayscale={false} imageBorderRadius="4px" openedImageBorderRadius="4px" openedImageWidth="460px" openedImageHeight="460px" {...rest} />
      </div>

      <div style={{ textAlign:'center', padding:'clamp(20px,3vw,32px) 0 clamp(48px,6vw,72px)', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b8e0" strokeWidth="1.5" strokeLinecap="round"><path d="M5 9l-3 3 3 3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        <span style={{ fontFamily:"'Jost',sans-serif", fontSize:9.5, fontWeight:400, letterSpacing:'0.26em', textTransform:'uppercase', color:'#c4b8e0' }}>Drag to rotate · Tap to enlarge</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b8e0" strokeWidth="1.5" strokeLinecap="round"><path d="M5 9l-3 3 3 3"/><path d="M19 9l3 3-3 3"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto clamp(0px,2vw,16px)', padding:'0 clamp(24px,6vw,96px)', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ flex:1, height:1, background:'rgba(107,63,160,0.08)' }} />
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none" style={{ opacity:0.25 }}><polygon points="14,1 27,14 14,27 1,14" fill="#6b3fa0"/><polygon points="14,6 22,14 14,22 6,14" fill="#c084fc"/></svg>
        <div style={{ flex:1, height:1, background:'rgba(107,63,160,0.08)' }} />
      </div>
    </section>
  );
}