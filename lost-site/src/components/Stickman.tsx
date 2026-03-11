import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getWalkPose, getTransitionPose, SIT_POSE, type Pose } from '../data/walkCycle';

gsap.registerPlugin(ScrollTrigger);

// ─── Layout constants ─────────────────────────────────────────────────────────
const SVG_W = window.innerWidth;
const SVG_H = window.innerHeight;

// Hip baseline: positioned so the stickman's visual centre lands at ~1/3 from top.
// With TORSO=40, HEAD_R=10, feet ~36px below hip:
//   head top  ≈ HIP_Y - 60
//   feet bot  ≈ HIP_Y + 36
//   centre    ≈ HIP_Y - 12  →  set HIP_Y = SVG_H/3 + 12
const HIP_Y     = SVG_H * 0.35;          // hip reference (≈ centre at ~1/3 viewport)
const FEET_Y    = HIP_Y + 36;            // nominal ground-line / foot level
const TORSO_H   = 40;
const HEAD_R    = 10;

const START_X = -60;
const END_X   = SVG_W * 0.65;

const WALK_END = 0.45;
const SIT_END  = 0.55;

interface StickmanProps {
  onGroundY?: (y: number) => void;
}

export default function Stickman({ onGroundY }: StickmanProps) {
  const headRef = useRef<SVGCircleElement>(null);
  const torsoRef = useRef<SVGLineElement>(null);
  const lulRef  = useRef<SVGLineElement>(null); // left upper leg
  const lllRef  = useRef<SVGLineElement>(null); // left lower leg
  const rulRef  = useRef<SVGLineElement>(null); // right upper leg
  const rllRef  = useRef<SVGLineElement>(null); // right lower leg
  const luaRef  = useRef<SVGLineElement>(null); // left upper arm
  const lfaRef  = useRef<SVGLineElement>(null); // left forearm
  const ruaRef  = useRef<SVGLineElement>(null); // right upper arm
  const rfaRef  = useRef<SVGLineElement>(null); // right forearm

  useEffect(() => {
    // Tell App.tsx where to draw the ground line (foot level)
    if (onGroundY) onGroundY(FEET_Y);

    const applyPose = (pose: Pose, cx: number) => {
      const hy = HIP_Y + pose.hipY;       // hip absolute Y
      const sy = hy - TORSO_H;            // shoulder absolute Y (torso top)
      const headCY = sy - HEAD_R;         // head centre: one radius above shoulder

      headRef.current?.setAttribute('cx', String(cx));
      headRef.current?.setAttribute('cy', String(headCY));

      torsoRef.current?.setAttribute('x1', String(cx));
      torsoRef.current?.setAttribute('y1', String(sy));
      torsoRef.current?.setAttribute('x2', String(cx));
      torsoRef.current?.setAttribute('y2', String(hy));

      // Legs — endpoints relative to hip
      lulRef.current?.setAttribute('x1', String(cx));
      lulRef.current?.setAttribute('y1', String(hy));
      lulRef.current?.setAttribute('x2', String(cx + pose.leftUpperLeg.x));
      lulRef.current?.setAttribute('y2', String(hy + pose.leftUpperLeg.y));

      lllRef.current?.setAttribute('x1', String(cx + pose.leftUpperLeg.x));
      lllRef.current?.setAttribute('y1', String(hy + pose.leftUpperLeg.y));
      lllRef.current?.setAttribute('x2', String(cx + pose.leftLowerLeg.x));
      lllRef.current?.setAttribute('y2', String(hy + pose.leftLowerLeg.y));

      rulRef.current?.setAttribute('x1', String(cx));
      rulRef.current?.setAttribute('y1', String(hy));
      rulRef.current?.setAttribute('x2', String(cx + pose.rightUpperLeg.x));
      rulRef.current?.setAttribute('y2', String(hy + pose.rightUpperLeg.y));

      rllRef.current?.setAttribute('x1', String(cx + pose.rightUpperLeg.x));
      rllRef.current?.setAttribute('y1', String(hy + pose.rightUpperLeg.y));
      rllRef.current?.setAttribute('x2', String(cx + pose.rightLowerLeg.x));
      rllRef.current?.setAttribute('y2', String(hy + pose.rightLowerLeg.y));

      // Arms — endpoints relative to shoulder
      luaRef.current?.setAttribute('x1', String(cx));
      luaRef.current?.setAttribute('y1', String(sy));
      luaRef.current?.setAttribute('x2', String(cx + pose.leftUpperArm.x));
      luaRef.current?.setAttribute('y2', String(sy + pose.leftUpperArm.y));

      lfaRef.current?.setAttribute('x1', String(cx + pose.leftUpperArm.x));
      lfaRef.current?.setAttribute('y1', String(sy + pose.leftUpperArm.y));
      lfaRef.current?.setAttribute('x2', String(cx + pose.leftForearm.x));
      lfaRef.current?.setAttribute('y2', String(sy + pose.leftForearm.y));

      ruaRef.current?.setAttribute('x1', String(cx));
      ruaRef.current?.setAttribute('y1', String(sy));
      ruaRef.current?.setAttribute('x2', String(cx + pose.rightUpperArm.x));
      ruaRef.current?.setAttribute('y2', String(sy + pose.rightUpperArm.y));

      rfaRef.current?.setAttribute('x1', String(cx + pose.rightUpperArm.x));
      rfaRef.current?.setAttribute('y1', String(sy + pose.rightUpperArm.y));
      rfaRef.current?.setAttribute('x2', String(cx + pose.rightForearm.x));
      rfaRef.current?.setAttribute('y2', String(sy + pose.rightForearm.y));
    };

    applyPose(getWalkPose(0), START_X);

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        if (p <= WALK_END) {
          const walkProgress = p / WALK_END;
          const cx = START_X + (END_X - START_X) * walkProgress;
          const cycleT = (walkProgress * 10) % 1;
          applyPose(getWalkPose(cycleT), cx);
        } else if (p <= SIT_END) {
          const sitProgress = (p - WALK_END) / (SIT_END - WALK_END);
          applyPose(getTransitionPose(0, sitProgress), END_X);
        } else {
          applyPose(SIT_POSE, END_X);
        }
      },
    });

    return () => trigger.kill();
  }, [onGroundY]);

  const sp = { stroke: '#2a2218', strokeWidth: 2.5, strokeLinecap: 'round' as const };

  // Derive initial render values
  const initPose = getWalkPose(0);
  const initHY   = HIP_Y + initPose.hipY;
  const initSY   = initHY - TORSO_H;
  const ix       = START_X;

  return (
    <g>
      {/* ── Back limbs (behind torso) ──────────────────────────────────── */}
      <line ref={lulRef}
        x1={ix} y1={initHY}
        x2={ix + initPose.leftUpperLeg.x} y2={initHY + initPose.leftUpperLeg.y}
        {...sp} />
      <line ref={lllRef}
        x1={ix + initPose.leftUpperLeg.x} y1={initHY + initPose.leftUpperLeg.y}
        x2={ix + initPose.leftLowerLeg.x} y2={initHY + initPose.leftLowerLeg.y}
        {...sp} />
      <line ref={luaRef}
        x1={ix} y1={initSY}
        x2={ix + initPose.leftUpperArm.x} y2={initSY + initPose.leftUpperArm.y}
        {...sp} />
      <line ref={lfaRef}
        x1={ix + initPose.leftUpperArm.x} y1={initSY + initPose.leftUpperArm.y}
        x2={ix + initPose.leftForearm.x}  y2={initSY + initPose.leftForearm.y}
        {...sp} />

      {/* ── Torso ─────────────────────────────────────────────────────── */}
      <line ref={torsoRef}
        x1={ix} y1={initSY}
        x2={ix} y2={initHY}
        {...sp} />

      {/* ── Head ──────────────────────────────────────────────────────── */}
      <circle ref={headRef}
        cx={ix} cy={initSY - HEAD_R}
        r={HEAD_R}
        fill="none"
        {...sp} />

      {/* ── Front limbs (in front of torso) ───────────────────────────── */}
      <line ref={rulRef}
        x1={ix} y1={initHY}
        x2={ix + initPose.rightUpperLeg.x} y2={initHY + initPose.rightUpperLeg.y}
        {...sp} />
      <line ref={rllRef}
        x1={ix + initPose.rightUpperLeg.x} y1={initHY + initPose.rightUpperLeg.y}
        x2={ix + initPose.rightLowerLeg.x} y2={initHY + initPose.rightLowerLeg.y}
        {...sp} />
      <line ref={ruaRef}
        x1={ix} y1={initSY}
        x2={ix + initPose.rightUpperArm.x} y2={initSY + initPose.rightUpperArm.y}
        {...sp} />
      <line ref={rfaRef}
        x1={ix + initPose.rightUpperArm.x} y1={initSY + initPose.rightUpperArm.y}
        x2={ix + initPose.rightForearm.x}  y2={initSY + initPose.rightForearm.y}
        {...sp} />
    </g>
  );
}
