// Pure layout maths for the necklace. No DOM, no randomness, so it is SSR-safe.
// Everything is expressed in SVG viewBox units.
//
// buildLayout(mode) returns:
//   { mode, vw, vh, pathD, start, end, centre, heroD, beads }
// where each bead is { id, src, x, y, d, size, pendant }.

const CONFIG = {
  desktop: {
    vw: 1200,
    vh: 800,
    p0: [180, 150],
    c1: [260, 700],
    c2: [940, 700],
    p3: [1020, 150],
    count: 23, // keep ODD so one bead sits dead-centre (the pendant)
    heroD: 340,
  },
  mobile: {
    vw: 600,
    vh: 1000,
    p0: [70, 220],
    c1: [90, 900],
    c2: [510, 900],
    p3: [530, 220],
    count: 17, // keep ODD
    heroD: 300,
  },
};

const PALETTE = ["teal", "royal", "pearl", "gold", "coral"];
const PENDANT_COLOUR = "coral";
const PENDANT_SCALE = 2.0; // pendant diameter relative to a base bead
const BEAD_FILL = 420 / 512; // visible circle vs. full image width in the SVG art
const GAP = 0.98; // <1 = beads overlap very slightly so no thread gaps show

const SAMPLES = 800;

function bezier(t, p0, c1, c2, p3) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
  ];
}

function sampleCurve(p0, c1, c2, p3) {
  const pts = [];
  const cum = [0];
  for (let i = 0; i <= SAMPLES; i++) pts.push(bezier(i / SAMPLES, p0, c1, c2, p3));
  for (let i = 1; i <= SAMPLES; i++) {
    cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return { pts, cum, length: cum[SAMPLES] };
}

function pointAt(curve, dist) {
  const { pts, cum } = curve;
  const target = Math.min(Math.max(dist, 0), curve.length);
  let lo = 0;
  let hi = SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid;
    else hi = mid;
  }
  const span = cum[hi] - cum[lo] || 1;
  const f = (target - cum[lo]) / span;
  return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
}

export function buildLayout(mode) {
  const cfg = CONFIG[mode];
  const curve = sampleCurve(cfg.p0, cfg.c1, cfg.c2, cfg.p3);
  const last = cfg.count - 1;
  const mid = last / 2;

  // Graduated sizes: small at the clasp, larger toward the centre, big pendant.
  const m = Array.from({ length: cfg.count }, (_, i) =>
    i === mid ? PENDANT_SCALE : 0.8 + 0.5 * (1 - Math.abs(i - mid) / mid)
  );

  // Solve for the base diameter so the beads exactly fill the curve.
  let k = m[0] / 2 + m[last] / 2;
  for (let i = 0; i < last; i++) k += ((m[i] + m[i + 1]) / 2) * GAP;
  const base = curve.length / k;

  let dist = (m[0] * base) / 2;
  const beads = m.map((mi, i) => {
    if (i > 0) dist += ((m[i - 1] + mi) / 2) * base * GAP;
    const [x, y] = pointAt(curve, dist);
    const d = mi * base;
    const pendant = i === mid;
    const colour = pendant ? PENDANT_COLOUR : PALETTE[i % PALETTE.length];
    return { id: i, src: `/beads/bead-${colour}.svg`, x, y, d, size: d / BEAD_FILL, pendant };
  });

  return {
    mode,
    vw: cfg.vw,
    vh: cfg.vh,
    pathD: `M ${cfg.p0[0]} ${cfg.p0[1]} C ${cfg.c1[0]} ${cfg.c1[1]}, ${cfg.c2[0]} ${cfg.c2[1]}, ${cfg.p3[0]} ${cfg.p3[1]}`,
    start: cfg.p0,
    end: cfg.p3,
    // Nudged slightly below centre so the big bead clears the two-line headline.
    centre: { x: cfg.vw / 2, y: cfg.vh * 0.54 },
    heroD: cfg.heroD,
    beads,
  };
}
