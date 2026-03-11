import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Stickman from './components/Stickman';
import BottomPanel from './components/BottomPanel';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Walk-phase labels: [text, fadeInStart, peakStart, peakEnd, fadeOutEnd]
const WALK_LABELS: [string, number, number, number, number][] = [
  ['Walking',       0.02, 0.05, 0.12, 0.15],
  ['Still Walking', 0.17, 0.20, 0.27, 0.30],
  ['Still walking', 0.32, 0.35, 0.42, 0.45],
];

function labelOpacity(p: number, fadeIn: number, peakStart: number, peakEnd: number, fadeOut: number): number {
  if (p <= fadeIn || p >= fadeOut) return 0;
  if (p <= peakStart) return (p - fadeIn) / (peakStart - fadeIn);
  if (p >= peakEnd)   return 1 - (p - peakEnd) / (fadeOut - peakEnd);
  return 1;
}

export default function App() {
  const titleRef      = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const walkLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [groundY, setGroundY] = useState(window.innerHeight * 0.72);

  useEffect(() => {
    // Title fades out by 8% scroll
    const titleTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: `${window.innerHeight * 0.08 * 6}px top`,
      scrub: true,
      onUpdate: (self) => {
        if (titleRef.current) {
          const opacity = Math.max(0, 0.08 * (1 - self.progress));
          titleRef.current.style.opacity = String(opacity);
        }
      },
    });

    // Scroll hint disappears once scrolling starts
    const hintTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: '10px top',
      end: `${window.innerHeight * 0.03 * 6}px top`,
      scrub: true,
      onUpdate: (self) => {
        if (scrollHintRef.current) {
          const opacity = Math.max(0, 1 - self.progress * 2);
          scrollHintRef.current.style.opacity = String(opacity);
        }
      }
    });

    // Walk labels fade in/out during the walking phase
    const walkTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        WALK_LABELS.forEach(([, fadeIn, peakStart, peakEnd, fadeOut], i) => {
          const el = walkLabelRefs.current[i];
          if (el) el.style.opacity = String(labelOpacity(p, fadeIn, peakStart, peakEnd, fadeOut));
        });
      },
    });

    return () => {
      titleTrigger.kill();
      hintTrigger.kill();
      walkTrigger.kill();
    };
  }, []);

  return (
    <div className="app">
      {/* Scroll spacer — 600vh total scrollable height */}
      <div className="scroll-spacer" />

      {/* Fixed SVG overlay covering the viewport */}
      <svg
        className="scene-svg"
        width={window.innerWidth}
        height={window.innerHeight}
        viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
      >
        {/* Ground line */}
        <line
          x1={0}
          y1={groundY}
          x2={window.innerWidth}
          y2={groundY}
          stroke="#2a2218"
          strokeWidth={0.8}
          opacity={0.12}
        />
        <Stickman onGroundY={setGroundY} />
      </svg>

      {/* Paper texture overlay */}
      <div className="texture-overlay" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" opacity="1" />
        </svg>
      </div>

      {/* Title */}
      <div ref={titleRef} className="site-title">
        the wanderer
      </div>

      {/* Scroll hint */}
      <div ref={scrollHintRef} className="scroll-hint">
        scroll to begin
      </div>

      {/* Walk-phase labels */}
      {WALK_LABELS.map(([text], i) => (
        <div
          key={text}
          ref={el => { walkLabelRefs.current[i] = el; }}
          className="walk-label"
          style={{ opacity: 0 }}
        >
          {text}
        </div>
      ))}

      {/* Split-screen bottom panel (always in DOM) */}
      <BottomPanel />
    </div>
  );
}
