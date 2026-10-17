import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IsoVilla } from "@/components/ui/IsoVilla";

export default async function NotFound() {
  const t = await getTranslations("common.notFound");
  return (
    <section className="container-x grid min-h-[80vh] items-center gap-10 pt-28 pb-10 lg:grid-cols-2">
      <div>
        <p className="font-display text-[7rem] leading-none text-gold sm:text-[10rem]">404</p>
        <h1 className="text-5xl text-navy sm:text-6xl">{t("title")}</h1>
        <p className="mt-4 max-w-md text-stone">{t("text")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-navy">
            {t("home")}
          </Link>
          <Link href="/properties" className="btn btn-gold">
            {t("properties")}
          </Link>
        </div>
      </div>
      <IsoVilla className="mx-auto w-full max-w-lg opacity-90" />
    </section>
  );
}
