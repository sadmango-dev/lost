// Walk cycle keyframe poses and interpolation utilities

export interface LimbEndpoint {
  x: number;
  y: number;
}

export interface Pose {
  headY: number;
  hipY: number;
  leftUpperLeg: LimbEndpoint;
  leftLowerLeg: LimbEndpoint;
  rightUpperLeg: LimbEndpoint;
  rightLowerLeg: LimbEndpoint;
  leftUpperArm: LimbEndpoint;
  leftForearm: LimbEndpoint;
  rightUpperArm: LimbEndpoint;
  rightForearm: LimbEndpoint;
}

// All coordinates are relative to the stickman's center X (0) and hip Y (0)
// Positive Y is down in SVG space
const TORSO_HEIGHT = 38;
const HEAD_RADIUS = 12;

// 6-pose walk cycle: one full stride
// Pose 0: Right leg forward (contact) — legs spread wide, body LOW
// Pose 1: Weight shifting onto right leg — left leg lifting
// Pose 2: Left leg passing through (midstance) — body HIGH, legs close
// Pose 3: Left leg forward (contact) — legs spread wide, body LOW
// Pose 4: Weight shifting onto left leg — right leg lifting
// Pose 5: Right leg passing through (midstance) — body HIGH, legs close
export const WALK_POSES: Pose[] = [
  // Pose 0: Right leg forward contact, body LOW
  {
    headY: -TORSO_HEIGHT - HEAD_RADIUS + 4,
    hipY: 4, // body dips DOWN
    rightUpperLeg: { x: 14, y: 22 },   // right knee forward
    rightLowerLeg: { x: 20, y: 48 },   // right foot forward/down
    leftUpperLeg:  { x: -10, y: 20 },  // left knee back
    leftLowerLeg:  { x: -18, y: 42 },  // left foot back
    // Arms: contralateral — left arm forward when right leg forward
    leftUpperArm:  { x: -16, y: -22 }, // left arm swings forward
    leftForearm:   { x: -22, y: -8 },  // elbow bent forward
    rightUpperArm: { x: 14, y: -20 },  // right arm swings back
    rightForearm:  { x: 10, y: -6 },   // elbow bent back
  },
  // Pose 1: Weight shifting onto right leg — left leg lifting
  {
    headY: -TORSO_HEIGHT - HEAD_RADIUS + 2,
    hipY: 2,
    rightUpperLeg: { x: 8, y: 24 },    // right leg bearing weight
    rightLowerLeg: { x: 10, y: 50 },   // right foot planted
    leftUpperLeg:  { x: -6, y: 18 },   // left leg lifting off
    leftLowerLeg:  { x: -4, y: 32 },   // left foot lifting, knee bending
    leftUpperArm:  { x: -10, y: -24 },
    leftForearm:   { x: -14, y: -10 },
    rightUpperArm: { x: 10, y: -22 },
    rightForearm:  { x: 8, y: -10 },
  },
  // Pose 2: Left leg passing through midstance, body HIGH
  {
    headY: -TORSO_HEIGHT - HEAD_RADIUS - 2,
    hipY: -2, // body rises UP
    rightUpperLeg: { x: 4, y: 26 },    // right (planted) leg nearly straight
    rightLowerLeg: { x: 6, y: 52 },
    leftUpperLeg:  { x: -2, y: 22 },   // swing leg passing through, knee bent high
    leftLowerLeg:  { x: -8, y: 36 },   // knee bent noticeably
    leftUpperArm:  { x: -4, y: -26 },
    leftForearm:   { x: -8, y: -12 },
    rightUpperArm: { x: 4, y: -24 },
    rightForearm:  { x: 6, y: -12 },
  },
  // Pose 3: Left leg forward contact, body LOW (mirror of pose 0)
  {
    headY: -TORSO_HEIGHT - HEAD_RADIUS + 4,
    hipY: 4,
    leftUpperLeg:  { x: -14, y: 22 },
    leftLowerLeg:  { x: -20, y: 48 },
    rightUpperLeg: { x: 10, y: 20 },
    rightLowerLeg: { x: 18, y: 42 },
    // Arms: right arm forward when left leg forward
    rightUpperArm: { x: 16, y: -22 },
    rightForearm:  { x: 22, y: -8 },
    leftUpperArm:  { x: -14, y: -20 },
    leftForearm:   { x: -10, y: -6 },
  },
  // Pose 4: Weight shifting onto left leg (mirror of pose 1)
  {
    headY: -TORSO_HEIGHT - HEAD_RADIUS + 2,
    hipY: 2,
    leftUpperLeg:  { x: -8, y: 24 },
    leftLowerLeg:  { x: -10, y: 50 },
    rightUpperLeg: { x: 6, y: 18 },
    rightLowerLeg: { x: 4, y: 32 },
    rightUpperArm: { x: 10, y: -24 },
    rightForearm:  { x: 14, y: -10 },
    leftUpperArm:  { x: -10, y: -22 },
    leftForearm:   { x: -8, y: -10 },
  },
  // Pose 5: Right leg passing through midstance, body HIGH (mirror of pose 2)
  {
    headY: -TORSO_HEIGHT - HEAD_RADIUS - 2,
    hipY: -2,
    leftUpperLeg:  { x: -4, y: 26 },
    leftLowerLeg:  { x: -6, y: 52 },
    rightUpperLeg: { x: 2, y: 22 },
    rightLowerLeg: { x: 8, y: 36 },
    rightUpperArm: { x: 4, y: -26 },
    rightForearm:  { x: 8, y: -12 },
    leftUpperArm:  { x: -4, y: -24 },
    leftForearm:   { x: -6, y: -12 },
  },
];

// Sitting pose (cross-legged)
export const SIT_POSE: Pose = {
  headY: -TORSO_HEIGHT - HEAD_RADIUS + 2,
  hipY: 8,
  // Left leg: knee out-left, foot crosses to the right
  leftUpperLeg:  { x: -22, y: 18 },
  leftLowerLeg:  { x: 10, y: 28 },   // foot crosses under to right side
  // Right leg: knee out-right, foot crosses to the left
  rightUpperLeg: { x: 22, y: 18 },
  rightLowerLeg: { x: -10, y: 28 },  // foot crosses under to left side
  // Arms: elbows out, hands resting near knees
  leftUpperArm:  { x: -18, y: -16 },
  leftForearm:   { x: -24, y: -2 },
  rightUpperArm: { x: 18, y: -16 },
  rightForearm:  { x: 24, y: -2 },
};

// Smoothstep easing
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: LimbEndpoint, b: LimbEndpoint, t: number): LimbEndpoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

// Interpolate between two poses
export function interpolatePoses(a: Pose, b: Pose, rawT: number): Pose {
  const t = smoothstep(rawT);
  return {
    headY: lerp(a.headY, b.headY, t),
    hipY:  lerp(a.hipY, b.hipY, t),
    leftUpperLeg:  lerpPoint(a.leftUpperLeg, b.leftUpperLeg, t),
    leftLowerLeg:  lerpPoint(a.leftLowerLeg, b.leftLowerLeg, t),
    rightUpperLeg: lerpPoint(a.rightUpperLeg, b.rightUpperLeg, t),
    rightLowerLeg: lerpPoint(a.rightLowerLeg, b.rightLowerLeg, t),
    leftUpperArm:  lerpPoint(a.leftUpperArm, b.leftUpperArm, t),
    leftForearm:   lerpPoint(a.leftForearm, b.leftForearm, t),
    rightUpperArm: lerpPoint(a.rightUpperArm, b.rightUpperArm, t),
    rightForearm:  lerpPoint(a.rightForearm, b.rightForearm, t),
  };
}

// Get interpolated walk pose for a cycle position t in [0, 1)
export function getWalkPose(cycleT: number): Pose {
  const numPoses = WALK_POSES.length;
  const scaled = ((cycleT % 1) + 1) % 1 * numPoses;
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const poseA = WALK_POSES[i % numPoses];
  const poseB = WALK_POSES[(i + 1) % numPoses];
  return interpolatePoses(poseA, poseB, frac);
}

// Interpolate from a walk pose to the sit pose
export function getTransitionPose(walkT: number, sitT: number): Pose {
  const walkPose = getWalkPose(walkT);
  return interpolatePoses(walkPose, SIT_POSE, sitT);
}
