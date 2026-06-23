import type { PropsWithChildren } from "react";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              iLab Manager
            </p>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            Next.js + Supabase
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
