/** Renders JSON-LD. Pass null to render nothing (e.g. placeholder content). */
export function JsonLd({ data }: { data: object | null | (object | null)[] }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\u003c") }} />
      ))}
    </>
  );
}
