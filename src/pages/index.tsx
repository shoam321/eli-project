import AppShell from "@/components/layout/AppShell";
import OperationsDashboard from "@/components/operations/OperationsDashboard";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();

  return (
    <AppShell
      title={t("dashboardTitle")}
      subtitle={t("dashboardSubtitle")}
      activePath="/"
    >
      <OperationsDashboard />
    </AppShell>
  );
}
