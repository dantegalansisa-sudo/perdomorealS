import "server-only";
import { cache } from "react";
import { hasSupabase } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import {
  seedFaqs,
  seedModels,
  seedPosts,
  seedProjects,
  seedProperties,
  seedSettings,
  seedUnits,
} from "@/data/seed";
import type { Faq, MediaItem, Post, Project, Property, SiteSettings, Unit, VillaModel } from "@/lib/types";

/**
 * Public data access. Reads from Supabase when configured, otherwise from the bundled seed
 * so the site always builds and renders. All functions return only published content.
 */

async function attachMedia<T extends { id: string; media?: MediaItem[] }>(
  ownerType: MediaItem["owner_type"],
  rows: T[]
): Promise<T[]> {
  if (!hasSupabase || rows.length === 0) return rows.map((r) => ({ ...r, media: r.media ?? [] }));
  const { data } = await createPublicClient()
    .from("media")
    .select("*")
    .eq("owner_type", ownerType)
    .in(
      "owner_id",
      rows.map((r) => r.id)
    )
    .order("sort");
  const byOwner = new Map<string, MediaItem[]>();
  for (const m of (data ?? []) as MediaItem[]) {
    const list = byOwner.get(m.owner_id) ?? [];
    list.push(m);
    byOwner.set(m.owner_id, list);
  }
  return rows.map((r) => ({ ...r, media: sortMedia(byOwner.get(r.id) ?? []) }));
}

/** Cover first, then by sort. */
function sortMedia(list: MediaItem[]) {
  return [...list].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort - b.sort);
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!hasSupabase) return seedSettings;
  const { data } = await createPublicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  return data ? { ...seedSettings, ...(data as SiteSettings) } : seedSettings;
});

export const getProjects = cache(async (): Promise<Project[]> => {
  if (!hasSupabase) return attachMedia("project", seedProjects.filter((p) => p.published));
  const { data } = await createPublicClient().from("projects").select("*").eq("published", true).order("sort");
  return attachMedia("project", (data ?? []) as Project[]);
});

export const getFlagshipProject = cache(async (): Promise<Project | null> => {
  const projects = await getProjects();
  return projects.find((p) => p.is_flagship) ?? projects[0] ?? null;
});

export const getProjectBySlug = cache(async (slug: string, locale: string): Promise<Project | null> => {
  const projects = await getProjects();
  const key = locale === "en" ? "slug_en" : "slug_es";
  return projects.find((p) => p[key] === slug) ?? null;
});

export const getModels = cache(async (projectId: string): Promise<VillaModel[]> => {
  if (!hasSupabase) return attachMedia("model", seedModels.filter((m) => m.project_id === projectId));
  const { data } = await createPublicClient().from("villa_models").select("*").eq("project_id", projectId).order("sort");
  return attachMedia("model", (data ?? []) as VillaModel[]);
});

export const getUnits = cache(async (projectId: string): Promise<Unit[]> => {
  if (!hasSupabase) return seedUnits.filter((u) => u.project_id === projectId);
  const { data } = await createPublicClient().from("units").select("*").eq("project_id", projectId).order("lot_number");
  return (data ?? []) as Unit[];
});

export const getProperties = cache(async (): Promise<Property[]> => {
  if (!hasSupabase) return attachMedia("property", seedProperties.filter((p) => p.published));
  const { data } = await createPublicClient()
    .from("properties")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return attachMedia("property", (data ?? []) as Property[]);
});

export const getPropertyBySlug = cache(async (slug: string, locale: string): Promise<Property | null> => {
  const list = await getProperties();
  const key = locale === "en" ? "slug_en" : "slug_es";
  return list.find((p) => p[key] === slug) ?? null;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  if (!hasSupabase) return seedPosts.filter((p) => p.published);
  const { data } = await createPublicClient()
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []) as Post[];
});

export const getPostBySlug = cache(async (slug: string, locale: string): Promise<Post | null> => {
  const list = await getPosts();
  const key = locale === "en" ? "slug_en" : "slug_es";
  return list.find((p) => p[key] === slug) ?? null;
});

export const getFaqs = cache(async (projectId: string | null = null): Promise<Faq[]> => {
  if (!hasSupabase) return seedFaqs.filter((f) => f.published && f.project_id === projectId);
  let q = createPublicClient().from("faqs").select("*").eq("published", true).order("sort");
  q = projectId ? q.eq("project_id", projectId) : q.is("project_id", null);
  const { data } = await q;
  return (data ?? []) as Faq[];
});

/** Whether "sample information" labels should render for a given row. */
export async function showPlaceholder(row: { is_placeholder?: boolean } | null | undefined) {
  if (!row?.is_placeholder) return false;
  const s = await getSettings();
  return s.show_placeholder_labels;
}
