"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MapMarker } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-sand-2" /> });

/** Mounts the map only when it scrolls near the viewport (keeps Leaflet off the critical path). */
export function LazyMap(props: { markers: MapMarker[]; activeId?: string | null; onMarkerClick?: (id: string) => void; center?: [number, number]; zoom?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={props.className ?? "h-full w-full"}>
      {show ? <LeafletMap {...props} className="h-full w-full" /> : <div className="h-full w-full bg-sand-2" />}
    </div>
  );
}
export type { MapMarker };
