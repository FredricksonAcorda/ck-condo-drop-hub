import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-surface via-white to-brand-surface flex flex-col justify-between">
      {/* Auth Top Bar */}
      <header className="py-4 px-4 sm:px-6 border-b border-brand-border/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 py-1 group select-none" aria-label="CK Condo Drop Hub Home">
            <Image
              src="/brand/logo.webp"
              alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
              width={240}
              height={68}
              className="h-9 sm:h-10 w-auto max-h-[40px] object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </Link>

          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-red transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-brand-surface"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Auth Content Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6 sm:my-10">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-brand-border/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-9 transition-all">
          {children}
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="py-4 px-4 text-center text-xs text-brand-text-secondary border-t border-brand-border/70 bg-white">
        <p className="max-w-md mx-auto leading-relaxed">
          © 2026 CK Condo Drop Hub • C1 Buildersville Condominium Community Hub
        </p>
      </footer>
    </div>
  );
}
