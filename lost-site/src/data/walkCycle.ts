// Walk cycle keyframe poses and interpolation utilities
//
// Coordinate conventions (all relative to hip center at origin):
//   - Leg offsets: relative to hip (hx, hy)
//   - Arm offsets: relative to shoulder (sx, sy = hy - TORSO_HEIGHT)
//   - Positive Y = down (SVG). Arms ALWAYS have positive Y (they hang down from shoulder).

export interface LimbEndpoint {
  x: number;
  y: number;
}

export interface Pose {
  hipY: number;           // vertical offset of hip from baseline (+ = dip down, - = rise up)
  leftUpperLeg:  LimbEndpoint; // hip → left knee
  leftLowerLeg:  LimbEndpoint; // hip → left foot   (absolute, not from knee)
  rightUpperLeg: LimbEndpoint;
  rightLowerLeg: LimbEndpoint;
  leftUpperArm:  LimbEndpoint; // shoulder → left elbow
  leftForearm:   LimbEndpoint; // shoulder → left hand (absolute, not from elbow)
  rightUpperArm: LimbEndpoint;
  rightForearm:  LimbEndpoint;
}

// ─── Proportions (matching reference stickman 80×120 viewBox, scaled to viewport) ───
// TORSO_HEIGHT = 40, HEAD_RADIUS = 10 (defined & used in Stickman.tsx)
// Upper leg ≈ 19px, Lower leg ≈ 18px  →  feet land ~36px below hip
// Upper arm ≈ 16px, Forearm ≈ 13px
// ──────────────────────────────────────────────────────────────────────────────────────

// 6-pose walk cycle (one full stride):
//   Pose 0: Right leg forward contact  — legs spread, body LOW
//   Pose 1: Weight shifting onto right — left leg lifting
//   Pose 2: Left swing through center  — body HIGH, legs close
//   Pose 3: Left leg forward contact   — legs spread, body LOW (mirror of 0)
//   Pose 4: Weight shifting onto left  — right leg lifting  (mirror of 1)
//   Pose 5: Right swing through center — body HIGH, legs close (mirror of 2)
export const WALK_POSES: Pose[] = [
  // ── Pose 0: Right leg forward contact, body LOW ──────────────────────────
  {
    hipY: 3,
    // Legs
    rightUpperLeg: { x: 10,  y: 16 }, // knee forward-down  (len ≈ 19px)
    rightLowerLeg: { x: 14,  y: 34 }, // foot forward        (knee→foot delta: 4,18 ≈ 18px)
    leftUpperLeg:  { x: -8,  y: 14 }, // knee back           (len ≈ 16px)
    leftLowerLeg:  { x: -12, y: 32 }, // foot back/lifting   (knee→foot delta: -4,18 ≈ 18px)
    // Arms (contralateral: left arm forward when right leg forward)
    leftUpperArm:  { x: -10, y: 12 }, // elbow forward       (len ≈ 16px)
    leftForearm:   { x: -16, y: 24 }, // hand forward-down   (elbow→hand delta: -6,12 ≈ 13px)
    rightUpperArm: { x: 10,  y: 14 }, // elbow back          (len ≈ 17px)
    rightForearm:  { x: 8,   y: 28 }, // hand back-down      (elbow→hand delta: -2,14 ≈ 14px)
  },
  // ── Pose 1: Weight shifting onto right leg, left leg lifting ─────────────
  {
    hipY: 2,
    rightUpperLeg: { x: 6,   y: 18 }, // planted, bearing weight
    rightLowerLeg: { x: 8,   y: 36 }, // foot planted on ground
    leftUpperLeg:  { x: -4,  y: 12 }, // lifting off
    leftLowerLeg:  { x: -2,  y: 20 }, // knee bending, foot lifting
    leftUpperArm:  { x: -8,  y: 14 },
    leftForearm:   { x: -12, y: 26 },
    rightUpperArm: { x: 8,   y: 12 },
    rightForearm:  { x: 10,  y: 26 },
  },
  // ── Pose 2: Left leg passes through (midstance), body HIGH ───────────────
  {
    hipY: -2,
    rightUpperLeg: { x: 4,   y: 20 }, // planted leg, nearly straight
    rightLowerLeg: { x: 5,   y: 38 }, // foot near ground
    leftUpperLeg:  { x: -2,  y: 14 }, // swing leg, thigh vertical
    leftLowerLeg:  { x: -6,  y: 24 }, // knee bent back noticeably
    leftUpperArm:  { x: -4,  y: 14 },
    leftForearm:   { x: -6,  y: 28 },
    rightUpperArm: { x: 4,   y: 14 },
    rightForearm:  { x: 6,   y: 28 },
  },
  // ── Pose 3: Left leg forward contact, body LOW (mirror of 0) ─────────────
  {
    hipY: 3,
    leftUpperLeg:  { x: -10, y: 16 },
    leftLowerLeg:  { x: -14, y: 34 },
    rightUpperLeg: { x: 8,   y: 14 },
    rightLowerLeg: { x: 12,  y: 32 },
    rightUpperArm: { x: 10,  y: 12 }, // right arm forward
    rightForearm:  { x: 16,  y: 24 },
    leftUpperArm:  { x: -10, y: 14 }, // left arm back
    leftForearm:   { x: -8,  y: 28 },
  },
  // ── Pose 4: Weight shifting onto left leg (mirror of 1) ──────────────────
  {
    hipY: 2,
    leftUpperLeg:  { x: -6,  y: 18 },
    leftLowerLeg:  { x: -8,  y: 36 },
    rightUpperLeg: { x: 4,   y: 12 },
    rightLowerLeg: { x: 2,   y: 20 },
    rightUpperArm: { x: 8,   y: 14 },
    rightForearm:  { x: 12,  y: 26 },
    leftUpperArm:  { x: -8,  y: 12 },
    leftForearm:   { x: -10, y: 26 },
  },
  // ── Pose 5: Right leg passes through (midstance), body HIGH (mirror of 2) ─
  {
    hipY: -2,
    leftUpperLeg:  { x: -4,  y: 20 },
    leftLowerLeg:  { x: -5,  y: 38 },
    rightUpperLeg: { x: 2,   y: 14 },
    rightLowerLeg: { x: 6,   y: 24 },
    rightUpperArm: { x: 4,   y: 14 },
    rightForearm:  { x: 6,   y: 28 },
    leftUpperArm:  { x: -4,  y: 14 },
    leftForearm:   { x: -6,  y: 28 },
  },
];

// Cross-legged sitting pose
export const SIT_POSE: Pose = {
  hipY: 12,
  // Left leg: knee out-left, foot crosses under to the right
  leftUpperLeg:  { x: -20, y: 14 },
  leftLowerLeg:  { x: 8,   y: 24 },
  // Right leg: knee out-right, foot crosses under to the left
  rightUpperLeg: { x: 20,  y: 14 },
  rightLowerLeg: { x: -8,  y: 24 },
  // Arms: elbows out to sides, hands resting near knees
  leftUpperArm:  { x: -16, y: 14 },
  leftForearm:   { x: -22, y: 26 },
  rightUpperArm: { x: 16,  y: 14 },
  rightForearm:  { x: 22,  y: 26 },
};

// ─── Interpolation ────────────────────────────────────────────────────────────

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPt(a: LimbEndpoint, b: LimbEndpoint, t: number): LimbEndpoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function interpolatePoses(a: Pose, b: Pose, rawT: number): Pose {
  const t = smoothstep(rawT);
  return {
    hipY:          lerp(a.hipY, b.hipY, t),
    leftUpperLeg:  lerpPt(a.leftUpperLeg,  b.leftUpperLeg,  t),
    leftLowerLeg:  lerpPt(a.leftLowerLeg,  b.leftLowerLeg,  t),
    rightUpperLeg: lerpPt(a.rightUpperLeg, b.rightUpperLeg, t),
    rightLowerLeg: lerpPt(a.rightLowerLeg, b.rightLowerLeg, t),
    leftUpperArm:  lerpPt(a.leftUpperArm,  b.leftUpperArm,  t),
    leftForearm:   lerpPt(a.leftForearm,   b.leftForearm,   t),
    rightUpperArm: lerpPt(a.rightUpperArm, b.rightUpperArm, t),
    rightForearm:  lerpPt(a.rightForearm,  b.rightForearm,  t),
  };
}

// Walk cycle: t in [0, 1) maps to one full stride
export function getWalkPose(cycleT: number): Pose {
  const n = WALK_POSES.length;
  const scaled = ((cycleT % 1) + 1) % 1 * n;
  const i = Math.floor(scaled);
  return interpolatePoses(WALK_POSES[i % n], WALK_POSES[(i + 1) % n], scaled - i);
}

// Blend from end-of-walk pose into the sitting pose
export function getTransitionPose(walkT: number, sitT: number): Pose {
  return interpolatePoses(getWalkPose(walkT), SIT_POSE, sitT);
}
