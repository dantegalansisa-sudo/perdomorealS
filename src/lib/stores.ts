"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed stores (favorites, compare, recently viewed) shared across tabs.
 * Every access is wrapped: storage can be unavailable (private mode, blocked cookies).
 */
type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const cacheMap = new Map<string, string[]>();
const EMPTY: string[] = [];

function read(key: string): string[] {
  if (cacheMap.has(key)) return cacheMap.get(key)!;
  let val: string[] = EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    val = raw ? (JSON.parse(raw) as string[]) : EMPTY;
  } catch {
    val = EMPTY;
  }
  cacheMap.set(key, val);
  return val;
}

function write(key: string, value: string[]) {
  cacheMap.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  listeners.get(key)?.forEach((l) => l());
}

function subscribe(key: string, l: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) {
      cacheMap.delete(key);
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.get(key)!.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

function useList(key: string) {
  const items = useSyncExternalStore(
    useCallback((l: Listener) => subscribe(key, l), [key]),
    () => read(key),
    () => EMPTY
  );
  return items;
}

export const FAVORITES_KEY = "pre:favorites";
export const COMPARE_KEY = "pre:compare";
export const RECENT_KEY = "pre:recent";
export const COMPARE_MAX = 3;

export function useFavorites() {
  const items = useList(FAVORITES_KEY);
  const toggle = useCallback((id: string) => {
    const cur = read(FAVORITES_KEY);
    write(FAVORITES_KEY, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, []);
  return { items, toggle, has: (id: string) => items.includes(id) };
}

export function useCompare() {
  const items = useList(COMPARE_KEY);
  /** Returns false when the list is full. */
  const toggle = useCallback((id: string) => {
    const cur = read(COMPARE_KEY);
    if (cur.includes(id)) {
      write(COMPARE_KEY, cur.filter((x) => x !== id));
      return true;
    }
    if (cur.length >= COMPARE_MAX) return false;
    write(COMPARE_KEY, [...cur, id]);
    return true;
  }, []);
  const clear = useCallback(() => write(COMPARE_KEY, []), []);
  return { items, toggle, clear, has: (id: string) => items.includes(id), full: items.length >= COMPARE_MAX };
}

export function useRecent() {
  const items = useList(RECENT_KEY);
  const push = useCallback((id: string) => {
    const cur = read(RECENT_KEY).filter((x) => x !== id);
    write(RECENT_KEY, [id, ...cur].slice(0, 8));
  }, []);
  return { items, push };
}

/** Generic in-memory store for cross-component UI state (lead modal, page context). */
export function createStore<T>(initial: T) {
  let state = initial;
  const subs = new Set<Listener>();
  return {
    get: () => state,
    set: (next: Partial<T>) => {
      state = { ...state, ...next };
      subs.forEach((s) => s());
    },
    subscribe: (l: Listener) => {
      subs.add(l);
      return () => subs.delete(l);
    },
  };
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
