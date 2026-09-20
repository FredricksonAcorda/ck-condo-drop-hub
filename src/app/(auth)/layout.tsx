import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-surface flex flex-col justify-between">
      {/* Auth Header */}
      <header className="py-6 px-4 border-b border-brand-border bg-white">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center shadow">
              <span className="font-[family-name:var(--font-heading)] text-white text-xl font-bold">D</span>
            </div>
            <div className="font-[family-name:var(--font-heading)] text-sm leading-none tracking-wide">
              <span className="text-brand-black">CK CONDO</span>
              <br />
              <span className="text-brand-red">DROP</span>{" "}
              <span className="text-brand-black">HUB</span>
            </div>
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
