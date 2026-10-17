"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Rotate3d } from "lucide-react";
import { cn } from "@/lib/utils";

type Source = { kind: "youtube"; src: string } | { kind: "iframe"; src: string };

function youtubeId(u: URL): string | null {
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{6,})/);
    return m?.[2] ?? null;
  }
  return null;
}

function parse(url: string | null): Source | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    const id = youtubeId(u);
    if (id && /^[\w-]{6,20}$/.test(id)) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1` };
    return { kind: "iframe", src: u.toString() };
  } catch {
    return null;
  }
}

/**
 * 16:9 video / virtual tour. YouTube uses youtube-nocookie behind a click-to-load facade (no iframe,
 * no third-party request until the visitor clicks). Matterport and other https embeds use the same facade.
 */
export function VideoEmbed({ url, title }: { url: string | null; title: string }) {
  const t = useTranslations("tools.video");
  const source = parse(url);
  const [loaded, setLoaded] = useState(false);

  if (!source) {
    return (
      <div className="relative isolate flex aspect-video items-center justify-center overflow-hidden rounded-3xl bg-navy text-white">
        <svg className="absolute inset-0 -z-10 h-full w-full opacity-30" aria-hidden>
          <defs>
            <radialGradient id="ve-glow" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#c9a961" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0b1f3a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#ve-glow)" />
        </svg>
        <div className="flex max-w-md flex-col items-center gap-3 px-6 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-gold/50 text-gold">
            <Rotate3d className="size-6" aria-hidden />
          </span>
          <p className="font-display text-2xl tracking-wide sm:text-3xl">{t("soon")}</p>
          <p className="hidden text-sm leading-relaxed text-white/70 sm:block">{t("soonText")}</p>
        </div>
      </div>
    );
  }

  if (loaded) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-navy">
        <iframe
          src={source.src}
          title={title}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={source.kind === "youtube" ? t("play", { title }) : t("load", { title })}
      className="group relative isolate flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl bg-navy text-white"
    >
      <span className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(201,169,97,0.35),transparent_65%)]" aria-hidden />
      <span className="flex flex-col items-center gap-4 px-6 text-center">
        <span
          className={cn(
            "grid size-20 place-items-center rounded-full bg-gold text-navy shadow-[0_20px_50px_-15px_rgba(201,169,97,0.9)] transition-transform duration-500 group-hover:scale-110"
          )}
        >
          {source.kind === "youtube" ? <Play className="ml-1 size-8" fill="currentColor" aria-hidden /> : <Rotate3d className="size-8" aria-hidden />}
        </span>
        <span className="font-display text-2xl tracking-wide sm:text-3xl">{title}</span>
        <span className="text-[11px] text-white/60">{t("privacy")}</span>
      </span>
    </button>
  );
}
