import Link from "next/link";

import { moduleDefinitions, moduleOrder } from "@/lib/module-config";
import { useWorkspace, useWorkspaceState, type WorkspaceState } from "@/lib/workspace-data";

export default function OperationsDashboard() {
  const { session } = useWorkspace();
  const state = useWorkspaceState();

  const operations = moduleOrder.filter((slug) => moduleDefinitions[slug].navGroup === "operations");
  const references = moduleOrder.filter((slug) => moduleDefinitions[slug].navGroup === "reference");

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_30px_120px_-45px_rgba(14,49,55,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              Migration Workspace
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              The original iLab modules are back online in the web app.
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              This workspace now exposes projects, clients, suppliers, parts, orders, devices, cashier records,
              and reference catalogs from the original product surface. Records are now synced through Supabase
              under the authenticated account for {session?.user.email ?? "your workspace"}.
            </p>
          </div>
          <div className="grid min-w-[16rem] gap-3 rounded-[1.5rem] bg-slate-950 p-4 text-slate-100 shadow-lg">
            <p className="text-xs uppercase tracking-[0.26em] text-teal-300">Recovery Status</p>
            <div className="grid gap-2 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span>Web deployment</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">Live</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Legacy API</span>
                <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-300">Offline</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Supabase schema</span>
                <span className="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-medium text-sky-300">Live</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Authenticated user</span>
                <span className="rounded-full bg-teal-500/15 px-2 py-1 text-xs font-medium text-teal-300">Connected</span>
              </div>
            </div>
            <Link
              href="/settings"
              className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-slate-900 transition hover:bg-teal-100"
            >
              Open Recovery Controls
            </Link>
          </div>
        </div>
      </section>

      <ModuleSection
        title="Operations"
        description="Daily modules restored from the original mobile workflow."
        slugs={operations}
        state={state}
      />

      <ModuleSection
        title="Reference Data"
        description="Catalog surfaces that support intake, devices, and parts planning."
        slugs={references}
        state={state}
      />
    </div>
  );
}

function ModuleSection({
  title,
  description,
  slugs,
  state,
}: {
  title: string;
  description: string;
  slugs: (typeof moduleOrder)[number][];
  state: WorkspaceState | null;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slugs.map((slug) => {
          const moduleConfig = moduleDefinitions[slug];
          const count = state?.[slug]?.length ?? 0;

          return (
            <Link
              key={slug}
              href={`/${slug}`}
              className="group rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_30px_90px_-42px_rgba(14,116,144,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">
                    {moduleConfig.navGroup === "operations" ? "Workspace" : "Catalog"}
                  </p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {moduleConfig.title}
                  </h4>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 transition group-hover:bg-teal-50 group-hover:text-teal-700">
                  {count}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{moduleConfig.description}</p>
              <p className="mt-4 text-sm font-medium text-slate-700">{moduleConfig.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
