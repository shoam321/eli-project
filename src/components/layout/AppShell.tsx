import Link from "next/link";
import type { PropsWithChildren } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import WorkspaceAuthGate from "@/components/auth/WorkspaceAuthGate";
import { useLanguage } from "@/lib/language-context";
import { moduleDefinitions, moduleOrder } from "@/lib/module-config";
import { useWorkspace } from "@/lib/workspace-data";

type AppShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  activePath?: string;
}>;

const moduleSlugToTranslationKey: Record<string, string> = {
  projects: "moduleProjects",
  "draft-projects": "moduleDraftProjects",
  clients: "moduleClients",
  suppliers: "moduleSuppliers",
  parts: "moduleParts",
  orders: "moduleOrders",
  devices: "moduleDevices",
  cashiers: "moduleCashier",
  brands: "moduleBrands",
  models: "moduleModels",
};

export default function AppShell({ title, subtitle, activePath, children }: AppShellProps) {
  const { isBusy, session, signOut, status } = useWorkspace();
  const { t } = useLanguage();
  const sessionUser = session?.user;

  const navItems = [
    { href: "/", label: t("dashboard") },
    ...moduleOrder
      .filter((slug) => moduleDefinitions[slug].navGroup === "operations")
      .map((slug) => ({
        href: `/${slug}`,
        label: moduleSlugToTranslationKey[slug] ? t(moduleSlugToTranslationKey[slug] as Parameters<typeof t>[0]) : moduleDefinitions[slug].title,
      })),
    { href: "/settings", label: t("settings") },
    ...moduleOrder
      .filter((slug) => moduleDefinitions[slug].navGroup === "reference")
      .map((slug) => ({
        href: `/${slug}`,
        label: moduleSlugToTranslationKey[slug] ? t(moduleSlugToTranslationKey[slug] as Parameters<typeof t>[0]) : moduleDefinitions[slug].title,
      })),
  ];

  if (status !== "ready") {
    return <WorkspaceAuthGate />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.65),_transparent_28%),linear-gradient(135deg,_#f8f5ee_0%,_#edf7f6_52%,_#f4efe6_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6 lg:py-6">
        <aside className="rounded-[2rem] border border-white/60 bg-slate-950/96 p-6 text-slate-100 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.88)] backdrop-blur">
          <div className="border-b border-white/10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">{t("brandName")}</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">{t("workspaceTitle")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {t("workspaceSubtitle")}
            </p>
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-medium text-white">{t("signedInAs")}</p>
              <p className="mt-1 break-all">{sessionUser?.email ?? sessionUser?.id ?? t("unknownAccount")}</p>
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
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{t("navOpen")}</span>
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
            {isBusy ? t("working") : t("signOut")}
          </button>
        </aside>

        <div className="space-y-6">
          <header className="rounded-[2rem] border border-white/60 bg-white/72 px-6 py-5 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.38)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">{t("recoveredSurface")}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                  {t("supabaseSync")}
                </span>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
