import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col justify-between selection:bg-brand-red selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Top Navigation Bar with Home Link */}
      <header className="w-full max-w-xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-start z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
      </header>

      {/* Centered Main Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-6 sm:py-8 z-10">
        {children}
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="py-4 px-4 text-center text-[11px] text-zinc-600 z-10">
        <p>© 2026 CK Condo Drop Hub • Buildersville Condominium Community Platform</p>
      </footer>
    </div>
  );
}
