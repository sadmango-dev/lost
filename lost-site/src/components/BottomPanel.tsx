import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ContentSection from './ContentSection';

gsap.registerPlugin(ScrollTrigger);

const SIT_END = 0.55; // scroll fraction at which split-screen fully appears

const SECTIONS = [
  {
    label: '01 — stillness',
    heading: 'In stillness, the world speaks',
    body: 'After miles of movement, the body learns to quiet itself. The feet stop, the breath deepens, and something that was always present — beneath the noise of motion — begins to surface. Stillness is not the absence of life. It is life, unmasked.',
  },
  {
    label: '02 — reflection',
    heading: 'The path behind becomes the path within',
    body: 'Every step taken outward is also a step taken inward. The road teaches patience. It teaches you that arrival is not a destination but a way of moving — and that what you carry matters less than what you are willing to set down.',
  },
  {
    label: '03 — continuation',
    heading: 'Rest is not the opposite of movement',
    body: 'The wanderer will rise again. Not because rest has ended, but because rest has done its work. To sit is to gather. To be still is to prepare. The road continues not despite the pause, but because of it.',
  },
];

export default function BottomPanel() {
  const innerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Visibility values for each section (0–1), driven by scroll
  const [sectionVisibilities, setSectionVisibilities] = useState([0, 0, 0]);
  const [panelOpacity, setPanelOpacity] = useState(0);

  useEffect(() => {
    const inner = innerRef.current;
    const panel = panelRef.current;
    if (!inner || !panel) return;

    // Total translateY range: scroll all 3 sections through 50vh panel
    // Each section is min-height 50vh, so total inner height ≈ 3 * 50vh
    // We want to scroll (3-1) * 50vh = 100vh of content through the panel
    const getSectionHeight = () => window.innerHeight * 0.5;
    const getTotalOffset = () => getSectionHeight() * (SECTIONS.length - 1);

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Panel fades in gently: starts at sit_start (0.50) → fully visible at SIT_END+0.10
        const fadeStart = SIT_END - 0.05;
        const fadeProgress = Math.max(0, Math.min(1, (p - fadeStart) / 0.15));
        setPanelOpacity(fadeProgress);

        if (p > SIT_END) {
          // Content scroll phase: SIT_END → 1.0
          const contentProgress = (p - SIT_END) / (1 - SIT_END); // 0→1
          const maxOffset = getTotalOffset();
          const offsetY = -(contentProgress * maxOffset);
          if (inner) {
            inner.style.transform = `translateY(${offsetY}px)`;
          }

          // Calculate visibility of each section
          const panelH = getSectionHeight();
          const newVis = SECTIONS.map((_, i) => {
            // Section top in inner container coords
            const sectionTop = i * panelH;
            // In viewport (panel) coords: sectionTop + offsetY
            const visibleTop = sectionTop + offsetY;
            // Section is entering from bottom of panel (panelH) upward
            // Fully visible when visibleTop < panelH * 0.6
            const enterStart = panelH * 0.85;
            const enterEnd   = panelH * 0.35;
            return Math.max(0, Math.min(1, (enterStart - visibleTop) / (enterStart - enterEnd)));
          });
          setSectionVisibilities(newVis);
        } else {
          if (inner) inner.style.transform = 'translateY(0px)';
          setSectionVisibilities([0, 0, 0]);
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      {/* Bottom panel */}
      <div
        ref={panelRef}
        className="bottom-panel"
        style={{ opacity: panelOpacity }}
      >
        <div
          ref={innerRef}
          className="bottom-panel-inner"
          style={{ willChange: 'transform' }}
        >
          {SECTIONS.map((section, i) => (
            <ContentSection
              key={section.label}
              label={section.label}
              heading={section.heading}
              body={section.body}
              visibility={sectionVisibilities[i]}
            />
          ))}
        </div>
      </div>
    </>
  );
}
