import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** Default Open Graph image (1200×630) until real photography exists. */
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FAF8F4", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#0B1F3A", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A961", fontSize: 40, fontWeight: 800 }}>P</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: "#0B1F3A", letterSpacing: 4 }}>PERDOMO</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#A88B45", letterSpacing: 8 }}>REAL ESTATE</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 82, fontWeight: 900, color: "#0B1F3A", lineHeight: 1 }}>LUXURY REAL ESTATE</span>
          <span style={{ fontSize: 82, fontWeight: 900, color: "#C9A961", lineHeight: 1 }}>IN PUNTA CANA</span>
          <span style={{ fontSize: 28, color: "#7B7468", marginTop: 24 }}>Macao · Bávaro · Cap Cana</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
