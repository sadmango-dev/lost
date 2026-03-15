import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SIT_END = 0.55;

const LINKS = [
  { label: 'The Marginalian',  href: 'https://www.themarginalian.org' },
  { label: 'Colossal',         href: 'https://www.thisiscolossal.com' },
  { label: 'Brainpickings',    href: 'https://www.themarginalian.org/archive' },
  { label: 'Quiet Mind',       href: 'https://www.headspace.com' },
  { label: 'Slow TV',          href: 'https://www.youtube.com/@NorwegianBroadcastingCorporation' },
];

const PARAGRAPHS: { title?: string; body: string }[] = [
  {
    body: "We are in a period of change. The old ways of doing things are breaking down, but the new ways haven't formed or taken shape yet. The future is covered by fog, the present by anxiety.",
  },
  {
    body: "I'm scared too. But water doesn't flow under a lying rock. If only out of pettiness, we should continue. Continue walking, loving, creating. I haven't figured things out myself, but here's what I think is a promising direction.",
  },
  {
    title: '1. Preserve your sanity.',
    body: "The attention economy is grasping for our attention, throwing too much information at us all at once. Step away. Don't let your nerves get hijacked. Be bored. Give back to the universe — bring your ideas to life.",
  },
  {
    title: '2. Connect with people.',
    body: "Love is a force people have examined since the dawn of humanity for a reason. Love your friends, love your community, love the strangers on the street. Do it earnestly. While we're not cyborgs, let us hold on to the fundamentals of our humanity.",
  },
  {
    title: '3. Return to the physical.',
    body: "In a society where everything is rent-based and temporary, where ownership is being erased, the physical world is the last bastion of permanence. Plant a tree, build something, learn to create.",
  },
];

const SECTION_H = () => window.innerHeight * 0.5;

export default function BottomPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Panel snaps in the moment the stickman finishes sitting
        panel.style.opacity = p >= SIT_END ? '1' : '0';

        if (p > SIT_END) {
          const contentProgress = (p - SIT_END) / (1 - SIT_END);

          const SCROLL_IN = 0.05;
          const HOLD_END  = 0.15;

          let scrollProgress: number;
          if (contentProgress <= SCROLL_IN) {
            // Phase 1: scroll in normally
            scrollProgress = contentProgress / SCROLL_IN * SCROLL_IN;
          } else if (contentProgress <= HOLD_END) {
            // Phase 2: freeze
            scrollProgress = SCROLL_IN;
          } else {
            // Phase 3: resume scrolling from where it froze
            scrollProgress = SCROLL_IN + (contentProgress - HOLD_END) / (1 - HOLD_END) * (1 - SCROLL_IN);
          }

          const maxOffset = SECTION_H() * PARAGRAPHS.length;
          const offsetY = -(scrollProgress * maxOffset);
          inner.style.transform = `translateY(${offsetY}px)`;

          // Paragraph sections (index 1+) fade in as they enter the panel
          paraRefs.current.forEach((el, i) => {
            if (!el || i === 0) return; // skip "I get it" (always full opacity)
            const sectionTop = i * SECTION_H();
            const visibleTop = sectionTop + offsetY;
            const enterStart = SECTION_H() * 0.88;
            const enterEnd   = SECTION_H() * 0.28;
            const v = Math.max(0, Math.min(1, (enterStart - visibleTop) / (enterStart - enterEnd)));
            el.style.opacity   = String(v);
            el.style.transform = `translateY(${(1 - v) * 22}px)`;
          });
        } else {
          inner.style.transform = 'translateY(0px)';
          // Reset paragraphs when user scrolls back up
          paraRefs.current.forEach((el, i) => {
            if (!el || i === 0) return;
            el.style.opacity   = '0';
            el.style.transform = 'translateY(22px)';
          });
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={panelRef} className="bottom-panel" style={{ opacity: 0 }}>
      <div ref={innerRef} className="bottom-panel-inner" style={{ willChange: 'transform' }}>

        {/* "I get it" — no fade, appears with the panel */}
        <div
          ref={el => { paraRefs.current[0] = el; }}
          className="igetit-section"
        >
          I get it.
        </div>

        {/* Paragraphs — scroll in one by one */}
        {PARAGRAPHS.map(({ title, body }, i) => (
          <div
            key={i}
            ref={el => { paraRefs.current[i + 1] = el; }}
            className="para-section"
            style={{ opacity: 0, transform: 'translateY(22px)' }}
          >
            {title && <p className="para-title">{title}</p>}
            <p className="para-body">{body}</p>
          </div>
        ))}

      </div>
    </div>
  );
}
