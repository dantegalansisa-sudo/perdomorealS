"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

function authMessage(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg)) return "Debes confirmar tu correo antes de entrar.";
  if (/rate limit|too many/i.test(msg)) return "Demasiados intentos. Espera unos minutos.";
  return msg;
}

export function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-gold-soft/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[28rem] rounded-full bg-sand-3/70 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
        className="card relative w-full max-w-md p-7 shadow-2xl shadow-navy/10 sm:p-9"
      >
        <div className="mb-7 text-center">
          <p className="font-display text-3xl tracking-wide text-navy">
            PERDOMO <span className="text-gold">·</span> <span className="text-2xl text-gold-dark">ADMIN</span>
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone">Real Estate · Punta Cana</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const dest = next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createBrowserSupabase();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace(dest);
        router.refresh();
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/login/reset`,
      });
      if (error) throw error;
      setInfo("Si el correo existe, recibirás un enlace para crear una nueva contraseña.");
    } catch (err) {
      setError(authMessage(err instanceof Error ? err.message : "No se pudo iniciar sesión."));
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-center font-sans text-lg font-extrabold normal-case tracking-normal text-navy">
        {mode === "login" ? "Iniciar sesión" : "Recuperar contraseña"}
      </h1>
      <div>
        <label className="label" htmlFor="email">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="field pl-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>
      </div>
      {mode === "login" && (
        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              className="field px-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-navy"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      )}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      {info && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{info}</p>}
      <button type="submit" disabled={loading} className="btn btn-navy w-full disabled:opacity-60">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {mode === "login" ? "Entrar" : "Enviar enlace"}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "forgot" : "login");
          setError(null);
          setInfo(null);
        }}
        className="block w-full text-center text-xs font-bold text-stone hover:text-gold-dark"
      >
        {mode === "login" ? "¿Olvidaste tu contraseña?" : "← Volver a iniciar sesión"}
      </button>
    </form>
  );
}

/** Set a new password after following a recovery / invite link. */
export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Establish the session from the link (PKCE ?code= or implicit #access_token=).
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const supabase = createBrowserSupabase();
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) return setStatus("ready");
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          window.history.replaceState(null, "", window.location.pathname);
          return setStatus("ready");
        }
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          return setStatus("ready");
        }
        setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    const { error } = await createBrowserSupabase().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(authMessage(error.message));
    router.replace("/admin");
    router.refresh();
  }

  if (status === "checking")
    return (
      <p className="flex items-center justify-center gap-2 text-sm text-stone">
        <Loader2 className="size-4 animate-spin" /> Verificando enlace…
      </p>
    );
  if (status === "invalid")
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-navy-soft">El enlace no es válido o ya expiró. Solicita uno nuevo desde la pantalla de inicio de sesión.</p>
        <a href="/admin/login" className="btn btn-navy btn-sm">
          Ir a iniciar sesión
        </a>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-center font-sans text-lg font-extrabold normal-case tracking-normal text-navy">Crear nueva contraseña</h1>
      <div>
        <label className="label" htmlFor="pw">
          Nueva contraseña
        </label>
        <input id="pw" type="password" autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="pw2">
          Repite la contraseña
        </label>
        <input id="pw2" type="password" autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-navy w-full disabled:opacity-60">
        {loading && <Loader2 className="size-4 animate-spin" />} Guardar y entrar
      </button>
    </form>
  );
}
