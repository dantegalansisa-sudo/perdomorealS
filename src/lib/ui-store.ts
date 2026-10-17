"use client";
import { createStore } from "./stores";
import type { LeadType } from "./types";

export type LeadModalState = {
  open: boolean;
  type: Exclude<LeadType, "whatsapp_click">;
  projectId?: string | null;
  propertyId?: string | null;
  interest?: string | null;
};
export const leadModal = createStore<LeadModalState>({ open: false, type: "info" });
export const openLeadModal = (opts: Omit<LeadModalState, "open">) => leadModal.set({ open: true, ...opts });

/** Per-page context set by pages: drives WhatsApp message, lead defaults and the locale switcher. */
export type PageContextState = {
  projectId?: string | null;
  propertyId?: string | null;
  interest?: string | null;
  /** Overrides the prefilled WhatsApp message (e.g. a specific property). */
  whatsappMessage?: string | null;
  alternates?: { es: string; en: string } | null;
};
export const pageContext = createStore<PageContextState>({});
