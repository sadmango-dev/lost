import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Stickman from './components/Stickman';
import BottomPanel from './components/BottomPanel';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const titleRef      = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
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
      onEnter: () => {
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = '0';
          scrollHintRef.current.style.pointerEvents = 'none';
        }
      },
      onLeaveBack: () => {
        if (scrollHintRef.current) {
          scrollHintRef.current.style.opacity = '1';
          scrollHintRef.current.style.pointerEvents = 'auto';
        }
      },
    });

    return () => {
      titleTrigger.kill();
      hintTrigger.kill();
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

      {/* Split-screen bottom panel (always in DOM) */}
      <BottomPanel />
    </div>
  );
}
