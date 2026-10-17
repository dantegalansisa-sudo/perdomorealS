"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Heart, Menu, Search, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { StaticPathname as AppPathname } from "@/i18n/routing";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { Magnetic } from "@/components/motion/Magnetic";
import { useFavorites } from "@/lib/stores";
import { openLeadModal } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";

const NAV: { href: AppPathname; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/villas-macao", key: "villasMacao" },
  { href: "/properties", key: "properties" },
  { href: "/projects", key: "projects" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
];

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { items: favs } = useFavorites();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawer(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({ pathname: "/properties", query: q ? { q } : {} });
    setSearchOpen(false);
  };

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-full bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t("skipToContent")}
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-[background-color,box-shadow,padding] duration-500",
          scrolled ? "bg-sand/85 py-2 shadow-[0_10px_30px_-20px_rgba(11,31,58,0.35)] backdrop-blur-xl" : "py-3 lg:py-4"
        )}
      >
        <div className="container-x flex items-center justify-between gap-4">
          <Link href="/" aria-label="Perdomo Real Estate — Home" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label={t("mainNav")} className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-white/60 bg-white/55 p-1.5 shadow-[0_8px_30px_-18px_rgba(11,31,58,0.45)] backdrop-blur-xl">
              {NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-colors",
                      isActive(item.href) ? "text-white" : "text-navy-soft hover:text-navy"
                    )}
                  >
                    {isActive(item.href) && (
                      <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-navy" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    {t(`nav.${item.key}` as never)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("search")}
              aria-expanded={searchOpen}
              className="grid size-10 place-items-center rounded-full border border-navy/15 bg-white/60 text-navy backdrop-blur transition-colors hover:border-gold hover:bg-white"
            >
              <Search className="size-4" />
            </button>
            <Link
              href="/favorites"
              aria-label={t("favorites")}
              className="relative hidden size-10 place-items-center rounded-full border border-navy/15 bg-white/60 text-navy backdrop-blur transition-colors hover:border-gold hover:bg-white sm:grid"
            >
              <Heart className="size-4" />
              {favs.length > 0 && (
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-navy">{favs.length}</span>
              )}
            </Link>
            <LocaleSwitcher className="hidden sm:inline-flex" />
            <Magnetic className="hidden xl:inline-block">
              <button type="button" onClick={() => openLeadModal({ type: "info" })} className="btn btn-gold btn-sm">
                {t("ctaConsult")}
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label={t("openMenu")}
              aria-expanded={drawer}
              className="grid size-10 place-items-center rounded-full bg-navy text-white lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={submitSearch}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="container-x mt-3"
              role="search"
            >
              <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-xl">
                <Search className="size-4 text-stone" aria-hidden />
                <label htmlFor="header-search" className="sr-only">
                  {t("search")}
                </label>
                <input
                  id="header-search"
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                />
                <button type="submit" className="btn btn-gold btn-sm">
                  {t("searchGo")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[75] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label={t("closeMenu")} className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t("mainNav")}
              className="absolute top-0 right-0 flex h-full w-[86%] max-w-sm flex-col bg-sand p-6"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button type="button" onClick={() => setDrawer(false)} aria-label={t("closeMenu")} className="grid size-10 place-items-center rounded-full bg-white">
                  <X className="size-5" />
                </button>
              </div>
              <nav aria-label={t("mainNav")}>
                <ul className="space-y-1">
                  {[...NAV, { href: "/blog" as AppPathname, key: "blog" }, { href: "/favorites" as AppPathname, key: "favorites" }].map((item, i) => (
                    <motion.li key={item.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                      <Link
                        href={item.href}
                        className={cn("font-display block py-2 text-[2rem] leading-none", isActive(item.href) ? "text-gold-dark" : "text-navy")}
                      >
                        {t(`nav.${item.key}` as never)}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                  <LocaleSwitcher />
                  <CurrencySwitcher />
                </div>
                <button type="button" onClick={() => { setDrawer(false); openLeadModal({ type: "info" }); }} className="btn btn-gold w-full">
                  {t("ctaConsult")}
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
