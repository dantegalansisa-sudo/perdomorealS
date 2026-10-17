import "./globals.css";

/** Root passthrough: <html> lives in [locale]/layout.tsx and admin/layout.tsx. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
