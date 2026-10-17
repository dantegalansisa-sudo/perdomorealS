"use client";
import { createStore } from "@/lib/stores";

/** Selected unit shared by the masterplan and the availability table ("view on plan"). */
export const unitSelection = createStore<{ id: string | null }>({ id: null });
export const selectUnit = (id: string | null) => unitSelection.set({ id });
