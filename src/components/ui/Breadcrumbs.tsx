import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

/** Visual breadcrumbs + BreadcrumbList JSON-LD. Items carry absolute URLs; the last item is the current page. */
export function Breadcrumbs({ items, className }: { items: { name: string; url: string }[]; className?: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-stone">
          {items.map((it, i) => (
            <li key={it.url} className="inline-flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3" aria-hidden />}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-navy">
                  {it.name}
                </span>
              ) : (
                <a href={new URL(it.url).pathname} className="hover:text-gold-dark">
                  {it.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items)} />
    </>
  );
}
