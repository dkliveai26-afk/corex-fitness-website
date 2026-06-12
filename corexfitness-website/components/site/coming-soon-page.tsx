import { PageShell } from "@/components/site/page-shell";

export function ComingSoonPage() {
  return (
    <PageShell>
      <section className="section-shell flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center shadow-card">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">CORE X FITNESS</p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">Coming Soon</h1>
        </div>
      </section>
    </PageShell>
  );
}
