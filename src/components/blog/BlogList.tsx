"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { Locale, Post } from "@/lib/types";

/** Category chips filtering a list of pre-rendered cards (cards are server-rendered and passed in). */
export function BlogList({ posts, cards, locale }: { posts: Post[]; cards: Record<string, React.ReactNode>; locale: Locale }) {
  const t = useTranslations("pages.blog");
  const [cat, setCat] = useState<string>("");
  const cats = [...new Set(posts.map((p) => p.category))];
  const shown = cat ? posts.filter((p) => p.category === cat) : posts;
  return (
    <div lang={locale}>
      <div className="mb-10 flex flex-wrap gap-2" role="group">
        <button type="button" className="chip" data-active={cat === ""} aria-pressed={cat === ""} onClick={() => setCat("")}>
          {t("all")}
        </button>
        {cats.map((c) => (
          <button key={c} type="button" className="chip" data-active={cat === c} aria-pressed={cat === c} onClick={() => setCat(c)}>
            {t(`categories.${c}` as never)}
          </button>
        ))}
      </div>
      <motion.ul layout className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.li key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {cards[p.id]}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
