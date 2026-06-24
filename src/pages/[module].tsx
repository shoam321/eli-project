import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import OperationsModulePage from "@/components/operations/OperationsModulePage";
import AppShell from "@/components/layout/AppShell";
import { getModuleDefinition } from "@/lib/module-config";

const ModulePage: NextPage = () => {
  const router = useRouter();
  const moduleParam = router.query.module;
  const slug = Array.isArray(moduleParam) ? moduleParam[0] : moduleParam ?? "";
  const module = getModuleDefinition(slug);

  if (!module) {
    return (
      <AppShell title="Module Not Found" subtitle="The requested workspace route does not exist.">
        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">Unknown workspace module</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The requested route is not part of the restored iLab workspace. Go back to the dashboard to choose an active module.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={module.title} subtitle={module.subtitle} activePath={`/${module.slug}`}>
      <OperationsModulePage module={module} />
    </AppShell>
  );
};

export default ModulePage;
