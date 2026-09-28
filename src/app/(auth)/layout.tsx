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
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-18 pb-3 z-10">
        {children}
      </main>
    </div>
  );
}
