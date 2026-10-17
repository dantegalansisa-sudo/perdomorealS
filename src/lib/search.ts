import type { AmenityKey, ConstructionStatus, Property, PropertyType } from "./types";

export type SortKey = "newest" | "price_asc" | "price_desc" | "area_desc";
export type ViewKey = "grid" | "list" | "map";

export type Filters = {
  q: string;
  type: PropertyType[];
  zone: string[];
  minPrice: number | null;
  maxPrice: number | null;
  beds: number | null;
  baths: number | null;
  minBuilt: number | null;
  maxBuilt: number | null;
  minLot: number | null;
  maxLot: number | null;
  status: ConstructionStatus[];
  amen: AmenityKey[];
  project: string;
  sort: SortKey;
  view: ViewKey;
};

export const FILTER_AMENITIES: AmenityKey[] = ["pool", "sea_view", "gated", "furnished", "beach_access", "golf"];
export const ALL_TYPES: PropertyType[] = ["villa", "apartment", "house", "land"];
export const ALL_STATUS: ConstructionStatus[] = ["preventa", "construccion", "listo"];

const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const num = (v: string | null) => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseFilters(sp: URLSearchParams): Filters {
  const sort = sp.get("sort") as SortKey | null;
  const view = sp.get("view") as ViewKey | null;
  return {
    q: sp.get("q")?.slice(0, 80) ?? "",
    type: list(sp.get("type")).filter((t): t is PropertyType => ALL_TYPES.includes(t as PropertyType)),
    zone: list(sp.get("zone")),
    minPrice: num(sp.get("minPrice")),
    maxPrice: num(sp.get("maxPrice")),
    beds: num(sp.get("beds")),
    baths: num(sp.get("baths")),
    minBuilt: num(sp.get("minBuilt")),
    maxBuilt: num(sp.get("maxBuilt")),
    minLot: num(sp.get("minLot")),
    maxLot: num(sp.get("maxLot")),
    status: list(sp.get("status")).filter((s): s is ConstructionStatus => ALL_STATUS.includes(s as ConstructionStatus)),
    amen: list(sp.get("amen")) as AmenityKey[],
    project: sp.get("project") ?? "",
    sort: sort && ["newest", "price_asc", "price_desc", "area_desc"].includes(sort) ? sort : "newest",
    view: view && ["grid", "list", "map"].includes(view) ? view : "grid",
  };
}

/** Serialises only non-default values, so shared URLs stay short. */
export function toQueryString(f: Filters, lockedType?: PropertyType) {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  const types = lockedType ? [] : f.type;
  if (types.length) sp.set("type", types.join(","));
  if (f.zone.length) sp.set("zone", f.zone.join(","));
  if (f.minPrice != null) sp.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null) sp.set("maxPrice", String(f.maxPrice));
  if (f.beds) sp.set("beds", String(f.beds));
  if (f.baths) sp.set("baths", String(f.baths));
  if (f.minBuilt != null) sp.set("minBuilt", String(f.minBuilt));
  if (f.maxBuilt != null) sp.set("maxBuilt", String(f.maxBuilt));
  if (f.minLot != null) sp.set("minLot", String(f.minLot));
  if (f.maxLot != null) sp.set("maxLot", String(f.maxLot));
  if (f.status.length) sp.set("status", f.status.join(","));
  if (f.amen.length) sp.set("amen", f.amen.join(","));
  if (f.project) sp.set("project", f.project);
  if (f.sort !== "newest") sp.set("sort", f.sort);
  if (f.view !== "grid") sp.set("view", f.view);
  return sp.toString();
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function applyFilters(items: Property[], f: Filters, projectNames: Record<string, string> = {}) {
  const q = norm(f.q);
  const out = items.filter((p) => {
    if (f.type.length && !f.type.includes(p.type)) return false;
    if (f.zone.length && !f.zone.includes(p.zone)) return false;
    if (f.minPrice != null && (p.price ?? 0) < f.minPrice) return false;
    if (f.maxPrice != null && (p.price ?? Infinity) > f.maxPrice) return false;
    if (f.beds && p.bedrooms < f.beds) return false;
    if (f.baths && p.bathrooms < f.baths) return false;
    if (f.minBuilt != null && p.built_m2 < f.minBuilt) return false;
    if (f.maxBuilt != null && p.built_m2 > f.maxBuilt) return false;
    if (f.minLot != null && p.lot_m2 < f.minLot) return false;
    if (f.maxLot != null && p.lot_m2 > f.maxLot) return false;
    if (f.status.length && !f.status.includes(p.status)) return false;
    if (f.amen.length && !f.amen.every((a) => p.amenities.includes(a))) return false;
    if (f.project && p.project_id !== f.project) return false;
    if (q) {
      const hay = norm([p.title.es, p.title.en, p.zone, p.description.es, p.description.en, p.project_id ? projectNames[p.project_id] ?? "" : "", p.type].join(" "));
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const area = (p: Property) => (p.built_m2 || p.lot_m2) ?? 0;
  out.sort((a, b) => {
    switch (f.sort) {
      case "price_asc":
        return (a.price ?? Infinity) - (b.price ?? Infinity);
      case "price_desc":
        return (b.price ?? -1) - (a.price ?? -1);
      case "area_desc":
        return area(b) - area(a);
      default:
        return +new Date(b.created_at) - +new Date(a.created_at);
    }
  });
  return out;
}

export function activeFilterCount(f: Filters, lockedType?: PropertyType) {
  return (
    (f.q ? 1 : 0) +
    (lockedType ? 0 : f.type.length) +
    f.zone.length +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    (f.beds ? 1 : 0) +
    (f.baths ? 1 : 0) +
    (f.minBuilt != null || f.maxBuilt != null ? 1 : 0) +
    (f.minLot != null || f.maxLot != null ? 1 : 0) +
    f.status.length +
    f.amen.length +
    (f.project ? 1 : 0)
  );
}
