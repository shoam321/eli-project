import Link from "next/link";
import type { PropsWithChildren } from "react";

import WorkspaceAuthGate from "@/components/auth/WorkspaceAuthGate";
import { moduleDefinitions, moduleOrder } from "@/lib/module-config";
import { useWorkspace } from "@/lib/workspace-data";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  activePath?: string;
}>;

const navItems = [
  { href: "/", label: "Dashboard" },
  ...moduleOrder
    .filter((slug) => moduleDefinitions[slug].navGroup === "operations")
    .map((slug) => ({ href: `/${slug}`, label: moduleDefinitions[slug].title })),
  { href: "/settings", label: "Settings" },
  ...moduleOrder
    .filter((slug) => moduleDefinitions[slug].navGroup === "reference")
    .map((slug) => ({ href: `/${slug}`, label: moduleDefinitions[slug].title })),
];

export default function AppShell({ title, subtitle, activePath, children }: AppShellProps) {
  const { isBusy, session, signOut, status } = useWorkspace();
  const sessionUser = session?.user;

  if (status !== "ready") {
    return <WorkspaceAuthGate />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.65),_transparent_28%),linear-gradient(135deg,_#f8f5ee_0%,_#edf7f6_52%,_#f4efe6_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6 lg:py-6">
        <aside className="rounded-[2rem] border border-white/60 bg-slate-950/96 p-6 text-slate-100 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.88)] backdrop-blur">
          <div className="border-b border-white/10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">iLab Manager</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Operations Workspace</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Restored web control panel backed by authenticated Supabase workspace data.
            </p>
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-medium text-white">Signed in as</p>
              <p className="mt-1 break-all">{sessionUser?.email ?? sessionUser?.id ?? "Unknown account"}</p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const isActive = activePath ? activePath === item.href : item.href === "/";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center justify-between rounded-full px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-slate-950 shadow-lg"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Open</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            disabled={isBusy}
            className="mt-6 w-full rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Working..." : "Sign Out"}
          </button>
        </aside>

        <div className="space-y-6">
          <header className="rounded-[2rem] border border-white/60 bg-white/72 px-6 py-5 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.38)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">Recovered Web Surface</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Supabase sync
              </span>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
