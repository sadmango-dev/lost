import { useMemo } from 'react';

interface SkyProps {
  groundY: number; // clip sky particles above this Y
}

// Deterministic PRNG (LCG) — same output every render, no hydration issues
function makePRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// Palette: warm tawny tones — darker than the beige background (#e8dcc8)
// so they're actually perceptible while staying in the same colour family
const CIRCLE_STROKE = '#8a7050';
const DOT_FILL      = '#7a6040';
const SPARK_STROKE  = '#8a7050';

export default function Sky({ groundY }: SkyProps) {
  const W = window.innerWidth;

  const elements = useMemo(() => {
    const rand = makePRNG(42);
    const items: React.ReactElement[] = [];

    // ── Soft ambient rings (orb feel) ────────────────────────────────────
    for (let i = 0; i < 14; i++) {
      const cx = rand() * W;
      const cy = rand() * groundY;
      const r  = 4 + rand() * 18;
      const op = 0.04 + rand() * 0.09;
      items.push(
        <circle key={`ring${i}`} cx={cx} cy={cy} r={r}
          fill="none" stroke={CIRCLE_STROKE} strokeWidth={0.7} opacity={op} />
      );
    }

    // ── Micro dots ───────────────────────────────────────────────────────
    for (let i = 0; i < 30; i++) {
      const cx = rand() * W;
      const cy = rand() * groundY;
      const r  = 0.6 + rand() * 1.8;
      const op = 0.07 + rand() * 0.13;
      items.push(
        <circle key={`dot${i}`} cx={cx} cy={cy} r={r}
          fill={DOT_FILL} opacity={op} />
      );
    }

    // ── Spark marks (two crossing lines = ✦ shape) ───────────────────────
    for (let i = 0; i < 32; i++) {
      const cx   = rand() * W;
      const cy   = rand() * groundY;
      const size = 1.8 + rand() * 5;
      const op   = 0.06 + rand() * 0.14;
      // Slight random rotation so sparks don't all look identical
      const angle = rand() * Math.PI * 0.5;
      const cos   = Math.cos(angle);
      const sin   = Math.sin(angle);
      items.push(
        <g key={`spark${i}`} opacity={op}>
          <line
            x1={cx - cos * size} y1={cy - sin * size}
            x2={cx + cos * size} y2={cy + sin * size}
            stroke={SPARK_STROKE} strokeWidth={0.65} strokeLinecap="round"
          />
          <line
            x1={cx + sin * size} y1={cy - cos * size}
            x2={cx - sin * size} y2={cy + cos * size}
            stroke={SPARK_STROKE} strokeWidth={0.65} strokeLinecap="round"
          />
        </g>
      );
    }

    return items;
  }, [W, groundY]);

  return <g>{elements}</g>;
}
