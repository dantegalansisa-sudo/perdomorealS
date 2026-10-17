import { anton, manrope } from "./fonts";

/** Fallback 404 for paths outside the localized tree (bilingual, no i18n context available). */
export default function RootNotFound() {
  return (
    <html lang="es" className={`${anton.variable} ${manrope.variable}`}>
      <body className="grid min-h-dvh place-items-center bg-sand p-6 text-center text-navy">
        <div>
          <p className="font-display text-[8rem] leading-none text-gold">404</p>
          <h1 className="text-4xl">Página no encontrada · Page not found</h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/es" className="btn btn-navy">
              Ir al inicio
            </a>
            <a href="/en" className="btn btn-gold">
              Go to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
