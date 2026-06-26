import Link from "next/link";

import { useLanguage } from "@/lib/language-context";
import { moduleDefinitions, moduleOrder } from "@/lib/module-config";
import { useWorkspace, useWorkspaceState, type WorkspaceState } from "@/lib/workspace-data";

const moduleSlugToTitleKey: Record<string, string> = {
  projects: "moduleProjects",
  "draft-projects": "moduleDraftProjects",
  clients: "moduleClients",
  suppliers: "moduleSuppliers",
  parts: "moduleParts",
  orders: "moduleOrders",
  devices: "moduleDevices",
  products: "moduleProducts",
  cashiers: "moduleCashier",
  brands: "moduleBrands",
  models: "moduleModels",
};

const moduleSlugToSubtitleKey: Record<string, string> = {
  projects: "moduleProjectsSubtitle",
  "draft-projects": "moduleDraftProjectsSubtitle",
  clients: "moduleClientsSubtitle",
  suppliers: "moduleSuppliersSubtitle",
  parts: "modulePartsSubtitle",
  orders: "moduleOrdersSubtitle",
  devices: "moduleDevicesSubtitle",
  products: "moduleProductsSubtitle",
  cashiers: "moduleCashierSubtitle",
  brands: "moduleBrandsSubtitle",
  models: "moduleModelsSubtitle",
};

const moduleSlugToDescKey: Record<string, string> = {
  projects: "moduleProjectsDesc",
  "draft-projects": "moduleDraftProjectsDesc",
  clients: "moduleClientsDesc",
  suppliers: "moduleSuppliersDesc",
  parts: "modulePartsDesc",
  orders: "moduleOrdersDesc",
  devices: "moduleDevicesDesc",
  products: "moduleProductsDesc",
  cashiers: "moduleCashierDesc",
  brands: "moduleBrandsDesc",
  models: "moduleModelsDesc",
};

export default function OperationsDashboard() {
  const { session } = useWorkspace();
  const state = useWorkspaceState();
  const { t } = useLanguage();

  const operations = moduleOrder.filter((slug) => moduleDefinitions[slug].navGroup === "operations");
  const references = moduleOrder.filter((slug) => moduleDefinitions[slug].navGroup === "reference");

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_30px_120px_-45px_rgba(14,49,55,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              {t("brandName")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {t("workspaceTitle")}
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              {t("dashboardDesc")} {session?.user.email ?? t("workspaceTitle")}.
            </p>
          </div>
          <div className="grid min-w-[16rem] gap-3 rounded-[1.5rem] bg-slate-950 p-4 text-slate-100 shadow-lg">
            <p className="text-xs uppercase tracking-[0.26em] text-teal-300">{t("recoveryStatus")}</p>
            <div className="grid gap-2 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span>{t("webDeployment")}</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">{t("live")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t("supabaseSchema")}</span>
                <span className="rounded-full bg-sky-500/15 px-2 py-1 text-xs font-medium text-sky-300">{t("live")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{t("authenticatedUser")}</span>
                <span className="rounded-full bg-teal-500/15 px-2 py-1 text-xs font-medium text-teal-300">{t("connected")}</span>
              </div>
            </div>
            <Link
              href="/settings"
              className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-slate-900 transition hover:bg-teal-100"
            >
              {t("openRecoveryControls")}
            </Link>
          </div>
        </div>
      </section>

      <ModuleSection
        title={t("operations")}
        description={t("operationsDesc")}
        slugs={operations}
        state={state}
      />

      <ModuleSection
        title={t("referenceData")}
        description={t("referenceDataDesc")}
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
  const { t } = useLanguage();

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
          const titleKey = moduleSlugToTitleKey[slug];
          const subtitleKey = moduleSlugToSubtitleKey[slug];
          const descKey = moduleSlugToDescKey[slug];
          const translatedTitle = titleKey ? t(titleKey as Parameters<typeof t>[0]) : moduleConfig.title;
          const translatedSubtitle = subtitleKey ? t(subtitleKey as Parameters<typeof t>[0]) : moduleConfig.subtitle;
          const translatedDesc = descKey ? t(descKey as Parameters<typeof t>[0]) : moduleConfig.description;

          return (
            <Link
              key={slug}
              href={`/${slug}`}
              className="group rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[0_30px_90px_-42px_rgba(14,116,144,0.35)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">
                    {moduleConfig.navGroup === "operations" ? t("workspaceTitle") : t("referenceData")}
                  </p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {translatedTitle}
                  </h4>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 transition group-hover:bg-teal-50 group-hover:text-teal-700">
                  {count}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{translatedDesc}</p>
              <p className="mt-4 text-sm font-medium text-slate-700">{translatedSubtitle}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
