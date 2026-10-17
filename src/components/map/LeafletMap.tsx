"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as L from "leaflet";

export type MapMarker = { id: string; lat: number; lng: number; label: string; href?: string; popup?: string };

/**
 * Leaflet + OpenStreetMap/CARTO tiles (no API key). Markers are HTML pills; `activeId` highlights one
 * (synced with listings). Never import directly — use <LazyMap/> so Leaflet stays out of the initial bundle.
 */
export default function LeafletMap({
  markers,
  activeId,
  onMarkerClick,
  center,
  zoom = 11,
  className,
}: {
  markers: MapMarker[];
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const lib = useRef<typeof L | null>(null);
  const refs = useRef(new Map<string, L.Marker>());
  const latest = useRef({ markers, activeId, onMarkerClick, center });
  latest.current = { markers, activeId, onMarkerClick, center };

  function draw() {
    const Lf = lib.current;
    const { markers: list, activeId: active, onMarkerClick: onClick, center: c } = latest.current;
    if (!Lf || !map.current || !layer.current) return;
    layer.current.clearLayers();
    refs.current.clear();
    list.forEach((m) => {
      const icon = Lf.divIcon({ className: "", html: `<span class="perdomo-marker" data-active="${m.id === active}">${escapeHtml(m.label)}</span>`, iconSize: [0, 0] });
      const mk = Lf.marker([m.lat, m.lng], { icon, title: m.label, keyboard: true }).addTo(layer.current!);
      if (m.href) mk.bindPopup(`<a href="${escapeHtml(m.href)}" style="font-weight:700;color:#0B1F3A">${escapeHtml(m.popup ?? m.label)}</a>`);
      else if (m.popup) mk.bindPopup(escapeHtml(m.popup));
      mk.on("click", () => onClick?.(m.id));
      refs.current.set(m.id, mk);
    });
    if (!c && list.length > 1) map.current.fitBounds(Lf.latLngBounds(list.map((m) => [m.lat, m.lng] as [number, number])), { padding: [40, 40], maxZoom: 14 });
    else if (!c && list.length === 1) map.current.setView([list[0].lat, list[0].lng], 14);
  }

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || map.current) return;
      const Lf = ((mod as unknown as { default?: typeof L }).default ?? mod) as typeof L;
      lib.current = Lf;
      map.current = Lf.map(el.current, { scrollWheelZoom: false }).setView(latest.current.center ?? [18.65, -68.45], zoom);
      Lf.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map.current);
      layer.current = Lf.layerGroup().addTo(map.current);
      draw();
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(draw, [markers]);

  useEffect(() => {
    refs.current.forEach((mk, id) => {
      const node = mk.getElement()?.querySelector(".perdomo-marker") as HTMLElement | null;
      if (node) node.dataset.active = String(id === activeId);
      mk.setZIndexOffset(id === activeId ? 1000 : 0);
    });
  }, [activeId]);

  return <div ref={el} className={className ?? "h-full w-full"} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
