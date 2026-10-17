"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Select that writes `?{param}=id` to the URL (server page re-renders). */
export function ProjectPicker({
  projects,
  value,
  param = "p",
  allLabel,
  extra,
}: {
  projects: { id: string; name: string }[];
  value: string;
  param?: string;
  allLabel?: string;
  extra?: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <select
      className="field !w-auto min-w-[220px] !py-2 font-bold"
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(sp.toString());
        if (e.target.value) next.set(param, e.target.value);
        else next.delete(param);
        router.push(`${pathname}${next.size ? `?${next}` : ""}`);
      }}
      aria-label="Proyecto"
    >
      {allLabel !== undefined && <option value="">{allLabel}</option>}
      {extra?.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
