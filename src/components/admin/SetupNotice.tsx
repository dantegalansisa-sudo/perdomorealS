import { Database } from "lucide-react";

const VARS = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", desc: "URL del proyecto (Project Settings → API)." },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", desc: "Clave pública anon." },
  { name: "SUPABASE_SERVICE_ROLE_KEY", desc: "Clave service role (solo servidor). Necesaria para leads, seed e invitar usuarios." },
];

export function SetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="card w-full max-w-2xl p-6 sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gold-soft text-gold-dark">
            <Database className="size-6" />
          </div>
          <div>
            <p className="eyebrow">PERDOMO · Admin</p>
            <h1 className="text-3xl text-navy sm:text-4xl">Supabase no configurado</h1>
          </div>
        </div>
        <p className="text-sm text-navy-soft">
          El panel de administración necesita una base de datos Supabase. Mientras tanto, el sitio público funciona con los datos de ejemplo
          incluidos. Para activar el panel:
        </p>
        <ol className="mt-6 space-y-5 text-sm text-navy-soft">
          <li>
            <p className="font-bold text-navy">1. Crea un proyecto en supabase.com y define estas variables de entorno</p>
            <p className="mt-1 text-xs text-stone">
              En local en <code className="rounded bg-sand-2 px-1">.env.local</code> (ver <code className="rounded bg-sand-2 px-1">.env.example</code>) y en tu
              hosting (Vercel → Settings → Environment Variables).
            </p>
            <ul className="mt-3 space-y-2">
              {VARS.map((v) => (
                <li key={v.name} className="rounded-xl border border-line bg-sand/60 px-3 py-2">
                  <code className="text-xs font-bold text-navy">{v.name}</code>
                  <p className="text-xs text-stone">{v.desc}</p>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <p className="font-bold text-navy">2. Ejecuta la migración de la base de datos</p>
            <p className="mt-1 text-xs text-stone">
              Copia el contenido de <code className="rounded bg-sand-2 px-1">supabase/migrations/0001_init.sql</code> en el SQL Editor de Supabase y ejecútalo
              (o usa <code className="rounded bg-sand-2 px-1">supabase db push</code>).
            </p>
          </li>
          <li>
            <p className="font-bold text-navy">3. Carga el contenido de ejemplo</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-navy px-4 py-3 text-xs text-sand">npm run seed</pre>
          </li>
          <li>
            <p className="font-bold text-navy">4. Crea tu usuario</p>
            <p className="mt-1 text-xs text-stone">
              En Supabase → Authentication → Users → “Add user”. El primer usuario creado se convierte automáticamente en administrador. Luego reinicia el
              servidor y entra en <code className="rounded bg-sand-2 px-1">/admin/login</code>.
            </p>
          </li>
        </ol>
        <a href="/es" className="btn btn-navy btn-sm mt-8">
          Ver sitio público
        </a>
      </div>
    </div>
  );
}
