"use client";

export type TrackEvent =
  | "whatsapp_click"
  | "form_submit_success"
  | "price_request"
  | "visit_request"
  | "phone_click"
  | "email_click";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** Push to GTM's dataLayer. Safe before GTM loads (queue is replayed once consent loads it). */
export function track(event: TrackEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
