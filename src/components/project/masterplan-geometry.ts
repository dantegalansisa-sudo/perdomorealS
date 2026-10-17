/**
 * Programmatic site plan: lots are laid out along an organic elliptical loop street — an outer ring
 * (perimeter lots) and an inner ring around a central clubhouse, pool and green areas. Each lot's
 * frontage is proportional to its lot size. Pure functions, deterministic output (SSR-safe).
 */
import type { Unit } from "@/lib/types";

export const PLAN = { W: 1200, H: 820, CX: 600, CY: 400, A: 420, B: 255, STREET: 34, SIDEWALK: 4, DEPTH_OUT: 92, DEPTH_IN: 84 } as const;

export type LotShape = { id: string; d: string; cx: number; cy: number; ring: "outer" | "inner" };
export type Tree = { x: number; y: number; r: number };
export type MasterplanGeometry = {
  lots: LotShape[];
  wallPath: string;
  lawnPath: string;
  trees: Tree[];
  parkTrees: Tree[];
};

const { CX, CY, A, B, STREET, SIDEWALK, DEPTH_OUT, DEPTH_IN } = PLAN;
const T0 = Math.PI / 2; // entrance at the bottom
const LOT_GAP = 4;
const OUTER_GAP = 120; // entrance road opening
const INNER_GAP = 90; // pedestrian path to the clubhouse

/** Point on the street centre-line ellipse at parameter t, offset `d` along the outward normal. */
export function planPoint(t: number, d: number): [number, number] {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const nx = B * c;
  const ny = A * s;
  const len = Math.hypot(nx, ny) || 1;
  return [CX + A * c + (d * nx) / len, CY + B * s + (d * ny) / len];
}

function arcTable(d: number, steps = 1440) {
  const ts: number[] = [T0];
  const ss: number[] = [0];
  let [px, py] = planPoint(T0, d);
  for (let i = 1; i <= steps; i++) {
    const t = T0 + (i / steps) * Math.PI * 2;
    const [x, y] = planPoint(t, d);
    ss.push(ss[i - 1] + Math.hypot(x - px, y - py));
    ts.push(t);
    px = x;
    py = y;
  }
  return { ts, ss, L: ss[steps] };
}

function tAt(table: ReturnType<typeof arcTable>, s: number) {
  const { ts, ss } = table;
  let lo = 0;
  let hi = ss.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ss[mid] < s) lo = mid;
    else hi = mid;
  }
  const span = ss[hi] - ss[lo] || 1;
  return ts[lo] + ((s - ss[lo]) / span) * (ts[hi] - ts[lo]);
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const f = (n: number) => r1(n).toFixed(1);

function ringLots(units: Unit[], d0: number, d1: number, gap: number, ring: LotShape["ring"]): LotShape[] {
  if (units.length === 0) return [];
  const mid = (d0 + d1) / 2;
  const table = arcTable(mid);
  const usable = table.L - gap;
  const weights = units.map((u) => Math.max(1, u.lot_m2 ?? 0) || 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  let s = gap / 2;
  const K = 6;
  return units.map((u, i) => {
    const len = (usable * weights[i]) / sum;
    const ta = tAt(table, s + LOT_GAP / 2);
    const tb = tAt(table, s + len - LOT_GAP / 2);
    s += len;
    const pts: [number, number][] = [];
    for (let k = 0; k <= K; k++) pts.push(planPoint(ta + ((tb - ta) * k) / K, d0));
    for (let k = K; k >= 0; k--) pts.push(planPoint(ta + ((tb - ta) * k) / K, d1));
    const [cx, cy] = planPoint((ta + tb) / 2, mid);
    return { id: u.id, ring, cx: r1(cx), cy: r1(cy), d: `M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join("L")}Z` };
  });
}

function closedPath(d: number, steps = 160) {
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const [x, y] = planPoint((i / steps) * Math.PI * 2, d);
    pts.push(`${f(x)},${f(y)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Deterministic pseudo-random generator (LCG). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildMasterplan(units: Unit[]): MasterplanGeometry {
  const sorted = [...units].sort((a, b) => a.lot_number - b.lot_number);
  const outD0 = STREET / 2 + SIDEWALK;
  const outD1 = outD0 + DEPTH_OUT;
  const inD0 = -(STREET / 2 + SIDEWALK);
  const inD1 = inD0 - DEPTH_IN;

  const outerLen = arcTable((outD0 + outD1) / 2, 360).L - OUTER_GAP;
  const innerLen = arcTable((inD0 + inD1) / 2, 360).L - INNER_GAP;
  const nOuter = sorted.length < 8 ? sorted.length : Math.round((sorted.length * outerLen) / (outerLen + innerLen));

  const lots = [
    ...ringLots(sorted.slice(0, nOuter), outD0, outD1, OUTER_GAP, "outer"),
    ...ringLots(sorted.slice(nOuter), inD0, inD1, INNER_GAP, "inner"),
  ];

  // Trees outside the perimeter wall.
  const rand = rng(89);
  const wallD = outD1 + 15;
  const trees: Tree[] = [];
  for (let i = 0; i < 400 && trees.length < 64; i++) {
    const x = 14 + rand() * (PLAN.W - 28);
    const y = 14 + rand() * (PLAN.H - 28);
    const nx = (x - CX) / (A + wallD + 18);
    const ny = (y - CY) / (B + wallD + 18);
    const nearRoad = Math.abs(x - CX) < 60 && y > CY + B;
    const nearCompass = x > 1075 && y < 130;
    if (nx * nx + ny * ny > 1 && !nearRoad && !nearCompass) trees.push({ x: r1(x), y: r1(y), r: r1(7 + rand() * 7) });
  }

  // Trees in the central park, avoiding the clubhouse/pool block and the path.
  const parkTrees: Tree[] = [];
  const rand2 = rng(7);
  const lawnD = inD1 - 8;
  for (let i = 0; i < 400 && parkTrees.length < 26; i++) {
    const x = CX - 300 + rand2() * 600;
    const y = CY - 140 + rand2() * 280;
    const nx = (x - CX) / (A + lawnD - 22);
    const ny = (y - CY) / (B + lawnD - 22);
    const inCore = Math.abs(x - CX) < 115 && y > CY - 95 && y < CY + 75;
    const onPath = Math.abs(x - CX) < 26 && y > CY;
    if (nx * nx + ny * ny < 1 && !inCore && !onPath) parkTrees.push({ x: r1(x), y: r1(y), r: r1(6 + rand2() * 6) });
  }

  return { lots, wallPath: closedPath(wallD), lawnPath: closedPath(lawnD), trees, parkTrees };
}
