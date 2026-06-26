import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import OperationsModulePage from "@/components/operations/OperationsModulePage";
import AppShell from "@/components/layout/AppShell";
import { useLanguage } from "@/lib/language-context";
import { useLocalizedModuleConfig } from "@/lib/module-i18n";

const ModulePage: NextPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const moduleParam = router.query.module;
  const slug = Array.isArray(moduleParam) ? moduleParam[0] : moduleParam ?? "";
  const moduleConfig = useLocalizedModuleConfig(slug);

  if (!moduleConfig) {
    return (
      <AppShell title={t("moduleNotFound")} subtitle={t("moduleNotFoundSubtitle")}>
        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">{t("unknownModule")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {t("unknownModuleDesc")}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {t("returnToDashboard")}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={moduleConfig.title} subtitle={moduleConfig.subtitle} activePath={`/${moduleConfig.slug}`}>
      <OperationsModulePage moduleConfig={moduleConfig} />
    </AppShell>
  );
};

export default ModulePage;
