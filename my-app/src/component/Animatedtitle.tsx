import { useEffect, useRef, useState, useCallback } from 'react';

interface AnimatedTitleProps {
  text?: string;
  className?: string;
  textColor?: string;
  minFontSize?: number;
  maxFontSize?: number;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text = 'EMPAVA',
  className = '',
  textColor = '#7B4BA0',
  minFontSize = 50,
  maxFontSize = 90,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);

  const [fontSize, setFontSize] = useState(minFontSize);

  const chars = text.split('');

  // Reset mouse position when text changes
  useEffect(() => {
    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
    }
  }, [text]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current) return;

    const { width: containerW } = containerRef.current.getBoundingClientRect();
    let newFontSize = containerW / (chars.length / 1.8);
    newFontSize = Math.max(newFontSize, minFontSize);
    newFontSize = Math.min(newFontSize, maxFontSize);

    setFontSize(newFontSize);
  }, [chars.length, minFontSize, maxFontSize]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      // Only animate if hovering
      if (isHoveringRef.current) {
        mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 20;
        mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 20;

        if (titleRef.current) {
          const titleRect = titleRef.current.getBoundingClientRect();
          const maxDist = titleRect.width / 2;

          spansRef.current.forEach(span => {
            if (!span) return;

            const rect = span.getBoundingClientRect();
            const charCenter = {
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2
            };

            const d = dist(mouseRef.current, charCenter);

            // Subtle scale effect only
            const scaleVal = getAttr(d, maxDist, 1, 1.12);
            
            // Minimal font weight variation
            const weightVal = Math.floor(getAttr(d, maxDist, 550, 700));

            const transform = `scale(${scaleVal.toFixed(2)})`;

            span.style.transform = transform;
            span.style.fontWeight = weightVal.toString();
          });
        }
      } else {
        // Reset all spans to default state when not hovering
        spansRef.current.forEach(span => {
          if (!span) return;
          span.style.transform = 'scale(1)';
          span.style.fontWeight = '600';
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'default' }}
    >
      <h1
        ref={titleRef}
        className={`animated-title ${className} flex justify-center`}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: fontSize,
          lineHeight: 1.1,
          margin: 0,
          fontWeight: 600,
          color: textColor,
          letterSpacing: '0.05em',
          width: '100%',
          gap: '0.02em',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={el => {
              spansRef.current[i] = el;
            }}
            className="inline-block"
            style={{
              display: 'inline-block',
              transition: 'transform 0.35s ease-out, font-weight 0.35s ease-out',
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default AnimatedTitle;