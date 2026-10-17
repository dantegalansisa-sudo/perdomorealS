import { getLocale, getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StaticPathname as AppPathname } from "@/i18n/routing";
import { getSettings } from "@/lib/data";
import { Logo } from "./Logo";
import { FooterContactLinks, CookieSettingsButton } from "./FooterClient";

export async function Footer() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const s = await getSettings();
  const year = new Date().getFullYear();

  const cols: { title: string; links: { href: AppPathname; label: string }[] }[] = [
    {
      title: t("footer.explore"),
      links: [
        { href: "/villas-macao", label: t("nav.villasMacao") },
        { href: "/villas", label: t("categories.villas") },
        { href: "/apartments", label: t("categories.apartments") },
        { href: "/houses", label: t("categories.houses") },
        { href: "/land", label: t("categories.land") },
        { href: "/projects", label: t("nav.projects") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("nav.about") },
        { href: "/blog", label: t("nav.blog") },
        { href: "/contact", label: t("nav.contact") },
        { href: "/properties", label: t("nav.properties") },
        { href: "/favorites", label: t("nav.favorites") },
        { href: "/compare", label: t("nav.compare") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/legal/privacy", label: t("footer.privacy") },
        { href: "/legal/cookies", label: t("footer.cookies") },
        { href: "/legal/terms", label: t("footer.terms") },
        { href: "/legal/disclaimer", label: t("footer.disclaimer") },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-navy pb-28 text-white md:pb-10">
      <div aria-hidden data-word="PERDOMO" className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] text-center font-display text-[24vw] leading-none text-white/[0.035] select-none before:content-[attr(data-word)]" />
      <div className="container-x relative pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">{t("footer.about")}</p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                {s.address}
              </li>
              <FooterContactLinks phone={s.phone} email={s.email} phoneIcon={<Phone className="size-4 text-gold" aria-hidden />} mailIcon={<Mail className="size-4 text-gold" aria-hidden />} />
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="eyebrow mb-4 text-gold">{c.title}</p>
                <ul className="space-y-2.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white/70 transition-colors hover:text-gold">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Perdomo Real Estate. {t("footer.rights")}
          </p>
          <p className="max-w-xl md:text-right">{t("footer.notice")}</p>
          <div className="flex items-center gap-4">
            {Object.entries(s.socials ?? {})
              .filter(([, url]) => url)
              .map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-gold">
                  {name}
                </a>
              ))}
            <CookieSettingsButton label={t("footer.cookieSettings")} />
          </div>
        </div>
        <p className="sr-only">{locale}</p>
      </div>
    </footer>
  );
}
