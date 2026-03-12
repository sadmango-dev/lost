import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SIT_END = 0.55;

const PARAGRAPHS = [
  'There is a particular kind of exhaustion that has nothing to do with sleep. You carry it in the chest, somewhere just below the ribs. It is the weight of questions that have no clean answers.',
  'Nobody tells you that some stretches of life feel like walking through fog — not darkness, not light. Just grey. And you keep walking because what else is there.',
  'The strange thing is that most people around you are carrying the same fog. They just got better at hiding it. The ones who seem certain are usually the most lost.',
  'Somewhere along the way you started measuring yourself against a version of your life that only ever existed in your head. That version is a fiction. Let it go.',
  'Rest is not failure. Sitting down is not giving up. Sometimes the most honest thing you can do is stop pretending you are fine and just be exactly where you are.',
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
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Panel snaps in the moment the stickman finishes sitting
        panel.style.opacity = p >= SIT_END ? '1' : '0';

        if (p > SIT_END) {
          const contentProgress = (p - SIT_END) / (1 - SIT_END);
          const maxOffset = SECTION_H() * PARAGRAPHS.length;
          const offsetY = -(contentProgress * maxOffset);
          inner.style.transform = `translateY(${offsetY}px)`;

          // Paragraph sections (index 1+) fade in as they enter the panel
          paraRefs.current.forEach((el, i) => {
            if (!el || i === 0) return; // skip "I get it" (always full opacity)
            const sectionTop = i * SECTION_H();
            const visibleTop = sectionTop + offsetY;
            const enterStart = SECTION_H() * 0.88;
            const enterEnd   = SECTION_H() * 0.28;
            const v = Math.max(0, Math.min(1, (enterStart - visibleTop) / (enterStart - enterEnd)));
            el.style.opacity      = String(v);
            el.style.transform    = `translateY(${(1 - v) * 22}px)`;
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
        {PARAGRAPHS.map((text, i) => (
          <div
            key={i}
            ref={el => { paraRefs.current[i + 1] = el; }}
            className="para-section"
            style={{ opacity: 0, transform: 'translateY(22px)' }}
          >
            <p className="para-body">{text}</p>
          </div>
        ))}

      </div>
    </div>
  );
}
