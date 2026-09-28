import AuthHeader from "@/components/layout/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white sm:bg-slate-100/70 text-zinc-900 flex flex-col justify-between selection:bg-brand-red selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Floating Pill Top Navigation matching Home Page */}
      <AuthHeader />

      {/* Centered Main Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-8 z-10">
        {children}
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="py-4 px-4 text-center text-[12px] text-zinc-500 font-medium z-10">
        <p>© 2026 CK Condo Drop Hub • Buildersville Condominium Community Platform</p>
      </footer>
    </div>
  );
}
