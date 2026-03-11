import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getWalkPose, getTransitionPose, SIT_POSE, type Pose } from '../data/walkCycle';

gsap.registerPlugin(ScrollTrigger);

// Layout constants
const SVG_W = window.innerWidth;
const SVG_H = window.innerHeight;
const GROUND_Y = SVG_H * 0.72;  // stickman stands on this line
const START_X = -60;
const END_X = SVG_W * 0.65;

// Scroll phase thresholds (fraction of total scroll)
const WALK_END = 0.45;
const SIT_END  = 0.55;

interface StickmanProps {
  onGroundY?: (y: number) => void;
}

export default function Stickman({ onGroundY }: StickmanProps) {
  const groupRef    = useRef<SVGGElement>(null);
  const headRef     = useRef<SVGCircleElement>(null);
  const torsoRef    = useRef<SVGLineElement>(null);
  const lulRef      = useRef<SVGLineElement>(null); // left upper leg
  const lllRef      = useRef<SVGLineElement>(null); // left lower leg
  const rulRef      = useRef<SVGLineElement>(null); // right upper leg
  const rllRef      = useRef<SVGLineElement>(null); // right lower leg
  const luaRef      = useRef<SVGLineElement>(null); // left upper arm
  const lfaRef      = useRef<SVGLineElement>(null); // left forearm
  const ruaRef      = useRef<SVGLineElement>(null); // right upper arm
  const rfaRef      = useRef<SVGLineElement>(null); // right forearm

  useEffect(() => {
    if (onGroundY) onGroundY(GROUND_Y);

    const applyPose = (pose: Pose, cx: number) => {
      const hipAbsY = GROUND_Y + pose.hipY;
      const headAbsY = hipAbsY - 38 + pose.headY + 38; // headY is relative to hip

      // Hip center
      const hx = cx;
      const hy = hipAbsY;
      // Shoulder center (torso top)
      const sx = cx;
      const sy = hy - 38;

      if (headRef.current) {
        headRef.current.setAttribute('cx', String(cx));
        headRef.current.setAttribute('cy', String(headAbsY));
      }
      if (torsoRef.current) {
        torsoRef.current.setAttribute('x1', String(sx));
        torsoRef.current.setAttribute('y1', String(sy));
        torsoRef.current.setAttribute('x2', String(hx));
        torsoRef.current.setAttribute('y2', String(hy));
      }
      // Legs from hip
      if (lulRef.current) {
        lulRef.current.setAttribute('x1', String(hx));
        lulRef.current.setAttribute('y1', String(hy));
        lulRef.current.setAttribute('x2', String(hx + pose.leftUpperLeg.x));
        lulRef.current.setAttribute('y2', String(hy + pose.leftUpperLeg.y));
      }
      if (lllRef.current) {
        lllRef.current.setAttribute('x1', String(hx + pose.leftUpperLeg.x));
        lllRef.current.setAttribute('y1', String(hy + pose.leftUpperLeg.y));
        lllRef.current.setAttribute('x2', String(hx + pose.leftLowerLeg.x));
        lllRef.current.setAttribute('y2', String(hy + pose.leftLowerLeg.y));
      }
      if (rulRef.current) {
        rulRef.current.setAttribute('x1', String(hx));
        rulRef.current.setAttribute('y1', String(hy));
        rulRef.current.setAttribute('x2', String(hx + pose.rightUpperLeg.x));
        rulRef.current.setAttribute('y2', String(hy + pose.rightUpperLeg.y));
      }
      if (rllRef.current) {
        rllRef.current.setAttribute('x1', String(hx + pose.rightUpperLeg.x));
        rllRef.current.setAttribute('y1', String(hy + pose.rightUpperLeg.y));
        rllRef.current.setAttribute('x2', String(hx + pose.rightLowerLeg.x));
        rllRef.current.setAttribute('y2', String(hy + pose.rightLowerLeg.y));
      }
      // Arms from shoulder
      if (luaRef.current) {
        luaRef.current.setAttribute('x1', String(sx));
        luaRef.current.setAttribute('y1', String(sy));
        luaRef.current.setAttribute('x2', String(sx + pose.leftUpperArm.x));
        luaRef.current.setAttribute('y2', String(sy + pose.leftUpperArm.y));
      }
      if (lfaRef.current) {
        lfaRef.current.setAttribute('x1', String(sx + pose.leftUpperArm.x));
        lfaRef.current.setAttribute('y1', String(sy + pose.leftUpperArm.y));
        lfaRef.current.setAttribute('x2', String(sx + pose.leftForearm.x));
        lfaRef.current.setAttribute('y2', String(sy + pose.leftForearm.y));
      }
      if (ruaRef.current) {
        ruaRef.current.setAttribute('x1', String(sx));
        ruaRef.current.setAttribute('y1', String(sy));
        ruaRef.current.setAttribute('x2', String(sx + pose.rightUpperArm.x));
        ruaRef.current.setAttribute('y2', String(sy + pose.rightUpperArm.y));
      }
      if (rfaRef.current) {
        rfaRef.current.setAttribute('x1', String(sx + pose.rightUpperArm.x));
        rfaRef.current.setAttribute('y1', String(sy + pose.rightUpperArm.y));
        rfaRef.current.setAttribute('x2', String(sx + pose.rightForearm.x));
        rfaRef.current.setAttribute('y2', String(sy + pose.rightForearm.y));
      }
    };

    // Initial pose
    applyPose(getWalkPose(0), START_X);

    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        if (p <= WALK_END) {
          // Walking phase
          const walkProgress = p / WALK_END; // 0→1
          const cx = START_X + (END_X - START_X) * walkProgress;
          const cycleT = (walkProgress * 10) % 1;
          applyPose(getWalkPose(cycleT), cx);
        } else if (p <= SIT_END) {
          // Sitting transition phase
          const sitProgress = (p - WALK_END) / (SIT_END - WALK_END); // 0→1
          // Final walk cycle position
          const lastCycleT = (1 * 10) % 1;
          // Translate down slightly as sitting
          const cx = END_X;
          applyPose(getTransitionPose(lastCycleT, sitProgress), cx);
        } else {
          // Seated — hold sit pose
          applyPose(SIT_POSE, END_X);
        }
      },
    });

    return () => trigger.kill();
  }, [onGroundY]);

  const strokeProps = {
    stroke: '#2a2218',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  // Initial position — off screen left, standing
  const initPose = getWalkPose(0);
  const initHipY = GROUND_Y + initPose.hipY;
  const initSy   = initHipY - 38;
  const ix = START_X;

  return (
    <g ref={groupRef}>
      {/* Back limbs (rendered behind torso) */}
      {/* Left upper leg */}
      <line ref={lulRef}
        x1={ix} y1={initHipY}
        x2={ix + initPose.leftUpperLeg.x} y2={initHipY + initPose.leftUpperLeg.y}
        {...strokeProps} />
      {/* Left lower leg */}
      <line ref={lllRef}
        x1={ix + initPose.leftUpperLeg.x} y1={initHipY + initPose.leftUpperLeg.y}
        x2={ix + initPose.leftLowerLeg.x} y2={initHipY + initPose.leftLowerLeg.y}
        {...strokeProps} />
      {/* Left upper arm */}
      <line ref={luaRef}
        x1={ix} y1={initSy}
        x2={ix + initPose.leftUpperArm.x} y2={initSy + initPose.leftUpperArm.y}
        {...strokeProps} />
      {/* Left forearm */}
      <line ref={lfaRef}
        x1={ix + initPose.leftUpperArm.x} y1={initSy + initPose.leftUpperArm.y}
        x2={ix + initPose.leftForearm.x} y2={initSy + initPose.leftForearm.y}
        {...strokeProps} />

      {/* Torso */}
      <line ref={torsoRef}
        x1={ix} y1={initSy}
        x2={ix} y2={initHipY}
        {...strokeProps} />

      {/* Head */}
      <circle ref={headRef}
        cx={ix} cy={initSy - 12}
        r={12}
        fill="none"
        {...strokeProps} />

      {/* Front limbs */}
      {/* Right upper leg */}
      <line ref={rulRef}
        x1={ix} y1={initHipY}
        x2={ix + initPose.rightUpperLeg.x} y2={initHipY + initPose.rightUpperLeg.y}
        {...strokeProps} />
      {/* Right lower leg */}
      <line ref={rllRef}
        x1={ix + initPose.rightUpperLeg.x} y1={initHipY + initPose.rightUpperLeg.y}
        x2={ix + initPose.rightLowerLeg.x} y2={initHipY + initPose.rightLowerLeg.y}
        {...strokeProps} />
      {/* Right upper arm */}
      <line ref={ruaRef}
        x1={ix} y1={initSy}
        x2={ix + initPose.rightUpperArm.x} y2={initSy + initPose.rightUpperArm.y}
        {...strokeProps} />
      {/* Right forearm */}
      <line ref={rfaRef}
        x1={ix + initPose.rightUpperArm.x} y1={initSy + initPose.rightUpperArm.y}
        x2={ix + initPose.rightForearm.x} y2={initSy + initPose.rightForearm.y}
        {...strokeProps} />
    </g>
  );
}
