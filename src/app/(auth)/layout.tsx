import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-surface flex flex-col justify-between">
      {/* Auth Header */}
      <header className="py-5 px-4 border-b border-brand-border bg-white">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 py-1">
            <Image
              src="/brand/logo.webp"
              alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <Link href="/" className="text-xs font-semibold text-brand-text-secondary hover:text-brand-red transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Auth Content Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-brand-border shadow-xl p-6 sm:p-8">
          {children}
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="py-4 text-center text-xs text-brand-text-secondary border-t border-brand-border bg-white">
        <p>© 2026 CK Condo Drop Hub • CK Buildersville Condominium Community Hub</p>
      </footer>
    </div>
  );
}
