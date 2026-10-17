/**
 * Stylised isometric villa drawn in SVG. Stand-in for the transparent hero PNG
 * (same 4:3 framing) until real renders arrive. Pure, server-renderable.
 */
type Box = { x: number; y: number; z: number; w: number; d: number; h: number; tone: "wall" | "dark" | "slab" | "ground" | "glass" | "hedge" };
type Win = { box: number; face: "right" | "left"; u0: number; u1: number; v0: number; v1: number; lit?: boolean };

const S = 22; // scale
const C = Math.cos(Math.PI / 6);
const SN = Math.sin(Math.PI / 6);
const OX = 330;
const OY = 70;

const p = (x: number, y: number, z: number) => [OX + (x - y) * C * S, OY + (x + y) * SN * S - z * S] as const;
const pts = (list: (readonly [number, number])[]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

const TONES = {
  ground: { top: "#e7dcc6", right: "#cdbd9c", left: "#d9cbae" },
  wall: { top: "#ffffff", right: "#efe9de", left: "#f7f3ec" },
  dark: { top: "#2a3d5c", right: "#0b1f3a", left: "#14305a" },
  slab: { top: "#fbf9f5", right: "#d8d0c2", left: "#e6dfd2" },
  glass: { top: "#c9a961", right: "#a88b45", left: "#b99a52" },
  hedge: { top: "#9fb38a", right: "#6f8a5c", left: "#839e6e" },
};

const boxes: Box[] = [
  { x: 0, y: 0, z: 0, w: 22, d: 17, h: 0.9, tone: "ground" },
  { x: 2.4, y: 2.2, z: 0.9, w: 11, d: 7.2, h: 3.3, tone: "wall" },
  { x: 13.4, y: 5.2, z: 0.9, w: 4.4, d: 4.2, h: 2.6, tone: "dark" },
  { x: 4.2, y: 0.8, z: 4.2, w: 11.8, d: 6.4, h: 3.1, tone: "dark" },
  { x: 3.8, y: 0.4, z: 7.3, w: 12.6, d: 7.2, h: 0.45, tone: "slab" },
  { x: 2.0, y: 1.8, z: 4.2, w: 2.2, d: 8.0, h: 0.35, tone: "slab" },
  { x: 12.6, y: 9.4, z: 0.9, w: 0.5, d: 6.8, h: 0.8, tone: "hedge" },
  { x: 0.6, y: 14.6, z: 0.9, w: 11.2, d: 0.8, h: 0.7, tone: "hedge" },
];

const windows: Win[] = [
  { box: 1, face: "left", u0: 0.08, u1: 0.46, v0: 0.12, v1: 0.88, lit: true },
  { box: 1, face: "left", u0: 0.52, u1: 0.92, v0: 0.12, v1: 0.88, lit: true },
  { box: 1, face: "right", u0: 0.55, u1: 0.9, v0: 0.15, v1: 0.85 },
  { box: 3, face: "left", u0: 0.06, u1: 0.36, v0: 0.14, v1: 0.86, lit: true },
  { box: 3, face: "left", u0: 0.42, u1: 0.94, v0: 0.14, v1: 0.86, lit: true },
  { box: 3, face: "right", u0: 0.12, u1: 0.88, v0: 0.18, v1: 0.82, lit: true },
  { box: 2, face: "left", u0: 0.15, u1: 0.85, v0: 0.15, v1: 0.8 },
];

function faces(b: Box) {
  const { x, y, z, w, d, h } = b;
  return {
    top: [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)],
    right: [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)],
    left: [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)],
  };
}

function windowPoly(win: Win) {
  const b = boxes[win.box];
  const z0 = b.z + win.v0 * b.h;
  const z1 = b.z + win.v1 * b.h;
  if (win.face === "right") {
    const yA = b.y + win.u0 * b.d;
    const yB = b.y + win.u1 * b.d;
    const x = b.x + b.w + 0.01;
    return [p(x, yA, z0), p(x, yB, z0), p(x, yB, z1), p(x, yA, z1)];
  }
  const xA = b.x + win.u0 * b.w;
  const xB = b.x + win.u1 * b.w;
  const y = b.y + b.d + 0.01;
  return [p(xA, y, z0), p(xB, y, z0), p(xB, y, z1), p(xA, y, z1)];
}

const trees = [
  { x: 19.5, y: 3, s: 1.3 },
  { x: 20.2, y: 6.2, s: 1 },
  { x: 1.4, y: 12.4, s: 1.15 },
  { x: 18.8, y: 14.6, s: 0.9 },
  { x: 0.9, y: 1.2, s: 0.8 },
];

const lights = [
  [14, 16.2],
  [10, 16.2],
  [6, 16.2],
  [21.6, 11],
  [21.6, 7],
] as const;

export function IsoVilla({ className, title = "Villa" }: { className?: string; title?: string }) {
  const order = boxes.map((b, i) => ({ b, i })).sort((a, z) => a.b.x + a.b.y + a.b.z * 1.4 - (z.b.x + z.b.y + z.b.z * 1.4));
  // Pool sits on the ground slab, in front of the villa
  const pool = [p(4, 10.6, 0.92), p(11.6, 10.6, 0.92), p(11.6, 14, 0.92), p(4, 14, 0.92)];
  const poolInner = [p(4.4, 11, 0.92), p(11.2, 11, 0.92), p(11.2, 13.6, 0.92), p(4.4, 13.6, 0.92)];
  const deck = [p(3.2, 9.6, 0.91), p(12.4, 9.6, 0.91), p(12.4, 10.6, 0.91), p(3.2, 10.6, 0.91)];

  return (
    <svg viewBox="0 0 640 480" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id="iso-pool" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe1e6" />
          <stop offset="1" stopColor="#6fb3c2" />
        </linearGradient>
        <radialGradient id="iso-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0b1f3a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0b1f3a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="iso-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e2b0" />
          <stop offset="1" stopColor="#d9a64e" />
        </linearGradient>
      </defs>
      <ellipse cx="330" cy="400" rx="300" ry="62" fill="url(#iso-shadow)" />
      {order.map(({ b, i }) => {
        const f = faces(b);
        const tone = TONES[b.tone];
        return (
          <g key={i}>
            <polygon points={pts(f.left)} fill={tone.left} />
            <polygon points={pts(f.right)} fill={tone.right} />
            <polygon points={pts(f.top)} fill={tone.top} />
            {i === 0 && (
              <>
                <polygon points={pts(deck)} fill="#c8a77a" />
                <polygon points={pts(pool)} fill="#f5f1ea" />
                <polygon points={pts(poolInner)} fill="url(#iso-pool)" />
              </>
            )}
            {windows
              .filter((w) => w.box === i)
              .map((w, k) => (
                <polygon key={k} points={pts(windowPoly(w))} fill={w.lit ? "url(#iso-glow)" : "#3d5378"} opacity={w.lit ? 0.95 : 0.9} stroke="#0b1f3a" strokeOpacity="0.25" strokeWidth="1" />
              ))}
          </g>
        );
      })}
      {trees.map((tr, k) => {
        const [bx, by] = p(tr.x, tr.y, 0.9);
        const r = 16 * tr.s;
        return (
          <g key={k}>
            <ellipse cx={bx} cy={by + 2} rx={r * 0.8} ry={r * 0.32} fill="#0b1f3a" opacity="0.12" />
            <line x1={bx} y1={by} x2={bx} y2={by - r * 1.4} stroke="#7a5c3e" strokeWidth={2.4 * tr.s} strokeLinecap="round" />
            <circle cx={bx} cy={by - r * 1.8} r={r} fill={k % 2 ? "#8ea878" : "#d39b4a"} />
            <circle cx={bx - r * 0.35} cy={by - r * 2.05} r={r * 0.55} fill="#ffffff" opacity="0.18" />
          </g>
        );
      })}
      {lights.map(([x, y], k) => {
        const [lx, ly] = p(x, y, 0.95);
        return <circle key={k} cx={lx} cy={ly} r="2.6" fill="#f6d68a" />;
      })}
    </svg>
  );
}
